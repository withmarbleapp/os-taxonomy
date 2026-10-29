export class AsyncQueue {
  constructor(limit = 256) {
    this.items = [];
    this.waiters = [];
    this.closed = false;
    this.error = null;
    this.limit = limit;
  }
  push(value) {
    if (this.closed) return;
    if (this.waiters.length) this.waiters.shift().resolve({ value, done: false });
    else {
      if (this.items.length >= this.limit) throw new Error('Stream buffer limit reached');
      this.items.push(value);
    }
  }
  end() {
    this.closed = true;
    for (const w of this.waiters.splice(0)) w.resolve({ done: true });
  }
  fail(error) {
    this.closed = true;
    this.error = error;
    this.items = [];
    for (const w of this.waiters.splice(0)) w.reject(error);
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  next() {
    if (this.error) return Promise.reject(this.error);
    if (this.items.length) return Promise.resolve({ value: this.items.shift(), done: false });
    if (this.closed) return Promise.resolve({ done: true });
    return new Promise((resolve, reject) => this.waiters.push({ resolve, reject }));
  }
}

// Whole sentences start synthesis early. A long sentence can break at a clause
// or word boundary, without cutting numbers, tokens or an escape sequence.
export class PhraseBuffer {
  constructor() {
    this.pending = '';
  }
  append(text) {
    this.pending += text;
    const result = [];
    while (true) {
      const sentence = /[.!?][”"')]*\s+/.exec(this.pending);
      const clause = this.pending.length > 120 ? /[,;:]\s+/.exec(this.pending) : null;
      let end = sentence
        ? sentence.index + sentence[0].length
        : clause && clause.index > 40
          ? clause.index + clause[0].length
          : -1;
      if (end < 0 && this.pending.length > 220) end = this.pending.lastIndexOf(' ', 220);
      if (end <= 0) break;
      result.push(this.pending.slice(0, end).trim());
      this.pending = this.pending.slice(end);
    }
    return result.filter(Boolean);
  }
  finish() {
    const tail = this.pending.trim();
    this.pending = '';
    return tail;
  }
}

// Incrementally decodes only the text value of {"text":"..."}. Scene tool
// arguments never pass through here. The complete object is validated at end.
export class SpeechArgumentDecoder {
  constructor() {
    this.raw = '';
    this.offset = null;
    this.done = false;
    this.text = '';
  }
  append(part) {
    this.raw += part;
    if (this.raw.length > 30000) throw new Error('Speech argument limit reached');
    if (this.offset === null) {
      const match = /^\s*\{\s*"text"\s*:\s*"/.exec(this.raw);
      if (!match) return '';
      this.offset = match[0].length;
    }
    let delta = '';
    while (!this.done && this.offset < this.raw.length) {
      const char = this.raw[this.offset];
      if (char === '"') {
        this.done = true;
        this.offset++;
        break;
      }
      if (char === '\\') {
        if (this.offset + 1 >= this.raw.length) break;
        const count = this.raw[this.offset + 1] === 'u' ? 6 : 2;
        if (this.offset + count > this.raw.length) break;
        delta += JSON.parse(`"${this.raw.slice(this.offset, this.offset + count)}"`);
        this.offset += count;
      } else {
        if (char.charCodeAt(0) < 32) throw new Error('Invalid speech JSON');
        delta += char;
        this.offset++;
      }
    }
    this.text += delta;
    return delta;
  }
}

export async function* readSSE(body) {
  const reader = body.getReader(),
    decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const data = block
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join('\n');
        if (data && data !== '[DONE]') yield JSON.parse(data);
        if (data === '[DONE]') yield { streamDone: true };
      }
      if (buffer.length > 100000) throw new Error('Provider event buffer exceeded');
      if (done) {
        if (buffer.trim()) throw new Error('Truncated provider event');
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export async function* readNDJSON(body) {
  const reader = body.getReader(),
    decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let boundary;
      while ((boundary = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 1);
        if (line.trim()) yield JSON.parse(line);
      }
      if (buffer.length > 100000) throw new Error('Stream event limit reached');
      if (done) {
        if (buffer.trim()) throw new Error('Truncated stream event');
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
