// Claude through the Anthropic API.
//
// The subscription adapters fix their output schema when the process starts,
// so they can only ask the model to stay within the tools the current scene
// offers. Here every request carries its own schema, built from the tools
// available for that one decision, so a tool the scene does not offer cannot
// be returned.
//
// The key is the one saved in Settings (passed in as `apiKey`), or else
// ANTHROPIC_API_KEY from the environment Marble was started in.
import Anthropic from '@anthropic-ai/sdk';
import { decisionStream } from './subscription-stream.mjs';
import { DECISION_FORMAT, DECISION_FORMAT_OBJECT } from '../teaching-runtime/records.mjs';

export const CLAUDE_API_MODEL = 'claude-haiku-5-5';

// Structured outputs accept a subset of JSON Schema. Constraints dropped here
// (lengths, ranges, item counts) are still checked when the decision is
// validated against the lesson's own schema.
const KEPT = new Set(['type', 'enum', 'const', 'required']);
export function apiSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const out = {};
  for (const [key, value] of Object.entries(schema)) if (KEPT.has(key)) out[key] = value;
  if (schema.anyOf) out.anyOf = schema.anyOf.map(apiSchema);
  if (schema.items) out.items = apiSchema(schema.items);
  if (schema.type === 'object' || schema.properties) {
    out.type = 'object';
    out.properties = Object.fromEntries(
      Object.entries(schema.properties ?? {}).map(([k, v]) => [k, apiSchema(v)]),
    );
    out.required = schema.required ?? [];
    out.additionalProperties = false;
  }
  return out;
}

// The decision for one turn: `tool` can only be one of the tools offered now.
export function turnSchema(tools, records = {}) {
  return apiSchema({
    type: 'object',
    properties: {
      tool: { enum: tools.map((t) => t.name) },
      arguments: { anyOf: tools.map((t) => t.inputSchema) },
      ...records,
    },
    required: ['tool', 'arguments', ...Object.keys(records)],
  });
}

// The conversation as one block per entry, oldest first, so each request's
// text starts with the previous request's. The API is stateless and the whole
// window is still sent, but everything up to the marked block is read from the
// cache: only the new entries and the current scene are processed afresh.
export function conversationBlocks(messages, tools, context) {
  const blocks = messages.map((m) => ({ type: 'text', text: JSON.stringify(m) }));
  if (blocks.length) blocks.at(-1).cache_control = { type: 'ephemeral' };
  blocks.push({
    type: 'text',
    text:
      'Current state, replacing any earlier one. Return the next decision.\n' +
      JSON.stringify({ availableTools: tools.map((t) => t.name), context }),
  });
  return blocks;
}

export const claudeApiAvailability = (env = process.env) => ({
  provider: 'anthropic',
  state: env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN ? 'signed_in' : 'no_key',
});

export async function inferClaudeApi({
  settings = {},
  system,
  tools,
  standingTools = tools,
  records = {},
  messages,
  context,
  signal,
  onEvent,
  apiKey,
  client,
}) {
  if (signal?.aborted) throw Error('Cancelled');
  client ??= new Anthropic({ timeout: 60_000, ...(apiKey ? { apiKey } : {}) });
  const decision = decisionStream(tools, onEvent, signal, records);
  let stream;
  try {
    stream = client.messages.stream(
      {
        model: settings.model || CLAUDE_API_MODEL,
        max_tokens: 4000,
        // Everything that stays the same for a lesson goes first and is cached:
        // the tutor's rules and the description of every tool the lesson has.
        system: [
          {
            type: 'text',
            text:
              system.replace(DECISION_FORMAT, DECISION_FORMAT_OBJECT) +
              '\nPut tool first, then arguments, then any records. Tool reference for this lesson (only those named in availableTools can be used now):\n' +
              JSON.stringify(standingTools) +
              '\nThe user message is the conversation so far, one JSON entry per block, oldest first, followed by the current state.',
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: conversationBlocks(messages, tools, context) }],
        // Thinking stays on, kept short by low effort.
        thinking: { type: 'adaptive' },
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: turnSchema(tools, records) },
        },
      },
      { signal },
    );
    for await (const event of stream)
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta')
        decision.push(event.delta.text);
    const message = await stream.finalMessage();
    if (message.stop_reason === 'refusal') throw Error('Claude declined to reply');
    if (message.stop_reason === 'max_tokens') throw Error('Claude reply was cut off');
    return decision.finish(
      message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join(''),
    );
  } catch (error) {
    stream?.abort();
    if (signal?.aborted) throw Error('Cancelled');
    if (error instanceof Anthropic.AuthenticationError)
      throw Error('The Claude API key was not accepted. Check it in Settings.');
    if (error instanceof Anthropic.RateLimitError)
      throw Error('The Claude API rate limit was reached. Try again in a moment.');
    if (error instanceof Anthropic.APIConnectionError)
      throw Error('Could not reach the Claude API.');
    throw error;
  }
}
