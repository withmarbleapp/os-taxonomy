import { SpeechOutput } from './speech-output.mjs';
// Browser-only speech: this module is shared by Electron and a future web player.
import { PhononTTS } from '/speech-vendor/phonon/index.js';
export class BrowserSpeech {
  ready = false;
  pending = new Map();
  nextId = 0;
  async load(onProgress = () => {}) {
    if (this.ready) return;
    if (this.loading) return this.loading;
    this.loading = this.initialize(onProgress).finally(() => {
      this.loading = null;
    });
    return this.loading;
  }
  async initialize(onProgress) {
    try {
      const manifest = await fetch('/voice/browser-models.json').then((r) => r.json());
      this.worker = new Worker('/voice/browser-stt-worker.mjs', { type: 'module' });
      this.worker.onmessage = ({ data }) => {
        if (data.fatal) {
          this.dispose(Error(data.fatal));
          return;
        }
        if (data.progress) {
          onProgress('Preparing listening…');
          return;
        }
        const p = this.pending.get(data.id);
        if (!p) return;
        this.pending.delete(data.id);
        clearTimeout(p.timer);
        data.error ? p.reject(Error(data.error)) : p.resolve(data.result);
      };
      this.worker.onerror = () =>
        this.dispose(Error('Listening could not start. Please retry voice setup.'));
      onProgress('Preparing listening…');
      const files = Object.fromEntries(
        manifest.files
          .filter((f) => f.path.startsWith('moonshine/'))
          .map((f) => [f.path.slice(10), '/speech-models/' + f.path]),
      );
      await this.call({ action: 'load', files });
      onProgress('Preparing speaking…');
      let expired = false,
        timer;
      const loading = PhononTTS.load({
        lang: 'en',
        device: 'cpu',
        threads: 3,
        cache: false,
        model: {
          weights: { q8: '/speech-models/phonon/model.q8.gguf' },
          config: '/speech-models/phonon/config.json',
          tokenizer: '/speech-models/phonon/tokenizer.json',
          voices: { Freya: '/speech-models/phonon/voices/Freya.safetensors' },
          defaultVoice: 'Freya',
        },
      }).then((tts) => {
        if (expired) {
          tts.dispose();
          throw Error('Voice setup timed out');
        }
        return tts;
      });
      try {
        this.tts = await Promise.race([
          loading,
          new Promise((_, reject) => {
            timer = setTimeout(() => {
              expired = true;
              reject(Error('Speaking took too long to start. Please retry.'));
            }, 60000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
      this.output = new SpeechOutput(this.tts, { onMetric: (event) => this.onMetric?.(event) });
      onProgress('Warming up speaking…');
      await this.output.warm();
      this.ready = true;
    } catch (error) {
      this.dispose(error);
      throw error;
    }
  }
  call(data, transfer = []) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.dispose(Error('Listening took too long. Please retry voice setup.'));
      }, 60000);
      this.pending.set(id, { resolve, reject, timer });
      this.worker.postMessage({ id, ...data }, transfer);
    });
  }
  async transcribe(blob) {
    if (!this.ready) throw Error('Set up voice in Settings first.');
    const ctx = new AudioContext();
    try {
      const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
      const pcm = new Float32Array(decoded.length);
      for (let c = 0; c < decoded.numberOfChannels; c++) {
        const channel = decoded.getChannelData(c);
        for (let i = 0; i < pcm.length; i++) pcm[i] += channel[i] / decoded.numberOfChannels;
      }
      return {
        text: await this.call({ action: 'transcribe', pcm, sampleRate: decoded.sampleRate }, [
          pcm.buffer,
        ]),
      };
    } finally {
      await ctx.close();
    }
  }
  prepare(text, signal) {
    if (!this.ready) throw Error('Set up voice in Settings first.');
    return this.output.prepare(text, signal);
  }
  async speak(text, signal, prepared) {
    if (!this.ready) throw Error('Set up voice in Settings first.');
    return this.output.play(prepared ?? this.prepare(text, signal), signal);
  }
  dispose(error = Error('Voice stopped')) {
    this.ready = false;
    this.worker?.terminate();
    this.output?.dispose();
    this.tts?.dispose();
    this.tts = null;
    for (const p of this.pending.values()) {
      clearTimeout(p.timer);
      p.reject(error);
    }
    this.pending.clear();
  }
}
