import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir, homedir } from 'node:os';
import { join, delimiter } from 'node:path';
export const decisionSchema = {
  type: 'object',
  properties: { tool: { type: 'string' }, arguments: { type: 'string' } },
  required: ['tool', 'arguments'],
  additionalProperties: false,
};
export function runProcess(
  command,
  args,
  { input = '', cwd, signal, env = process.env, timeout = 120000, maxBytes = 2_000_000 } = {},
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
    const abort = () => {
      child.kill('SIGTERM');
      const kill = setTimeout(() => child.kill('SIGKILL'), 1500);
      kill.unref();
      finish(Error('Cancelled'));
    };
    const timer = setTimeout(abort, timeout);
    signal?.addEventListener('abort', abort, { once: true });
    child.on('error', (e) =>
      finish(Error(e.code === 'ENOENT' ? `${command} is not installed or not on PATH` : e.message)),
    );
    child.stdout.on('data', (b) => {
      output += b;
      if (output.length > maxBytes) abort();
    });
    child.stderr.on('data', (b) => {
      errors = (errors + b).slice(-2000);
    });
    child.on('exit', (code) =>
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
}) {
  if (settings.provider === 'preview')
    return {
      tool: 'say',
      arguments: JSON.stringify({
        text: 'You can explore this lesson here. Choose a tutor connection in Settings to have a conversation.',
      }),
    };
  const prompt = JSON.stringify({ system, tools, messages, context });
  if (settings.provider === 'local') {
    const url = new URL(settings.endpoint);
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.protocol !== 'http:')
      throw Error('Local inference requires an HTTP loopback endpoint');
    const response = await fetch(url.href.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.any([signal, AbortSignal.timeout(120000)]),
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: JSON.stringify({ tools, messages, context }) },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'tutor_decision', strict: true, schema: decisionSchema },
        },
        max_tokens: 1200,
      }),
    });
    if (!response.ok) throw Error(`Local model HTTP ${response.status}`);
    return JSON.parse((await response.json()).choices[0].message.content);
  }
  const env = providerEnvironment();
  const cwd = await mkdtemp(join(tmpdir(), 'marble-tutor-'));
  try {
    if (settings.provider === 'claude') {
      const output = await runner(
        'claude',
        [
          '-p',
          '--output-format',
          'json',
          '--json-schema',
          JSON.stringify(decisionSchema),
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
        { input: prompt, cwd, signal, env },
      );
      const result = JSON.parse(output);
      if (result.is_error) throw Error('Claude could not complete this turn');
      return result.structured_output ?? JSON.parse(result.result);
    }
    if (settings.provider === 'codex') {
      const schema = join(cwd, 'schema.json'),
        output = join(cwd, 'decision.json');
      await writeFile(schema, JSON.stringify(decisionSchema));
      await runner(
        'codex',
        [
          'exec',
          '--ignore-user-config',
          '--ignore-rules',
          '--ephemeral',
          '--skip-git-repo-check',
          '--sandbox',
          'read-only',
          '-c',
          'features.shell_tool=false',
          '-c',
          'features.unified_exec=false',
          '-c',
          'features.apps=false',
          '-c',
          'features.browser_use=false',
          '-c',
          'features.browser_use_external=false',
          '-c',
          'features.computer_use=false',
          '-c',
          'features.in_app_browser=false',
          '-c',
          'web_search="disabled"',
          '--output-schema',
          schema,
          '--output-last-message',
          output,
          ...(settings.model ? ['--model', settings.model] : []),
          '-',
        ],
        { input: prompt, cwd, signal, env },
      );
      return JSON.parse(await readFile(output, 'utf8'));
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
