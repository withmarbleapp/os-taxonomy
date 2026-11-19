// Shared playback context and bounded, cancellable synthesis ahead of playback.
export class SpeechOutput {
  constructor(
    tts,
    {
      AudioContextClass = globalThis.AudioContext,
      now = () => performance.now(),
      onMetric = () => {},
    } = {},
  ) {
    Object.assign(this, { tts, AudioContextClass, now, onMetric });
    this.jobs = new Set();
  }
  context() {
    if (!this.ctx || this.ctx.state === 'closed')
      this.ctx = new this.AudioContextClass({
        sampleRate: this.tts.sampleRate,
        latencyHint: 'interactive',
      });
    return this.ctx;
  }
  async warm() {
    const start = this.now();
    const stream = this.tts.stream('Hello.', { signal: AbortSignal.timeout(15000) });
    this.warmStream = stream;
    try {
      for await (const pcm of stream) {
        /* Silent: never attach audio nodes. */
      }
    } finally {
      this.warmStream = null;
    }
    this.onMetric({ type: 'tts_warmup', durationMs: this.now() - start });
  }
  prepare(text, signal) {
    signal?.throwIfAborted();
    const controller = new AbortController();
    const combined = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
    const job = {
      text,
      receivedAt: this.now(),
      chunks: [],
      buffered: 0,
      done: false,
      controller,
      signal: combined,
      nodes: new Set(),
    };
    job.cancel = () => {
      controller.abort();
      job.chunks.length = 0;
      this.jobs.delete(job);
      job.wake?.();
      for (const n of job.nodes) {
        try {
          n.stop();
        } catch {}
      }
    };
    combined.addEventListener('abort', job.cancel, { once: true });
    this.jobs.add(job);
    job.production = (async () => {
      try {
        for await (const pcm of this.tts.stream(text, { signal: combined })) {
          combined.throwIfAborted();
          job.firstPcmAt ??= this.now();
          job.buffered += pcm.length;
          if (job.buffered > this.tts.sampleRate * 60)
            throw Error('Speech buffer exceeded one minute');
          job.chunks.push(pcm);
          job.wake?.();
        }
      } catch (error) {
        job.error = error;
      } finally {
        job.done = true;
        job.wake?.();
      }
    })();
    return job;
  }
  async play(job, signal) {
    signal?.throwIfAborted();
    const abort = () => job.cancel();
    signal?.addEventListener('abort', abort, { once: true });
    const playbackRequestedAt = this.now();
    const ctx = this.context();
    let ended = Promise.resolve(),
      at = ctx.currentTime,
      first = true;
    try {
      await ctx.resume();
      while (true) {
        job.signal.throwIfAborted();
        if (job.error) throw job.error;
        const pcm = job.chunks.shift();
        if (!pcm) {
          if (job.done) break;
          await new Promise((resolve) => {
            job.wake = resolve;
          });
          continue;
        }
        job.buffered -= pcm.length;
        const buffer = ctx.createBuffer(1, pcm.length, this.tts.sampleRate);
        buffer.copyToChannel(pcm, 0);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        job.nodes.add(source);
        ended = new Promise((resolve) => {
          source.onended = () => {
            job.nodes.delete(source);
            source.disconnect();
            resolve();
          };
        });
        at = Math.max(ctx.currentTime, at);
        source.start(at);
        at += buffer.duration;
        if (first) {
          first = false;
          this.onMetric({
            type: 'tts_timing',
            firstPcmMs: job.firstPcmAt - job.receivedAt,
            playbackScheduledMs: this.now() - job.receivedAt,
            playbackWaitMs: this.now() - playbackRequestedAt,
            outputLatencyMs: 1000 * (ctx.outputLatency ?? ctx.baseLatency ?? 0),
          });
        }
      }
      await Promise.race([
        ended,
        new Promise((resolve) => {
          job.wake = resolve;
          if (job.signal.aborted) resolve();
        }),
      ]);
    } finally {
      signal?.removeEventListener('abort', abort);
      job.cancel();
      await job.production;
      this.jobs.delete(job);
    }
  }
  dispose() {
    this.warmStream?.cancel();
    for (const job of this.jobs) job.cancel();
    this.jobs.clear();
    this.ctx?.close().catch(() => {});
  }
}
