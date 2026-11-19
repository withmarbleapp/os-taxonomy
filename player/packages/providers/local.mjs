export const localEndpoints = {
  ollama: 'http://127.0.0.1:11434',
  lmstudio: 'http://127.0.0.1:1234/v1',
};
export const subscriptionModels = { codex: 'gpt-6-luna', claude: 'claude-haiku-5-5' };
export async function localAvailability(provider, fetcher = fetch) {
  if (!localEndpoints[provider]) throw Error('Unknown local provider');
  try {
    const response = await fetcher(
      localEndpoints[provider] + (provider === 'ollama' ? '/api/tags' : '/models'),
      { signal: AbortSignal.timeout(3000), redirect: 'error' },
    );
    if (!response.ok)
      return {
        provider,
        state: response.status === 401 ? 'auth_required' : 'unavailable',
        models: [],
      };
    const data = await response.json();
    const models =
      provider === 'ollama'
        ? data.models
            .filter((m) => !m.remote_host && !m.remote_model && !/:.*cloud/i.test(m.name))
            .map((m) => m.name)
        : data.data.map((m) => m.id);
    const ids = [
      ...new Set(models.filter((m) => typeof m === 'string' && m.length > 0 && m.length <= 1000)),
    ];
    return { provider, state: ids.length ? 'available' : 'no_models', models: ids };
  } catch {
    return { provider, state: 'unavailable', models: [] };
  }
}
export async function requireLocalModel(provider, model, fetcher = fetch) {
  const status = await localAvailability(provider, fetcher);
  if (!status.models.includes(model)) throw Error('Choose an available local model in Settings.');
  if (provider === 'ollama') {
    const response = await fetcher(localEndpoints.ollama + '/api/show', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model }),
      signal: AbortSignal.timeout(5000),
      redirect: 'error',
    });
    if (!response.ok) throw Error('Could not verify the local Ollama model.');
    const details = await response.json();
    if (details.remote_host || details.remote_model)
      throw Error('Choose a downloaded model, not an Ollama cloud model.');
    if (Array.isArray(details.capabilities) && !details.capabilities.includes('completion'))
      throw Error('Choose a chat model, not an embedding model.');
    return { ...status, thinking: details.thinking };
  }
  return status;
}

export function ollamaTutorOptions(model, thinking) {
  // Older Ollama releases omit thinking metadata. Qwen3/3.5 support the
  // boolean switch; never impose it on models that require named levels.
  const canDisable = Array.isArray(thinking?.values)
    ? thinking.values.includes(false)
    : /^qwen3(?:\.5)?(?:[:\-]|$)/i.test(model);
  return {
    ...(canDisable ? { think: false } : {}),
    keep_alive: '30m',
    options: { num_ctx: 16384, num_predict: 1200 },
  };
}
