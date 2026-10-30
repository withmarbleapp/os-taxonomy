// Only the plain say tool can speak before its complete decision is validated.
// Scene changes and semantic actions must finish validation/execution first.
export function partialSayText(json) {
  const prefix = /^\s*\{\s*"tool"\s*:\s*"say"\s*,\s*"arguments"\s*:\s*\{\s*"text"\s*:\s*"/.exec(
    json,
  );
  if (!prefix) {
    const encoded = /^\s*\{\s*"tool"\s*:\s*"say"\s*,\s*"arguments"\s*:\s*"/.exec(json);
    if (!encoded) return '';
    // Decode only complete outer escapes, then parse the partial inner object.
    let raw = '';
    for (let i = encoded[0].length; i < json.length; i++) {
      if (json[i] === '"') break;
      if (json[i] === '\\') {
        const size = json[i + 1] === 'u' ? 6 : 2;
        if (i + size > json.length) break;
        raw += json.slice(i, i + size);
        i += size - 1;
      } else raw += json[i];
    }
    try {
      return partialSayText('{"tool":"say","arguments":' + JSON.parse('"' + raw + '"'));
    } catch {
      return '';
    }
  }
  let raw = '',
    i = prefix[0].length;
  for (; i < json.length; i++) {
    const c = json[i];
    if (c === '"') break;
    if (c === '\\') {
      const size = json[i + 1] === 'u' ? 6 : 2;
      if (i + size > json.length) break;
      raw += json.slice(i, i + size);
      i += size - 1;
    } else raw += c;
  }
  try {
    return JSON.parse('"' + raw + '"');
  } catch {
    return '';
  }
}
export function createSentenceEmitter(emit) {
  let sent = '';
  return {
    push(text) {
      if (!text.startsWith(sent) || text.length > 650) return;
      const tail = text.slice(sent.length);
      const boundary = /[.!?]["”’']?\s+/g;
      let match;
      while ((match = boundary.exec(tail))) {
        // Avoid splitting a decimal or a very short abbreviation.
        const end = match.index + match[0].length;
        const part = tail.slice(0, end);
        if (part.trim().length < 12) continue;
        sent += part;
        emit(part);
        return this.push(text);
      }
    },
    get text() {
      return sent;
    },
  };
}
// Transport-independent consumer: providers may emit speech early or return only
// the final decision. Final-only adapters use the same sentence queue afterwards.
export function createSpeechQueue({ speak, signal, isCurrent = () => true }) {
  let chain = Promise.resolve(),
    received = '',
    error;
  const group = {};
  const jobs = [];
  function prepareAhead() {
    if (signal.aborted || !isCurrent()) return;
    for (const job of jobs.slice(0, 2)) {
      if (!job.preparedStarted) {
        job.preparedStarted = true;
        try {
          job.prepared = speak.prepare?.(job.text, signal);
        } catch (e) {
          job.error = e;
        }
      }
    }
  }
  function enqueue(text) {
    if (!text.trim()) return;
    const job = { text: text.trim() };
    jobs.push(job);
    prepareAhead();
    chain = chain
      .then(async () => {
        try {
          if (!signal.aborted && isCurrent()) {
            if (job.error) throw job.error;
            await speak(job.text, signal, { group, prepared: job.prepared });
          }
        } finally {
          job.prepared?.cancel?.();
          jobs.shift();
          prepareAhead();
        }
      })
      .catch((e) => {
        error = e;
      });
  }
  return {
    push(text) {
      if (signal.aborted || !isCurrent()) return;
      if (typeof text !== 'string' || received.length + text.length > 650)
        throw Error('Invalid speech stream');
      received += text;
      enqueue(text);
    },
    async finish(text) {
      if (!text.startsWith(received)) throw Error('Speech stream did not match the final reply');
      const remainder = text.slice(received.length);
      const sentences = createSentenceEmitter(enqueue);
      sentences.push(remainder);
      enqueue(remainder.slice(sentences.text.length));
      await chain;
      if (error) throw error;
    },
    async settled() {
      await chain;
    },
    get text() {
      return received;
    },
  };
}
