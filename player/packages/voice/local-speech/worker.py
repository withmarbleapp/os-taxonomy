"""Persistent, offline speech engine. JSONL stdin/stdout; stdout is protocol only."""
import base64
import io
import json
import os
from pathlib import Path
import queue
import sys
import threading

os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["HF_HUB_DISABLE_TELEMETRY"] = "1"
os.environ["DO_NOT_TRACK"] = "1"
ROOT = Path(__file__).resolve().parent / "models"
jobs = queue.Queue(maxsize=8)
cancelled = {}
lock = threading.Lock()

def emit(event):
    print(json.dumps(event, separators=(",", ":")), flush=True)

def read_input():
    try:
        for line in sys.stdin:
            if len(line) > 6_000_000:
                raise ValueError("Request too large")
            event = json.loads(line)
            if event.get("op") == "cancel":
                with lock:
                    # Node only cancels active requests; cap stale identifiers.
                    if len(cancelled) >= 256:
                        cancelled.pop(next(iter(cancelled)))
                    cancelled[event["id"]] = True
            else:
                try:
                    jobs.put_nowait(event)
                except queue.Full:
                    emit({"id": event["id"], "type": "error", "message": "Local speech queue is full"})
    finally:
        jobs.put(None)

def is_cancelled(id):
    with lock:
        return id in cancelled

def split_text(text):
    while text:
        end = len(text) if len(text) <= 220 else text.rfind(" ", 0, 220)
        if end <= 0:
            end = min(220, len(text))
        yield text[:end]
        text = text[end:].lstrip()

def main():
    engine = sys.argv[1]
    implementation = None
    import numpy as np
    if engine in ("stt", "tts"):
        import onnxruntime as ort
        ort.disable_telemetry_events()
    if engine in ("moonshine", "phonon"):
        from ondevice_engines import MoonshineEngine, PhononEngine
        implementation = (MoonshineEngine if engine == "moonshine" else PhononEngine)(ROOT)
        emit(implementation.info)
    elif engine == "stt":
        from faster_whisper import WhisperModel
        model = WhisperModel(str(ROOT / "base.en"), device="cpu", compute_type="int8", cpu_threads=4, num_workers=1, local_files_only=True)
        # Warm model execution before declaring readiness.
        list(model.transcribe(np.zeros(16000, dtype=np.float32), language="en", beam_size=1, vad_filter=True)[0])
        emit({"type": "ready", "model": "faster-whisper/base.en", "device": "cpu", "computeType": "int8"})
    elif engine == "tts":
        from piper import PiperVoice
        from piper.config import PiperConfig
        path = ROOT / "piper/en/en_US/lessac/medium/en_US-lessac-medium.onnx"
        options = ort.SessionOptions()
        options.intra_op_num_threads = 4
        options.inter_op_num_threads = 1
        voice = PiperVoice(config=PiperConfig.from_dict(json.loads(Path(str(path) + ".json").read_text())), session=ort.InferenceSession(str(path), sess_options=options, providers=["CPUExecutionProvider"]))
        list(voice.synthesize("Ready."))
        emit({"type": "ready", "model": "piper/en_US-lessac-medium", "sampleRate": voice.config.sample_rate})
    else:
        raise ValueError("Unknown engine")
    threading.Thread(target=read_input, daemon=True).start()
    while (job := jobs.get()) is not None:
        id = job["id"]
        try:
            if is_cancelled(id):
                continue
            if implementation:
                implementation.handle(job, emit, is_cancelled)
            elif engine == "stt" and job["op"] == "transcribe":
                raw = base64.b64decode(job["audio"], validate=True)
                if len(raw) > 4_000_000:
                    raise ValueError("Audio too large")
                if job.get("pcm"):
                    if len(raw) % 2 or len(raw) > 992_000:
                        raise ValueError("Invalid 16 kHz PCM")
                    audio = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
                else:
                    from faster_whisper.audio import decode_audio
                    audio = decode_audio(io.BytesIO(raw), sampling_rate=16000)
                if len(audio) > 496_000:
                    raise ValueError("Audio exceeds recording limit")
                text = []
                if len(audio):
                    segments, _ = model.transcribe(audio, language="en", beam_size=1, vad_filter=True, condition_on_previous_text=False, vad_parameters={"min_silence_duration_ms": 300})
                    for segment in segments:
                        if is_cancelled(id):
                            break
                        text.append(segment.text.strip())
                if not is_cancelled(id):
                    emit({"id": id, "type": "done", "text": " ".join(text).strip()})
            elif engine == "tts" and job["op"] == "synthesize":
                text = job["text"]
                if not isinstance(text, str) or len(text) > 5000:
                    raise ValueError("Invalid text")
                for phrase in split_text(text):
                    if is_cancelled(id):
                        break
                    for chunk in voice.synthesize(phrase):
                        if is_cancelled(id):
                            break
                        emit({"id": id, "type": "audio", "audio": base64.b64encode(chunk.audio_int16_bytes).decode("ascii")})
                if not is_cancelled(id):
                    emit({"id": id, "type": "done"})
            else:
                raise ValueError("Unknown speech operation")
        except Exception:
            # Don't log learner audio/text or native exception payloads.
            emit({"id": id, "type": "error", "message": "Local speech inference failed"})
        finally:
            with lock:
                cancelled.pop(id, None)

if __name__ == "__main__":
    try:
        main()
    except Exception:
        emit({"type": "fatal", "message": "Local speech model could not load. Run npm run setup:local-speech."})
        sys.exit(1)
