# Managed on-device tutor

Settings offers Claude, Codex, and **On this device**. The last option downloads
Qwen3.5 4B Q4_K_M (2.74 GB) into `inference-models` under Marble's user data folder.
It needs internet only for that download. No Ollama/LM Studio installation,
server port, model picker, account or inference connection is required.

## Architecture

- `packages/inference/model-store.mjs`: immutable Hugging Face revision, byte
  length and SHA-256; streams to a temporary file, verifies before atomic rename,
  verifies on process startup, reuses verified files offline. Concurrent requests
  share one download; retry after failure restarts it. Closing Marble cancels it.
- `engine.mjs`: one managed child process, IPC only, bounded inference timeout,
  cancellation terminates the process, crashes reject pending requests. The
  process is retained for 30 idle minutes. No server or open inference port.
- `worker.mjs`: pinned node-llama-cpp 3.22.2, prebuilt native binaries only
  (`build: never`), automatic GPU selection/offload, 16K context, Qwen3.5 chat
  template with zero thought-token budget. Reuses a
  model, context and sequence across decisions. Sessions are keyed to the lesson session ID and standing instructions; a new
  lesson cannot inherit another lesson’s context.
- Grammar constrains the tool name and argument object to offered tool schemas;
  arguments are validated and encoded into the existing runtime contract.
  Native inference is never available to a lesson frame directly.
- Electron packages native files outside ASAR. Speech remains browser workers;
  the LLM is native and would need a different adapter for a hosted web player.

The `simple-git` override pins its patched 4.0.2 dependency. Building engines from
source is disabled in the player; end users do not need compilers or Git.

## Model provenance

Weights: [unsloth/Qwen3.5-4B-GGUF](https://huggingface.co/unsloth/Qwen3.5-4B-GGUF),
revision `e87f176479d0855a907a41277aca2f8ee7a09523`,
`Qwen3.5-4B-Q4_K_M.gguf`. Checksum and exact bytes are in the model store.
The model is a quantization of Qwen3.5 4B (Apache-2.0). Model weights download
separately and are not part of the app archive. Engine/dependency licenses ship
in their npm packages. Verify model redistribution requirements when changing
artifacts.

## Validation

`npm test` covers corrupt downloads, retries, offline reuse, settings migration,
provider routing and frame isolation. `npm run test:browser` exercises the
Download → Check → saved selection UI with fixtures and both example lessons.

Run real inference with an already downloaded model:

```
node scripts/device-inference-smoke.mjs /absolute/path/to/model.gguf
```

This checks repeated probes, a full cube lesson payload, schema validation and
cancellation. It does not establish teaching quality. Hardware memory and speed
vary; the fixed 4B model is the initial supported choice, not an automatic model
selection system. Linux NVIDIA is the development target; other packaged GPU
backends and platforms need device testing. Long-session context compaction and
resume of interrupted model downloads are not implemented.

## Cached context and incremental speech

The in-app engine keeps one live lesson chat session. Its cache key includes the
lesson session ID, standing instructions, and full tool reference. Each decision
appends only new transcript entries and the latest scene state; the available
tool names and decision grammar still restrict the current action. A changed
lesson, instructions, or non-append-only transcript resets the context. Context
shifts remain engine-managed; an interrupted inference terminates the process
and loses its cache, while interrupting already-generated speech does not.

Qwen3.5 uses hybrid recurrent state: retaining a session alone is insufficient.
The sequence takes bounded checkpoints (eight, at most 256 MiB). The wrapper uses
`modelInitiated` thoughts with a zero thought budget and JSON grammar, avoiding
forced empty thought prefixes that disappear when earlier turns are rendered.
That formatting change is necessary for prefix reuse. Per-decision metrics log
newly evaluated input tokens, generated tokens, first-token and total times.
`cacheSessionReused` reports session reuse, not a token-cache-hit guarantee; inspect
the evaluated token counts to confirm savings.

`/api/infer-stream` emits NDJSON speech fragments, metrics and a validated final
decision (or error). The native adapter incrementally decodes the plain `say`
tool's text and emits complete sentences. Visual actions, self-assessment and
finish are held until their complete arguments are validated, and scene actions
execute before narration. Incomplete JSON, escape sequences and other tool names
are never read aloud.

The teaching runtime owns the ordered sentence queue and interruption, and the
player groups its sentences into one transcript message. Early speech is not
replayed when the final decision arrives. An interrupted partial utterance is
retained as interrupted history. Browser TTS streams each sentence's audio while
the LLM can continue generating later sentences.

This transport/queue is provider-independent. Providers returning only complete
responses still get sentence-sized TTS requests, but not earlier speech during
LLM generation. Claude uses `stream-json --include-partial-messages` and streams
only the `StructuredOutput` decision's JSON input deltas. Codex uses the official
stdio app-server's `item/agentMessage/delta` events from its active answer item.
Both feed the same sentence emitter and validate the final decision against its
selected lesson tool; a final reply that differs from spoken text is rejected.
Reasoning, progress messages, subagents and tool narration are not spoken early.
Codex ignores ambient MCP servers by reading their names before creating the
thread and disabling each one explicitly (an empty table alone merges config).
Cancellation terminates the provider process and cancels the speech queue.

Codex has live sentence-streaming coverage. Claude has protocol fixture coverage;
live verification requires refreshing the expired local Claude OAuth login.
Provider-side caching is not controlled or measured by Marble. The in-app engine
also has verified live context reuse.
