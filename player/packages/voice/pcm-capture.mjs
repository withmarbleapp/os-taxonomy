export class StreamingPcmCapture {
  constructor(media = navigator.mediaDevices) {
    this.media = media;
    this.generation = 0;
    this.active = null;
  }
  async start({ onChunk }) {
    const generation = ++this.generation;
    const stream = await this.media.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      video: false,
    });
    if (generation !== this.generation) {
      stream.getTracks().forEach((t) => t.stop());
      return false;
    }
    const context = new AudioContext({ sampleRate: 16000, latencyHint: 'interactive' });
    const active = { stream, context };
    this.active = active;
    try {
      await context.audioWorklet.addModule('/src/pcm-worklet.mjs');
      if (generation !== this.generation) return false;
      if (context.sampleRate !== 16000)
        throw new Error('Microphone requires a 16 kHz audio context');
      const source = context.createMediaStreamSource(stream),
        node = new AudioWorkletNode(context, 'pcm-capture', {
          channelCount: 1,
          channelCountMode: 'explicit',
        });
      const silent = context.createGain();
      silent.gain.value = 0;
      Object.assign(active, { source, node, silent });
      active.finished = new Promise((resolve) => {
        active.resolve = resolve;
      });
      node.port.onmessage = ({ data }) => {
        if (data === 'finished') active.resolve();
        else onChunk(data);
      };
      source.connect(node);
      node.connect(silent);
      silent.connect(context.destination);
      await context.resume();
      return generation === this.generation;
    } catch (error) {
      if (this.active === active) await this.stop();
      throw error;
    }
  }
  async stop() {
    this.generation++;
    const active = this.active;
    this.active = null;
    if (!active) return null;
    try {
      if (active.node) {
        active.source.disconnect();
        active.node.port.postMessage('finish');
        let timer;
        try {
          await Promise.race([
            active.finished,
            new Promise((_, reject) => {
              timer = setTimeout(() => reject(new Error('Microphone flush timed out')), 1500);
            }),
          ]);
        } finally {
          clearTimeout(timer);
          active.node.port.onmessage = null;
          active.node.disconnect();
          active.silent.disconnect();
        }
      }
      return new Blob([], { type: 'audio/pcm' });
    } finally {
      active.stream.getTracks().forEach((t) => t.stop());
      await active.context.close();
    }
  }
}
