// One long-lived Claude Code process per lesson session.
//
// The stateless adapter starts a process and resends the whole lesson and
// conversation for every decision. Here the lesson is sent once; each later
// decision sends only what is new, so the model has little to reconsider and
// no process start-up is paid. Authentication stays with the official CLI.
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { claudeStream, decisionStream, jsonLines } from './subscription-stream.mjs';
import { DECISION_FORMAT, DECISION_FORMAT_OBJECT } from '../teaching-runtime/records.mjs';

const exampleFor = (records) =>
  '{"tool":"say","arguments":{"text":"Hello."}' +
  Object.keys(records)
    .map((k) => `,"${k}":[]`)
    .join('') +
  '}';

// What to send so the process's record of the conversation matches `messages`.
// `sent` is what it has already been given, as JSON strings. The runtime sends
// a sliding window, so the start may have moved forward since last time.
export function conversationDelta(sent, messages) {
  const next = messages.map((m) => JSON.stringify(m));
  for (let shift = 0; shift <= sent.length; shift++) {
    const overlap = sent.length - shift;
    if (overlap > next.length) continue;
    let same = true;
    for (let i = 0; i < overlap && same; i++) same = sent[shift + i] === next[i];
    // Nothing in common with a non-empty record means an earlier entry changed.
    if (same && (overlap > 0 || !sent.length))
      return { replace: false, items: messages.slice(overlap), next };
  }
  return { replace: true, items: messages, next };
}

export function createClaudeSessions({
  spawnProcess = spawn,
  environment = () => process.env,
  maxSessions = 2,
  idleMs = 10 * 60 * 1000,
  turnTimeoutMs = 120000,
  drainMs = 5000,
} = {}) {
  const sessions = new Map();

  function dispose(key) {
    const s = sessions.get(key);
    if (!s) return;
    sessions.delete(key);
    clearTimeout(s.idleTimer);
    s.dead = true;
    try {
      s.child.stdin.end();
    } catch {
      // already closed
    }
    s.child.kill('SIGTERM');
    const kill = setTimeout(() => s.child.kill('SIGKILL'), 1500);
    kill.unref?.();
    s.turn?.fail(Error('Cancelled'));
    rm(s.cwd, { recursive: true, force: true }).catch(() => {});
  }

  async function open(key, standingKey, { model, schema }) {
    while (sessions.size >= maxSessions) dispose(sessions.keys().next().value);
    const cwd = await mkdtemp(join(tmpdir(), 'marble-tutor-'));
    const child = spawnProcess(
      'claude',
      [
        '-p',
        '--input-format',
        'stream-json',
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
        // Haiku 5.5 always thinks; low effort is the only way to shorten it.
        '--effort',
        'low',
        '--system-prompt',
        'Return only the requested tutor decision. Do not use filesystem, shell, network or coding tools.',
        ...(model ? ['--model', model] : []),
      ],
      { cwd, env: environment(), stdio: ['pipe', 'pipe', 'pipe'], shell: false },
    );
    const s = {
      key,
      standingKey,
      child,
      cwd,
      sent: null, // JSON strings of the messages the process has been given
      turn: null,
      chain: Promise.resolve(),
      dead: false,
      idleTimer: null,
    };
    const lines = jsonLines((message) => s.turn?.message(message));
    const ended = (error) => {
      if (s.dead) return;
      s.dead = true;
      if (sessions.get(key) === s) sessions.delete(key);
      clearTimeout(s.idleTimer);
      s.turn?.fail(error);
      rm(cwd, { recursive: true, force: true }).catch(() => {});
    };
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (text) => {
      try {
        lines.push(text);
      } catch (error) {
        s.turn?.fail(error);
      }
    });
    child.stderr.resume();
    child.stdin.on('error', () => {});
    child.on('error', (e) =>
      ended(Error(e.code === 'ENOENT' ? 'claude is not installed or not on PATH' : e.message)),
    );
    child.on('close', () => ended(Error('Claude closed before completing the reply')));
    sessions.set(key, s);
    return s;
  }

  const write = (s, value) => s.child.stdin.write(JSON.stringify(value) + '\n');

  // Sends one user message and resolves `outcome` with the decision. `idle`
  // resolves when the process has finished with this turn and can take another,
  // which after an interruption is later than `outcome`.
  function startTurn(s, text, { tools, records, signal, onEvent }) {
    let settled = false,
      finished = false,
      freeProcess,
      resolveOutcome,
      rejectOutcome,
      drainTimer;
    const idle = new Promise((r) => (freeProcess = r));
    const outcome = new Promise((resolve, reject) => {
      resolveOutcome = resolve;
      rejectOutcome = reject;
    });
    const timeout = setTimeout(() => {
      fail(Error('Claude inference timed out'));
      dispose(s.key);
    }, turnTimeoutMs);
    const done = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      clearTimeout(drainTimer);
      signal?.removeEventListener('abort', abort);
      if (s.turn === turn) s.turn = null;
      freeProcess();
    };
    const settle = (error, value) => {
      if (settled) return;
      settled = true;
      error ? rejectOutcome(error) : resolveOutcome(value);
    };
    const fail = (error) => {
      settle(error);
      if (s.dead) done();
    };
    const stream = decisionStream(tools, (event) => !settled && onEvent?.(event), signal, records);
    const events = claudeStream(stream, {
      onResult() {
        try {
          settle(null, events.finish());
        } catch (error) {
          settle(error);
        }
        done();
      },
    });
    const turn = {
      message(message) {
        if (settled && message.type !== 'result') return; // draining an abandoned turn
        try {
          events.message(message);
        } catch (error) {
          settle(error);
        }
      },
      fail,
    };
    function abort() {
      if (settled) return;
      settle(Error('Cancelled'));
      // Stop generation, then wait for the process to report the turn ended.
      write(s, {
        type: 'control_request',
        request_id: crypto.randomUUID(),
        request: { subtype: 'interrupt' },
      });
      drainTimer = setTimeout(() => dispose(s.key), drainMs);
      drainTimer.unref?.();
    }
    s.turn = turn;
    signal?.addEventListener('abort', abort, { once: true });
    write(s, { type: 'user', message: { role: 'user', content: [{ type: 'text', text }] } });
    return { outcome, idle };
  }

  async function infer({
    key,
    settings,
    system,
    tools,
    standingTools = tools,
    records = {},
    messages,
    context,
    signal,
    onEvent,
  }) {
    if (signal?.aborted) throw Error('Cancelled');
    const schema = {
      type: 'object',
      properties: {
        tool: { enum: standingTools.map((t) => t.name) },
        arguments: { anyOf: standingTools.map((t) => t.inputSchema) },
        ...records,
      },
      required: ['tool', 'arguments', ...Object.keys(records)],
      additionalProperties: false,
    };
    const standingKey = JSON.stringify([settings.model, system, schema]);
    let s = sessions.get(key);
    if (s && (s.dead || s.standingKey !== standingKey)) {
      dispose(key);
      s = null;
    }
    s ??= await open(key, standingKey, { model: settings.model, schema });
    // LRU order, and one decision at a time per process.
    sessions.delete(key);
    sessions.set(key, s);
    clearTimeout(s.idleTimer);
    const previous = s.chain;
    let release;
    s.chain = new Promise((r) => (release = r));
    await previous;
    try {
      if (signal?.aborted) throw Error('Cancelled');
      if (s.dead) throw Error('Claude closed before completing the reply');
      const available = tools.map((t) => t.name);
      let text;
      if (!s.sent) {
        text =
          JSON.stringify({
            system: system.replace(DECISION_FORMAT, DECISION_FORMAT_OBJECT),
            tools: standingTools,
            availableTools: available,
            messages,
            context,
          }) +
          '\nReturn a single JSON object, tool first then arguments as an OBJECT (not an encoded string), then any records. For say, put text first inside arguments. Example: ' +
          exampleFor(records) +
          '\nThis conversation continues. Each later message gives only what is new: newMessages, the current context and availableTools. The newest context replaces every earlier one. Choose only a tool named in the newest availableTools.';
        s.sent = messages.map((m) => JSON.stringify(m));
      } else {
        const delta = conversationDelta(s.sent, messages);
        text =
          JSON.stringify({
            availableTools: available,
            ...(delta.replace
              ? { conversationReplaced: true, messages: delta.items }
              : { newMessages: delta.items }),
            context,
          }) +
          (delta.replace ? '\nThe messages array replaces the earlier conversation record.' : '') +
          '\nReturn the next decision as a single JSON object.';
        s.sent = delta.next;
      }
      for (let attempt = 0; ; attempt++) {
        const turn = startTurn(s, text, { tools, records, signal, onEvent });
        try {
          return await turn.outcome;
        } catch (error) {
          await turn.idle;
          // The schema covers every tool the lesson has; ask once more if the
          // model chose one the current scene does not offer.
          if (attempt > 0 || error.message !== 'Provider returned an unknown tool' || s.dead)
            throw error;
          if (signal?.aborted) throw Error('Cancelled');
          text =
            JSON.stringify({ availableTools: available }) +
            '\nThat tool is not available in the current scene. Return another decision using only availableTools.';
        } finally {
          await turn.idle;
        }
      }
    } finally {
      release();
      if (!s.dead) {
        s.idleTimer = setTimeout(() => dispose(key), idleMs);
        s.idleTimer.unref?.();
      }
    }
  }

  return {
    infer,
    close: dispose,
    closeAll() {
      for (const key of [...sessions.keys()]) dispose(key);
    },
    get size() {
      return sessions.size;
    },
  };
}
