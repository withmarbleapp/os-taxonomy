// Real model smoke test. No external inference server or model download.
import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInferenceEngine } from '../packages/inference/engine.mjs';
import { loadDirectory } from '../packages/authoring-tools/archive.mjs';
import { teachingTools, tutorSystem } from '../packages/teaching-runtime/session.mjs';
import { createCubes } from '../lessons/cube-volume/model/cubes.mjs';
import { validate } from '../packages/lesson-contract/contracts.mjs';
const engine = createInferenceEngine({
  modelPath:
    process.argv[2] ?? join(homedir(), '.config/Marble/inference-models/Qwen3.5-4B-Q4_K_M.gguf'),
});
try {
  for (let i = 0; i < 2; i++) {
    const start = Date.now();
    const result = await engine.infer({
      system: 'Connection check. Say ready.',
      tools: [teachingTools[0]],
      messages: [],
      context: {},
    });
    assert.equal(result.tool, 'say');
    validate(teachingTools[0].inputSchema, JSON.parse(result.arguments));
    console.log(JSON.stringify({ probe: i, ms: Date.now() - start, result }));
  }
  const pkg = await loadDirectory(new URL('../lessons/cube-volume/', import.meta.url).pathname);
  const snapshot = createCubes().snapshot();
  const tools = [
    ...teachingTools,
    ...pkg.experience.actions.filter((t) => snapshot.availableActions.includes(t.name)),
  ];
  const start = Date.now();
  let initialMetrics;
  const result = await engine.infer({
    system: tutorSystem(pkg),
    tools,
    standingTools: [...teachingTools, ...pkg.experience.actions],
    onEvent: (event) => {
      if (event.type === 'inference_metrics') initialMetrics = event;
      console.log(JSON.stringify({ ...event, elapsedMs: Date.now() - start }));
    },
    messages: [],
    context: {
      snapshot,
      events: [],
      learning: [],
      confidence: [],
      origin: 'start',
      instruction: 'Begin the lesson. Introduce what we will learn.',
    },
  });
  const tool = tools.find((t) => t.name === result.tool);
  assert.ok(tool);
  validate(tool.inputSchema, JSON.parse(result.arguments));
  console.log(JSON.stringify({ lesson: 'cube-volume', ms: Date.now() - start, result }));
  const followStart = Date.now();
  const events = [];
  const follow = await engine.infer({
    system: tutorSystem(pkg),
    tools,
    standingTools: [...teachingTools, ...pkg.experience.actions],
    messages: [
      { role: 'assistant', text: JSON.parse(result.arguments).text ?? '' },
      { role: 'user', text: 'What is a layer?' },
    ],
    context: {
      snapshot,
      events: [],
      learning: [],
      confidence: [],
      origin: 'learner',
      instruction: 'What is a layer?',
    },
    onEvent: (event) => {
      events.push(event);
      console.log(JSON.stringify({ ...event, elapsedMs: Date.now() - followStart }));
    },
  });
  const metrics = events.find((e) => e.type === 'inference_metrics');
  assert.equal(metrics.cacheSessionReused, true);
  assert.ok(
    metrics.usedInputTokens < initialMetrics.usedInputTokens / 2,
    'Standing instructions should not be evaluated again',
  );
  assert.ok(
    events.some((e) => e.type === 'speech'),
    'Sentence must stream before final decision',
  );
  console.log(JSON.stringify({ follow, ms: Date.now() - followStart }));
  const controller = new AbortController();
  const aborted = engine.infer({
    system: 'Say ready.',
    tools: [teachingTools[0]],
    messages: [],
    context: {},
    signal: controller.signal,
  });
  controller.abort();
  await assert.rejects(aborted);
  console.log('PASS: repeated replies, full cube payload, cancellation');
} finally {
  engine.close();
}
