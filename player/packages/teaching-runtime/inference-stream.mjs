export async function readInferenceResponse(response, onEvent = () => {}) {
  if (!response.headers.get('content-type')?.includes('application/x-ndjson'))
    return response.json();
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let buffer = '',
    result;
  function line(text) {
    if (!text.trim()) return;
    const event = JSON.parse(text);
    if (event.type === 'error') throw Error(event.message);
    if (event.type === 'decision') result = event.decision;
    else onEvent(event);
  }
  try {
    for (;;) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let end;
      while ((end = buffer.indexOf('\n')) !== -1) {
        line(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
      }
      if (buffer.length > 100000) throw Error('Inference stream too large');
      if (done) break;
    }
    line(buffer);
    if (!result) throw Error('Inference stream ended without a decision');
    return result;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
