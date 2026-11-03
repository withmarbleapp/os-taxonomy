import { spawn } from 'node:child_process';
import { createSentenceEmitter, partialSayText } from '../teaching-runtime/speech-stream.mjs';
import { validate } from '../lesson-contract/contracts.mjs';

export function jsonLines(onValue) {
  let pending = '';
  return {
    push(text) {
      pending += text;
      if (pending.length > 2_000_000) throw Error('Provider stream exceeded limit');
      let end;
      while ((end = pending.indexOf('\n')) !== -1) {
        const line = pending.slice(0, end).trim();
        pending = pending.slice(end + 1);
        if (line) onValue(JSON.parse(line));
      }
    },
    finish() {
      if (pending.trim()) onValue(JSON.parse(pending));
      pending = '';
    },
  };
}

export function decisionStream(tools, onEvent, signal) {
  const sentences = createSentenceEmitter((text) => {
    if (!signal?.aborted) onEvent?.({ type: 'speech', text });
  });
  let json = '';
  return {
    push(delta) {
      if (signal?.aborted) throw Error('Cancelled');
      json += delta;
      if (json.length > 100_000) throw Error('Decision exceeded limit');
      if (tools.some((t) => t.name === 'say')) sentences.push(partialSayText(json));
    },
    finish(value) {
      if (signal?.aborted) throw Error('Cancelled');
      const decision = typeof value === 'string' ? JSON.parse(value) : value;
      const tool = tools.find((t) => t.name === decision?.tool);
      if (!tool) throw Error('Provider returned an unknown tool');
      const args =
        typeof decision.arguments === 'string'
          ? JSON.parse(decision.arguments)
          : decision.arguments;
      validate(tool.inputSchema, args);
      if (sentences.text && (decision.tool !== 'say' || !args.text.startsWith(sentences.text)))
        throw Error('Speech stream did not match the final reply');
      return { tool: decision.tool, arguments: JSON.stringify(args) };
    },
  };
}

export function claudeStream(stream) {
  let block, result;
  const lines = jsonLines((message) => {
    if (message.parent_tool_use_id) return;
    if (message.type === 'result') {
      result = message;
      return;
    }
    if (message.type !== 'stream_event') return;
    const e = message.event;
    if (e.type === 'content_block_start') {
      // Structured output is emitted as input JSON for this synthetic tool.
      // Ignore narrative, thinking and all other tool calls.
      if (e.content_block.type === 'tool_use' && e.content_block.name === 'StructuredOutput') {
        if (block !== undefined) throw Error('Multiple structured decisions');
        block = e.index;
      }
    }
    if (
      e.type === 'content_block_delta' &&
      e.index === block &&
      e.delta.type === 'input_json_delta'
    )
      stream.push(e.delta.partial_json);
  });
  return {
    push: lines.push,
    finish(output) {
      // The injected runner may return a buffered result; real runner supplies chunks.
      if (!result && output) lines.push(output);
      lines.finish();
      if (!result || result.is_error || !result.structured_output)
        throw Error('Claude could not complete this turn');
      return stream.finish(result.structured_output);
    },
  };
}

// A short-lived, isolated app-server thread exposes real text deltas, unlike exec's
// completed-item JSON events. Authentication remains owned by the official CLI.
export function codexStream({
  cwd,
  env,
  model,
  prompt,
  schema,
  stream,
  signal,
  spawnProcess = spawn,
  timeout = 120000,
}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(Error('Cancelled'));
    const overrides = {
      mcp_servers: '{}',
      hooks:
        '{PreModelRequest=[],PostModelRequest=[],PreToolUse=[],PermissionRequest=[],PostToolUse=[],PreCompact=[],PostCompact=[],SessionStart=[],SessionEnd=[],UserPromptSubmit=[],SubagentStart=[],SubagentStop=[],Stop=[],Interrupt=[]}',
      notify: '[]',
      project_doc_max_bytes: '0',
      'features.shell_tool': 'false',
      'features.unified_exec': 'false',
      'features.apps': 'false',
      'features.plugins': 'false',
      'features.browser_use': 'false',
      'features.browser_use_external': 'false',
      'features.computer_use': 'false',
      'features.in_app_browser': 'false',
      'features.multi_agent': 'false',
      'features.hooks': 'false',
      'features.memory_tool': 'false',
      web_search: '"disabled"',
    };
    const child = spawnProcess(
      'codex',
      [
        'app-server',
        '--stdio',
        ...Object.entries(overrides).flatMap(([k, v]) => ['-c', `${k}=${v}`]),
      ],
      { cwd, env, stdio: ['pipe', 'pipe', 'pipe'], shell: false },
    );
    let settled = false,
      threadId,
      turnId,
      itemId,
      finalText,
      bytes = 0;
    const stop = (error, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      child.kill('SIGTERM');
      const kill = setTimeout(() => child.kill('SIGKILL'), 1500);
      kill.unref();
      error ? reject(error) : resolve(value);
    };
    const abort = () => stop(Error('Cancelled'));
    const timer = setTimeout(() => stop(Error('Codex inference timed out')), timeout);
    signal?.addEventListener('abort', abort, { once: true });
    const send = (value) => child.stdin.write(JSON.stringify(value) + '\n');
    const lines = jsonLines((m) => {
      if (settled) return;
      if (m.method && m.id !== undefined) throw Error('Unexpected Codex tool or approval request');
      if (m.error) throw Error('Codex rejected the inference request');
      if (m.id === 1) {
        send({ method: 'initialized' });
        send({ id: 4, method: 'config/read', params: { includeLayers: false } });
      } else if (m.id === 4) {
        const disabledServers = Object.fromEntries(
          Object.keys(m.result.config.mcp_servers ?? {}).map((name) => [name, { enabled: false }]),
        );
        send({
          id: 2,
          method: 'thread/start',
          params: {
            model,
            cwd,
            ephemeral: true,
            approvalPolicy: 'never',
            sandbox: 'read-only',
            baseInstructions: 'Return only the requested tutor decision JSON. Do not use tools.',
            developerInstructions: '',
            config: {
              ...Object.fromEntries(
                Object.entries(overrides).map(([k, v]) => [
                  k,
                  k === 'hooks'
                    ? Object.fromEntries(
                        [
                          'PreModelRequest',
                          'PostModelRequest',
                          'PreToolUse',
                          'PermissionRequest',
                          'PostToolUse',
                          'PreCompact',
                          'PostCompact',
                          'SessionStart',
                          'SessionEnd',
                          'UserPromptSubmit',
                          'SubagentStart',
                          'SubagentStop',
                          'Stop',
                          'Interrupt',
                        ].map((name) => [name, []]),
                      )
                    : JSON.parse(v),
                ]),
              ),
              mcp_servers: disabledServers,
            },
          },
        });
      } else if (m.id === 2) {
        threadId = m.result.thread.id;
        send({
          id: 3,
          method: 'turn/start',
          params: {
            threadId,
            input: [{ type: 'text', text: prompt }],
            outputSchema: schema,
            effort: 'low',
          },
        });
      } else if (m.id === 3) {
        turnId ??= m.result.turn.id;
      }
      const p = m.params;
      if (!p || p.threadId !== threadId) return;
      if (m.method === 'turn/started') turnId ??= p.turn.id;
      if (m.method === 'turn/completed' && p.turn.id === turnId) {
        if (p.turn.status !== 'completed' || !finalText)
          throw Error('Codex could not complete this turn');
        stop(null, stream.finish(finalText));
        return;
      }
      if (p.turnId !== turnId) return;
      if (
        m.method === 'item/started' &&
        p.item.type === 'agentMessage' &&
        p.item.phase !== 'commentary'
      ) {
        if (itemId) throw Error('Multiple Codex answer items');
        itemId = p.item.id;
      }
      if (m.method === 'item/agentMessage/delta' && p.itemId === itemId) stream.push(p.delta);
      if (m.method === 'item/completed' && p.item.id === itemId) finalText = p.item.text;
    });
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (text) => {
      try {
        bytes += text.length;
        if (bytes > 2_000_000) throw Error('Provider stream exceeded limit');
        lines.push(text);
      } catch (e) {
        stop(e);
      }
    });
    child.stderr.resume();
    child.stdin.on('error', (e) => stop(e));
    child.on('error', (e) =>
      stop(Error(e.code === 'ENOENT' ? 'Codex is not installed or not on PATH' : e.message)),
    );
    child.on('close', () => stop(Error('Codex closed before completing the reply')));
    send({
      id: 1,
      method: 'initialize',
      params: {
        clientInfo: { name: 'marble', version: '0.1.0' },
        capabilities: { experimentalApi: true },
      },
    });
  });
}
