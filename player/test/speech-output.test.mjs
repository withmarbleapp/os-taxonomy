import test from 'node:test';
import assert from 'node:assert/strict';
import { SpeechOutput } from '../packages/voice/speech-output.mjs';
import { createSpeechQueue } from '../packages/teaching-runtime/speech-stream.mjs';
const tick = () => new Promise((r) => setImmediate(r));
test('warm-up is silent; context is reused; cancellation stops sources without closing it', async () => {
  let contexts = 0,
    starts = 0,
    stops = 0;
  class Context {
    state = 'running';
    currentTime = 0;
    constructor() {
      contexts++;
    }
    async resume() {}
    async close() {
      this.state = 'closed';
    }
    createBuffer(_channels, length, rate) {
      return { duration: length / rate, copyToChannel() {} };
    }
    createBufferSource() {
      return {
        connect() {},
        disconnect() {},
        start() {
          starts++;
          this.timer = setTimeout(() => this.onended(), 5);
        },
        stop() {
          stops++;
          clearTimeout(this.timer);
          this.onended?.();
        },
      };
    }
  }
  const engine = {
    sampleRate: 24000,
    async *stream() {
      yield new Float32Array(1920);
    },
  };
  const metrics = [];
  const output = new SpeechOutput(engine, {
    AudioContextClass: Context,
    onMetric: (m) => metrics.push(m),
  });
  await output.warm();
  assert.equal(starts, 0);
  assert.equal(contexts, 0);
  await output.play(output.prepare('First.'));
  await output.play(output.prepare('Second.'));
  assert.equal(contexts, 1);
  assert.equal(starts, 2);
  assert.equal(output.ctx.state, 'running');
  const c = new AbortController();
  const pending = output.play(output.prepare('Cancel.', c.signal), c.signal);
  await tick();
  c.abort();
  await pending.catch((e) => assert.equal(e.name, 'AbortError'));
  assert.ok(stops > 0);
  assert.equal(output.ctx.state, 'running');
  assert.equal(output.jobs.size, 0);
  assert.ok(metrics.some((m) => m.type === 'tts_timing'));
  output.dispose();
  assert.equal(output.ctx.state, 'closed');
});
test('queue prepares only one sentence ahead and never overlaps playback', async () => {
  const prepared = [],
    played = [],
    releases = [];
  const speak = async (t, signal, { prepared: job }) => {
    assert.equal(job.text, t);
    played.push(t);
    await new Promise((r) => releases.push(r));
  };
  speak.prepare = (text) => {
    prepared.push(text);
    return { text, cancel() {} };
  };
  const q = createSpeechQueue({ speak, signal: new AbortController().signal });
  q.push('First sentence. ');
  q.push('Second sentence. ');
  q.push('Third sentence. ');
  await tick();
  assert.deepEqual(prepared, ['First sentence.', 'Second sentence.']);
  assert.deepEqual(played, ['First sentence.']);
  releases.shift()();
  await tick();
  assert.deepEqual(prepared, ['First sentence.', 'Second sentence.', 'Third sentence.']);
  assert.equal(played.length, 2);
  releases.shift()();
  await tick();
  releases.shift()();
  await q.settled();
});
test('cancelled lookahead is discarded and cannot play in the next turn', async () => {
  const c = new AbortController();
  let cancelled = 0;
  const played = [];
  const speak = async (t) => {
    played.push(t);
    c.abort();
  };
  speak.prepare = () => ({
    cancel() {
      cancelled++;
    },
  });
  const q = createSpeechQueue({ speak, signal: c.signal });
  q.push('First sentence. ');
  q.push('Second sentence. ');
  await q.settled();
  assert.deepEqual(played, ['First sentence.']);
  assert.equal(cancelled, 2);
});
