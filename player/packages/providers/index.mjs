import { claudeStream, codexStream, decisionStream } from './subscription-stream.mjs';
import {
  localEndpoints,
  subscriptionModels,
  requireLocalModel,
  ollamaTutorOptions,
} from './local.mjs';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { join, delimiter } from 'node:path';
import { validate } from '../lesson-contract/contracts.mjs';
export function ollamaDecisionSchema(tools) {
  return {
    anyOf: tools.map((tool) => ({
      type: 'object',
      properties: { tool: { const: tool.name }, arguments: tool.inputSchema },
      required: ['tool', 'arguments'],
      additionalProperties: false,
    })),
  };
}
export const decisionSchema = {
  type: 'object',
  properties: { tool: { type: 'string' }, arguments: { type: 'string' } },
  required: ['tool', 'arguments'],
  additionalProperties: false,
};
export function runProcess(
  command,
  args,
  {
    input = '',
    cwd,
    signal,
    env = process.env,
    timeout = 120000,
    maxBytes = 2_000_000,
    onStdout,
  } = {},
) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(Error('Cancelled'));
    const child = spawn(command, args, { cwd, env, stdio: ['pipe', 'pipe', 'pipe'], shell: false });
    let output = '',
      errors = '',
      settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      error ? reject(error) : resolve(value);
    };
    const terminate = (error) => {
      child.kill('SIGTERM');
      const kill = setTimeout(() => child.kill('SIGKILL'), 1500);
      kill.unref();
      finish(error);
    };
    const abort = () => terminate(Error('Cancelled'));
    const timer = setTimeout(abort, timeout);
    signal?.addEventListener('abort', abort, { once: true });
    child.on('error', (e) =>
      finish(Error(e.code === 'ENOENT' ? `${command} is not installed or not on PATH` : e.message)),
    );
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (b) => {
      if (settled) return;
      output += b;
      if (output.length > maxBytes) return abort();
      try {
        onStdout?.(b);
      } catch (error) {
        terminate(error);
      }
    });
    child.stderr.on('data', (b) => {
      errors = (errors + b).slice(-2000);
    });
    child.on('close', (code) =>
      finish(
        code === 0
          ? null
          : Error(
              `${command} exited with code ${code}. Check its installation and official sign-in in a terminal.`,
            ),
        output,
      ),
    );
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}
export async function infer({
  settings,
  system,
  tools,
  messages,
  context,
  signal,
  runner = runProcess,
  codexRunner = codexStream,
  onEvent,
  fetcher = fetch,
}) {
  if (settings.provider === 'preview')
    return {
      tool: 'say',
      arguments: JSON.stringify({
        text: 'You can explore this lesson here. Choose a tutor connection in Settings to have a conversation.',
      }),
    };
  settings = {
    ...settings,
    ...(subscriptionModels[settings.provider]
      ? { model: subscriptionModels[settings.provider] }
      : {}),
  };
  const prompt = JSON.stringify({ system, tools, messages, context });
  if (settings.provider === 'local' || localEndpoints[settings.provider]) {
    const localModel = localEndpoints[settings.provider]
      ? await requireLocalModel(settings.provider, settings.model, fetcher)
      : null;
    const ollama = settings.provider === 'ollama';
    const localSchema = ollama ? ollamaDecisionSchema(tools) : null;
    const localSystem = ollama
      ? system.replace(
          'Return one decision as JSON: {tool:string,arguments:string}, where arguments is a JSON object encoded as a string.',
          'Return one decision as JSON: {tool:string,arguments:object}.',
        ) +
        '\nReturn exactly one tool decision. The arguments field must be a JSON object matching the selected tool inputSchema, not a string. Example: {"tool":"say","arguments":{"text":"Ready."}}'
      : system;
    const url = new URL(localEndpoints[settings.provider] ?? settings.endpoint);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.protocol !== 'http:')
      throw Error('Local inference requires an HTTP loopback endpoint');
    const response = await fetcher(
      url.href.replace(/\/$/, '') + (ollama ? '/api/chat' : '/chat/completions'),
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(120000)]),
        redirect: 'error',
        body: JSON.stringify({
          model: settings.model,
          messages: [
            { role: 'system', content: localSystem },
            { role: 'user', content: JSON.stringify({ tools, messages, context }) },
          ],
          ...(ollama
            ? {
                format: localSchema,
                stream: false,
                ...ollamaTutorOptions(settings.model, localModel?.thinking),
              }
            : {
                response_format: {
                  type: 'json_schema',
                  json_schema: { name: 'tutor_decision', strict: true, schema: decisionSchema },
                },
                max_tokens: 1200,
              }),
        }),
      },
    );
    if (!response.ok) throw Error(`Local model HTTP ${response.status}`);
    const data = await response.json();
    if (ollama) {
      const decision = JSON.parse(data.message.content);
      const tool = tools.find((t) => t.name === decision.tool);
      if (!tool) throw Error('Local model returned an unknown tool');
      validate(tool.inputSchema, decision.arguments);
      return { tool: decision.tool, arguments: JSON.stringify(decision.arguments) };
    }
    return JSON.parse(data.choices[0].message.content);
  }
  const env = providerEnvironment();
  const cwd = await mkdtemp(join(tmpdir(), 'marble-tutor-'));
  try {
    const stream = decisionStream(tools, onEvent, signal);
    const subscriptionPrompt =
      JSON.stringify({
        system: system.replace(
          'Return one decision as JSON: {tool:string,arguments:string}, where arguments is a JSON object encoded as a string.',
          'Return one decision as JSON: {tool:string,arguments:object}.',
        ),
        tools,
        messages,
        context,
      }) +
      '\nReturn a single JSON object, tool first then arguments as an OBJECT (not an encoded string). For say, put text first inside arguments. Example: {"tool":"say","arguments":{"text":"Hello."}}';
    const schema = {
      type: 'object',
      properties: {
        tool: { type: 'string' },
        arguments: { anyOf: tools.map((tool) => tool.inputSchema) },
      },
      required: ['tool', 'arguments'],
      additionalProperties: false,
    };
    if (settings.provider === 'claude') {
      const events = claudeStream(stream);
      const output = await runner(
        'claude',
        [
          '-p',
          '--output-format',
          'stream-json',
          '--verbose',
          '--include-partial-messages',
          '--json-schema',
          JSON.stringify(schema),
          '--tools',
          '',
          '--strict-mcp-config',
          '--mcp-config',
          '{"mcpServers":{}}',
          '--setting-sources',
          '',
          '--settings',
          '{"disableAllHooks":true}',
          '--no-session-persistence',
          '--system-prompt',
          'Return only the requested tutor decision. Do not use filesystem, shell, network or coding tools.',
          ...(settings.model ? ['--model', settings.model] : []),
        ],
        { input: subscriptionPrompt, cwd, signal, env, onStdout: events.push },
      );
      return events.finish(output);
    }
    if (settings.provider === 'codex') {
      return await codexRunner({
        cwd,
        env,
        signal,
        model: settings.model,
        prompt: subscriptionPrompt,
        schema,
        stream,
      });
    }
    throw Error('Unknown tutor provider');
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
}

export function providerEnvironment() {
  const env = Object.fromEntries(
    [
      'PATH',
      'HOME',
      'USER',
      'USERPROFILE',
      'APPDATA',
      'LOCALAPPDATA',
      'SystemRoot',
      'SYSTEMROOT',
      'WINDIR',
      'TEMP',
      'TMP',
      'TMPDIR',
      'XDG_CONFIG_HOME',
      'XDG_DATA_HOME',
      'XDG_CACHE_HOME',
      'HTTPS_PROXY',
      'HTTP_PROXY',
      'NO_PROXY',
    ]
      .filter((k) => process.env[k] !== undefined)
      .map((k) => [k, process.env[k]]),
  );
  // Desktop launchers often omit the official native CLI install directory.
  env.PATH = [
    ...new Set([
      ...(env.PATH ?? '').split(delimiter).filter(Boolean),
      join(homedir(), '.local', 'bin'),
      '/usr/local/bin',
      '/opt/homebrew/bin',
    ]),
  ].join(delimiter);
  return env;
}
