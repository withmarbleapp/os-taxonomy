import { Transcriber, ModelArch } from '/speech-vendor/moonshine/index.js';

let transcriber;
// Emscripten can reject outside its factory promise; report instead of hanging.
self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({ fatal: event.reason?.message ?? 'Listening failed to initialize' });
});
self.onmessage = async ({ data }) => {
  const { id, action, files, pcm, sampleRate } = data;
  try {
    if (action === 'load') {
      transcriber?.close();
      transcriber = await Transcriber.loadFromUrls(files, {
        modelArch: ModelArch.SmallStreaming,
        onProgress: (loaded, total, file) =>
          self.postMessage({ progress: { loaded, total, file } }),
      });
      self.postMessage({ id, result: true });
    } else if (action === 'transcribe') {
      if (!transcriber) throw Error('Listening model is not ready');
      const result = transcriber.transcribe(pcm, { sampleRate });
      self.postMessage({
        id,
        result: result.lines
          .map((line) => line.text)
          .join(' ')
          .trim(),
      });
    } else throw Error('Unknown speech request');
  } catch (error) {
    self.postMessage({ id, error: error.message });
  }
};
