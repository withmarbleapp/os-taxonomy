import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

class SpeechWorker {
  constructor(engine, directory) {
    this.pending = new Map();
    this.closed = false;
    this.ready = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
    this.ready.catch(() => {});
    const root = directory.replace(/[\\/]?$/, '/');
    const python =
      root + (process.platform === 'win32' ? '.venv/Scripts/python.exe' : '.venv/bin/python');
    this.child = spawn(python, ['-u', `${root}local-speech/worker.py`, engine], {
      cwd: root,
      stdio: ['pipe', 'pipe', 'ignore'],
      env: {
        ...Object.fromEntries(
          ['PATH', 'SystemRoot', 'SYSTEMROOT', 'WINDIR', 'TEMP', 'TMP']
            .filter((key) => process.env[key] !== undefined)
            .map((key) => [key, process.env[key]]),
        ),
        HOME: root,
        LANG: 'C.UTF-8',
        PYTHONUTF8: '1',
        OMP_NUM_THREADS: '4',
        HF_HUB_OFFLINE: '1',
        HF_HUB_DISABLE_TELEMETRY: '1',
        DO_NOT_TRACK: '1',
      },
    });
    let buffer = '';
    this.child.stdout.setEncoding('utf8');
    this.child.stdout.on('data', (data) => {
      buffer += data;
      if (buffer.length > 6_000_000) {
        this.fail(new Error('Local speech output exceeded its limit'));
        return;
      }
      let end;
      while ((end = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, end);
        buffer = buffer.slice(end + 1);
        try {
          const event = JSON.parse(line);
          if (event.type === 'ready') {
            this.info = event;
            this.resolveReady(event);
            continue;
          }
          if (event.type === 'fatal') {
            this.fail(new Error(event.message));
            return;
          }
          const request = this.pending.get(event.id);
          if (!request) continue;
          if (event.type === 'audio') {
            try {
              request.onAudio?.(Buffer.from(event.audio, 'base64'));
            } catch (error) {
              request.reject(error);
              this.pending.delete(event.id);
              this.send({ op: 'cancel', id: event.id });
            }
          } else if (event.type === 'done') request.resolve(event);
          else if (event.type === 'error') request.reject(new Error(event.message));
        } catch {
          this.fail(new Error('Invalid local speech output'));
          return;
        }
      }
    });
    this.child.on('error', () =>
      this.fail(new Error('Local speech is unavailable. Run npm run setup:local-speech.')),
    );
    this.child.on('exit', () => this.fail(new Error('Local speech worker exited')));
    this.child.stdin.on('error', () => this.fail(new Error('Local speech worker disconnected')));
    this.startupTimer = setTimeout(
      () => this.fail(new Error('Local speech model loading timed out')),
      60000,
    );
    this.ready.finally(() => clearTimeout(this.startupTimer)).catch(() => {});
  }
  send(event) {
    if (this.closed) throw new Error('Local speech worker is closed');
    if (this.child.stdin.writableLength > 6_000_000)
      throw new Error('Local speech input buffer exceeded');
    this.child.stdin.write(JSON.stringify(event) + '\n');
  }
  async request(input, signal, onAudio) {
    await this.ready;
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    if (this.pending.size >= 8) throw new Error('Local speech queue is full');
    const id = randomUUID();
    let timer, abort;
    try {
      return await new Promise((resolve, reject) => {
        this.pending.set(id, { resolve, reject, onAudio });
        abort = () => {
          try {
            this.send({ op: 'cancel', id });
          } catch {}
          reject(new DOMException('Cancelled', 'AbortError'));
        };
        signal?.addEventListener('abort', abort, { once: true });
        timer = setTimeout(() => {
          try {
            this.send({ op: 'cancel', id });
          } catch {}
          reject(new Error('Local speech inference timed out'));
        }, 45000);
        try {
          this.send({ ...input, id });
        } catch (error) {
          reject(error);
        }
      });
    } finally {
      this.pending.delete(id);
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
    }
  }
  fail(error) {
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.startupTimer);
    this.rejectReady(error);
    for (const p of this.pending.values()) p.reject(error);
    this.pending.clear();
    this.child.kill();
  }
  close() {
    this.fail(new Error('Local speech closed'));
  }
}

function wav(pcm, sampleRate) {
  const header = Buffer.alloc(44);
  header.write('RIFF');
  header.writeUInt32LE(pcm.length + 36, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export function createLocalSpeech({ stack = 'ondevice', directory } = {}) {
  if (!['ondevice', 'whisper-piper'].includes(stack))
    throw new Error('Unsupported local speech stack');
  const stt = new SpeechWorker(stack === 'ondevice' ? 'moonshine' : 'stt', directory),
    tts = new SpeechWorker(stack === 'ondevice' ? 'phonon' : 'tts', directory);
  const ready = Promise.all([stt.ready, tts.ready]);
  ready.catch(() => {
    stt.close();
    tts.close();
  });
  return {
    ready,
    models() {
      return structuredClone([stt.info, tts.info].filter(Boolean));
    },
    close() {
      stt.close();
      tts.close();
    },
    async transcribe(audio, type, signal) {
      return (
        await stt.request(
          { op: 'transcribe', audio: audio.toString('base64'), pcm: type === 'audio/pcm' },
          signal,
        )
      ).text;
    },
    async synthesize(text, signal) {
      const chunks = [];
      await tts.request({ op: 'synthesize', text }, signal, (data) => chunks.push(data));
      return { bytes: wav(Buffer.concat(chunks), tts.info.sampleRate), type: 'audio/wav' };
    },
    openRecognition({ onPartial = () => {} } = {}) {
      if (stack === 'ondevice') {
        const streamId = randomUUID(),
          controller = new AbortController();
        let bytes = 0,
          finalizing = false;
        let chain = stt.request({ op: 'start', streamId }, controller.signal);
        chain.catch(() => {});
        return {
          ready: chain,
          write(data) {
            if (finalizing || controller.signal.aborted)
              throw new Error('Recording already closed');
            bytes += data.length;
            if (bytes > 992000) throw new Error('Recording exceeds its limit');
            const audio = data.toString('base64');
            chain = chain
              .then(() =>
                stt.request({ op: 'audio', streamId, audio, pcm: true }, controller.signal),
              )
              .then((result) => {
                if (!finalizing && !controller.signal.aborted && result.text) onPartial();
              });
            chain.catch(() => {});
          },
          async finish() {
            finalizing = true;
            await chain;
            if (!bytes) {
              await stt.request({ op: 'drop', streamId }, controller.signal);
              return '';
            }
            return (await stt.request({ op: 'end', streamId }, controller.signal)).text;
          },
          cancel() {
            controller.abort();
            stt.request({ op: 'drop', streamId }).catch(() => {});
          },
        };
      }
      const chunks = [];
      const controller = new AbortController();
      let bytes = 0,
        finalizing = false,
        pending = null,
        cached = null,
        lastAttempt = 0;
      const decode = () => {
        const size = bytes;
        lastAttempt = size;
        const task = stt
          .request(
            { op: 'transcribe', audio: Buffer.concat(chunks).toString('base64'), pcm: true },
            controller.signal,
          )
          .then((result) => {
            cached = { bytes: size, text: result.text };
            if (!finalizing && result.text) onPartial();
            return result.text;
          });
        pending = task;
        task
          .finally(() => {
            if (pending === task) pending = null;
          })
          .catch(() => {});
        return task;
      };
      return {
        ready: stt.ready,
        write(data) {
          if (finalizing || controller.signal.aborted) throw new Error('Recording already closed');
          bytes += data.length;
          if (bytes > 992000) throw new Error('Recording exceeds its limit');
          chunks.push(Buffer.from(data));
          // One speculative whole-recording decode at a time; never commit it.
          if (!pending && bytes - lastAttempt >= 64000) decode().catch(() => {});
        },
        async finish() {
          finalizing = true;
          if (pending) await pending;
          if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
          if (!bytes) return '';
          return cached?.bytes === bytes ? cached.text : decode();
        },
        cancel() {
          controller.abort();
          chunks.length = 0;
        },
      };
    },
    openSynthesis({ onAudio }) {
      const controller = new AbortController();
      let chain = Promise.resolve(),
        characters = 0,
        finalizing = false,
        failed;
      const channel = {
        ready: tts.ready.then((info) => {
          channel.sampleRate = info.sampleRate;
        }),
        write(text) {
          if (finalizing || controller.signal.aborted) throw new Error('Synthesis already closed');
          characters += text.length;
          if (characters > 5000) throw new Error('Speech text exceeds limit');
          chain = chain.then(() => {
            if (failed) throw failed;
            return tts.request({ op: 'synthesize', text }, controller.signal, onAudio);
          });
          chain.catch((error) => {
            failed = error;
          });
        },
        async finish() {
          finalizing = true;
          if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
          await chain;
          if (controller.signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        },
        cancel() {
          controller.abort();
        },
      };
      return channel;
    },
  };
}
