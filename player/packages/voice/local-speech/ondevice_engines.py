"""Official Moonshine streaming and Phonon desktop runtimes, explicit local paths."""
import base64
import io
import numpy as np

def audio_from_job(job):
    raw = base64.b64decode(job["audio"], validate=True)
    if len(raw) > 4_000_000:
        raise ValueError("Audio too large")
    if job.get("pcm", True):
        if len(raw) % 2 or len(raw) > 992_000:
            raise ValueError("Invalid PCM")
        return np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    import av
    with av.open(io.BytesIO(raw)) as container:
        resampler = av.AudioResampler(format="fltp", layout="mono", rate=16000)
        chunks = []
        size = 0
        for frame in container.decode(audio=0):
            for converted in resampler.resample(frame):
                chunk = converted.to_ndarray().reshape(-1)
                size += len(chunk)
                if size > 496_000:
                    raise ValueError("Recording too long")
                chunks.append(chunk)
        for converted in resampler.resample(None):
            chunks.append(converted.to_ndarray().reshape(-1))
    return np.concatenate(chunks) if chunks else np.zeros(0, dtype=np.float32)

class MoonshineEngine:
    def __init__(self, root):
        from moonshine_voice import Transcriber, ModelArch
        self.model = Transcriber(model_path=str(root / "moonshine"), model_arch=ModelArch.SMALL_STREAMING)
        self.streams = {}
        self.info = {"type": "ready", "model": "moonshine/small-streaming-en", "device": "cpu", "nativeStreaming": True}

    def handle(self, job, emit, cancelled):
        from moonshine_voice import TranscriptEventListener
        op = job["op"]
        text = ""
        if op == "transcribe":
            audio = audio_from_job(job)
            if len(audio):
                result = self.model.transcribe_without_streaming(audio.tolist(), 16000)
                text = " ".join(line.text.strip() for line in result.lines).strip()
        elif op == "start":
            if len(self.streams) >= 8:
                raise ValueError("Too many streams")
            class Listener(TranscriptEventListener):
                def __init__(self):
                    self.lines = {}
                    self.error = None
                def remember(self, event):
                    self.lines[event.line.line_id] = event.line
                on_line_started = remember
                on_line_updated = remember
                on_line_text_changed = remember
                on_line_completed = remember
                def on_error(self, event):
                    self.error = True
            listener = Listener()
            stream = self.model.create_stream(update_interval=0.5)
            stream.add_listener(listener)
            stream.start()
            self.streams[job["streamId"]] = (stream, listener, 0)
        elif op == "drop":
            state = self.streams.pop(job["streamId"], None)
            if state:
                state[0].close()
        elif op in ("audio", "end"):
            key = job["streamId"]
            stream, listener, size = self.streams[key]
            if op == "audio":
                audio = audio_from_job(job)
                size += len(audio)
                if size > 496_000:
                    raise ValueError("Recording too long")
                self.streams[key] = (stream, listener, size)
                stream.add_audio(audio.tolist(), 16000)
            else:
                try:
                    result = stream.stop()
                    if result is None or listener.error:
                        raise ValueError("Incomplete Moonshine finalization")
                finally:
                    stream.close()
                    self.streams.pop(key, None)
            text = " ".join(line.text.strip() for line in sorted(listener.lines.values(), key=lambda line: line.start_time)).strip()
            if listener.error:
                raise ValueError("Moonshine transcription failed")
        else:
            raise ValueError("Unknown recognition operation")
        if not cancelled(job["id"]):
            emit({"id": job["id"], "type": "done", "text": text})

class PhononEngine:
    def __init__(self, root):
        import ptts
        ptts.set_num_threads(4)
        self.model = ptts.TTS(str(root / "phonon"), lang="en", device="cpu", quant="q8_0", voice_catalog=str(root / "phonon/voices"))
        if "Freya" not in self.model.voices:
            raise ValueError("Missing local Freya voice")
        self.model.synth("Ready.", voice="Freya")
        self.info = {"type": "ready", "model": "phonon/31m-en", "voice": "Freya", "sampleRate": self.model.sample_rate, "device": self.model.device, "quant": self.model.quant}

    def handle(self, job, emit, cancelled):
        if job["op"] != "synthesize" or not isinstance(job.get("text"), str) or len(job["text"]) > 5000:
            raise ValueError("Invalid speech request")
        with self.model.stream(job["text"], voice="Freya") as audio:
            for chunk in audio:
                if cancelled(job["id"]):
                    break
                pcm = np.rint(np.clip(chunk, -1, 1) * 32767).astype("<i2").tobytes()
                emit({"id": job["id"], "type": "audio", "audio": base64.b64encode(pcm).decode("ascii")})
        if not cancelled(job["id"]):
            emit({"id": job["id"], "type": "done"})
