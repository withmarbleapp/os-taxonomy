// AudioContext supplies mono audio at 16 kHz. Transfer 300 ms PCM packets.
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Int16Array(4800);
    this.used = 0;
    this.finished = false;
    this.port.onmessage = ({ data }) => {
      if (data === 'finish') {
        this.flush();
        this.finished = true;
        this.port.postMessage('finished');
      }
    };
  }
  flush() {
    if (!this.used) return;
    const bytes = new ArrayBuffer(this.used * 2),
      view = new DataView(bytes);
    for (let i = 0; i < this.used; i++) view.setInt16(i * 2, this.buffer[i], true);
    this.port.postMessage(bytes, [bytes]);
    this.used = 0;
  }
  process(inputs) {
    if (this.finished) return false;
    const samples = inputs[0]?.[0];
    if (samples)
      for (const value of samples) {
        const clamped = Math.max(-1, Math.min(1, value));
        this.buffer[this.used++] = Math.round(clamped * (clamped < 0 ? 32768 : 32767));
        if (this.used === this.buffer.length) this.flush();
      }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCaptureProcessor);
