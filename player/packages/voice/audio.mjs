export class PushToTalkCapture {
  constructor(media = navigator.mediaDevices) {
    this.media = media;
    this.generation = 0;
    this.recorder = null;
    this.stream = null;
  }
  async start({ onChunk, retainAudio = true } = {}) {
    const generation = ++this.generation;
    const stream = await this.media.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false,
    });
    if (generation !== this.generation) {
      stream.getTracks().forEach((t) => t.stop());
      return false;
    }
    this.stream = stream;
    const mimeType = ['audio/webm;codecs=opus', 'audio/mp4'].find((t) =>
      MediaRecorder.isTypeSupported(t),
    );
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    this.recorder = recorder;
    const chunks = [];
    this.result = new Promise((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size) {
          if (retainAudio) chunks.push(event.data);
          onChunk?.(event.data);
        }
      };
      recorder.onerror = () => reject(new Error('Microphone recording failed'));
      recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType }));
    });
    // Attach rejection immediately even if the user has not released the button.
    this.result.catch(() => {});
    recorder.start(onChunk ? 100 : undefined);
    return true;
  }
  async stop() {
    this.generation++;
    if (!this.recorder) return null;
    const result = this.result;
    if (this.recorder.state !== 'inactive') this.recorder.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.recorder = null;
    this.stream = null;
    return result;
  }
}
