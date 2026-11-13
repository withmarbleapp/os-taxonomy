import test from 'node:test';
import assert from 'node:assert/strict';
import { TeachingSession } from '../packages/teaching-runtime/session.mjs';
import { loadDirectory } from '../packages/authoring-tools/archive.mjs';
import { createCubes } from '../lessons/cube-volume/model/cubes.mjs';
import { infer, runProcess } from '../packages/providers/index.mjs';
const say = (text) => ({ tool: 'say', arguments: JSON.stringify({ text }) });
test('latest corrected plan supersedes old wrong work', async () => {
  const pkg = await loadDirectory('lessons/cube-volume'),
    model = createCubes({ sessionId: crypto.randomUUID() });
  const exec = (name, args) => {
    const s = model.snapshot();
    return model.execute({
      protocolVersion: 1,
      sessionId: s.sessionId,
      releaseId: s.releaseId,
      commandId: crypto.randomUUID(),
      expectedRevision: s.revision,
      name,
      args,
    });
  };
  exec('prepare_fresh_box', { difficulty: 'small' });
  for (const [k, v] of Object.entries({ perLayer: '1', layers: '1', total: '1' }))
    model.learnerEdit(k, v);
  model.learnerCommit();
  exec('reopen_plan', {});
  const s = model.snapshot().state;
  for (const [k, v] of Object.entries({
    perLayer: s.cubesPerLayer,
    layers: s.layerCount,
    total: s.totalCubes,
  }))
    model.learnerEdit(k, String(v));
  model.learnerCommit();
  let request;
  const session = new TeachingSession({
    port: { ...model, presentation: () => ({}), start: () => {}, close: () => {} },
    pkg,
    infer: async (r) => ((request = r), say('That plan is right.')),
  });
  await session.turn('I fixed my plan.');
  assert.equal(request.context.snapshot.state.attempts.at(-1).correct, true);
  assert.equal(request.context.snapshot.state.attempts.at(-1).assisted, true);
  session.close();
});
test('stale decisions are discarded after a model change', async () => {
  const pkg = await loadDirectory('lessons/cube-volume'),
    model = createCubes({ sessionId: crypto.randomUUID() });
  let count = 0;
  const spoken = [];
  const session = new TeachingSession({
    port: { ...model, presentation: () => ({}), start: () => {}, close: () => {} },
    pkg,
    infer: async () => {
      if (!count++) {
        model.learnerRotate(0.2);
        return say('Stale');
      }
      return say('Current');
    },
    speak: async (t) => spoken.push(t),
  });
  await session.turn('Look');
  assert.deepEqual(spoken, ['Current']);
  session.close();
});
test('Claude disables tools, hooks, ambient MCP without disabling subscription login', async () => {
  let invocation;
  await infer({
    settings: { provider: 'claude' },
    system: 'test',
    messages: [],
    tools: [
      {
        name: 'say',
        inputSchema: {
          type: 'object',
          properties: { text: { type: 'string' } },
          required: ['text'],
        },
      },
    ],
    context: {},
    runner: async (...args) => (
      (invocation = args),
      JSON.stringify({ type: 'result', structured_output: say('Hello') })
    ),
  });
  assert.ok(invocation[1].includes('--strict-mcp-config'));
  assert.equal(invocation[1][invocation[1].indexOf('--tools') + 1], '');
  assert.equal(invocation[1].includes('--bare'), false);
});
test('cancellation kills hanging subprocess', async () => {
  const c = new AbortController();
  setTimeout(() => c.abort(), 60);
  await assert.rejects(
    runProcess(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { signal: c.signal }),
    /Cancelled/,
  );
});
test('cancel aborts authored narration before delayed playback', async () => {
  const pkg = await loadDirectory('lessons/cube-volume');
  const model = createCubes({ sessionId: crypto.randomUUID() });
  let release, signal;
  const spoken = [];
  const session = new TeachingSession({
    port: { ...model, presentation: () => ({}), start() {}, close() {} },
    pkg,
    infer: async () => say('unused'),
    speak: async (text, abortSignal) => {
      signal = abortSignal;
      await new Promise((resolve) => {
        release = resolve;
      });
      if (!signal.aborted) spoken.push(text);
    },
  });
  const pending = session.narrate('Old scene');
  session.cancel();
  assert.equal(signal.aborted, true);
  release();
  await pending;
  assert.deepEqual(spoken, []);
  session.close();
});
test('cancel prevents a queued observation turn from restarting the tutor', async () => {
  const pkg = await loadDirectory('lessons/cube-volume');
  let notify,
    calls = 0;
  const session = new TeachingSession({
    port: {
      subscribe(fn) {
        notify = fn;
        return () => {};
      },
      close() {},
    },
    pkg,
    infer: async () => {
      calls++;
      return say('Unexpected');
    },
  });
  session.started = true;
  notify({ events: [{ source: 'learner', name: pkg.teaching.observationEvents[0] }] });
  session.cancel();
  await new Promise((resolve) => setTimeout(resolve, 550));
  assert.equal(calls, 0);
  session.close();
});

for (const mode of ['cached', 'pending', 'stale', 'failure', 'action', 'settings', 'closed']) {
  test(`speculative opening: ${mode}`, async () => {
    const pkg = await loadDirectory('lessons/cube-volume');
    const model = createCubes({ sessionId: crypto.randomUUID() });
    let calls = 0,
      starts = 0,
      release,
      signal;
    const spoken = [],
      logs = [];
    const session = new TeachingSession({
      port: {
        ...model,
        presentation: () => ({}),
        start() {
          starts++;
        },
        close() {},
      },
      pkg,
      infer: async (_, abortSignal) => {
        if (++calls > 1) return say(calls > (['cached', 'pending'].includes(mode) ? 1 : 2) ? 'Can you find one layer?' : 'Current opening.');
        signal = abortSignal;
        if (mode === 'pending' || mode === 'closed')
          return new Promise((resolve, reject) => {
            release = resolve;
            signal.addEventListener('abort', () => reject(Error('Aborted')), { once: true });
          });
        if (mode === 'failure') throw Error('Unavailable');
        if (mode === 'action')
          return { tool: 'prepare_fresh_box', arguments: '{"difficulty":"small"}' };
        return say('Prepared opening.');
      },
      speak: async (text) => spoken.push(text),
      log: (entry) => logs.push(entry),
    });
    session.prepareOpening();
    session.prepareOpening();
    const pending = session.opening.promise;
    await Promise.resolve();
    if (mode !== 'pending' && mode !== 'closed') await pending;
    assert.equal(calls, 1);
    assert.equal(starts, 0);
    assert.equal(session.started, false);
    assert.deepEqual(session.history, []);
    assert.deepEqual(spoken, []);
    assert.deepEqual(logs, []);
    if (mode === 'closed') {
      session.close();
      await pending;
      assert.equal(signal.aborted, true);
      assert.deepEqual(spoken, []);
      return;
    }
    if (mode === 'stale') model.learnerRotate(0.2);
    if (mode === 'settings') session.discardOpening();
    const revision = model.snapshot().revision;
    const starting = session.start();
    if (mode === 'pending') release(say('Prepared opening.'));
    await starting;
    const reused = ['cached', 'pending'].includes(mode);
    assert.equal(calls, reused ? 2 : 3);
    assert.equal(starts, 1);
    assert.deepEqual(spoken, [reused ? 'Prepared opening.' : 'Current opening.', 'Can you find one layer?']);
    assert.equal(model.snapshot().revision, revision);
    assert.equal(session.opening, null);
    await session.turn('What is a layer?');
    assert.equal(calls, reused ? 3 : 4);
    session.close();
  });
}

test('authored moments are discoverable and execute before their explanation is spoken', async () => {
  const { teachingToolsFor } = await import('../packages/teaching-runtime/session.mjs');
  const { createMoon } = await import('../lessons/moon-daytime/model/moon.mjs');
  const pkg = await loadDirectory('lessons/moon-daytime');
  pkg.teaching.teaching = [{ id: 'light_journey', whenToUse: 'Revisit the current light route', action: 'show_moment', args: {moment:'light_journey'}, text: 'Watch the sunlight travel.' }];
  const tool = teachingToolsFor(pkg).find((t) => t.name === 'explain_model');
  assert.ok(tool.inputSchema.properties.moment.enum.includes('light_journey'));
  assert.ok(
    tool.description.includes(
      pkg.teaching.teaching.find((m) => m.id === 'light_journey').whenToUse,
    ),
  );
  const model = createMoon();
  const spoken = [];
  const session = new TeachingSession({
    pkg,
    port: {
      ...model,
      start() {},
      close() {},
      presentation: () => ({ view: model.snapshot().state.view }),
    },
    infer: async () => ({
      tool: 'explain_model',
      arguments: JSON.stringify({ moment: 'light_journey', text: 'Watch the sunlight travel.' }),
    }),
    speak: async (text) => {
      const s = model.snapshot().state;
      assert.equal(s.view, 'space');
      assert.equal(s.mode, 'demonstration');
      assert.equal(s.rays, true);
      assert.equal(s.canAnswer, false);
      spoken.push(text);
    },
  });
  await session.turn('Where does moonlight come from?');
  assert.deepEqual(spoken, ['Watch the sunlight travel.']);
  assert.equal(model.snapshot().state.attempts.length, 0);
  session.close();
});

test('lesson-specific evidence tools accept only declared skill and focus IDs', async () => {
  const { teachingToolsFor } = await import('../packages/teaching-runtime/session.mjs');
  const { validate } = await import('../packages/lesson-contract/contracts.mjs');
  const pkg = await loadDirectory('lessons/moon-daytime');
  const tools = teachingToolsFor(pkg);
  const reflection = tools.find((t) => t.name === 'self_assessment');
  assert.doesNotThrow(() =>
    validate(reflection.inputSchema, { skill: 'moonlight', text: 'How do you feel?' }),
  );
  assert.throws(() =>
    validate(reflection.inputSchema, {
      skill: 'moonlight and daytime sky',
      text: 'How do you feel?',
    }),
  );
  for (const name of ['self_assessment', 'record_confidence'])
    assert.deepEqual(
      tools.find((t) => t.name === name).inputSchema.properties.skill.enum,
      pkg.teaching.selfEvaluation.skills.map((s) => s.id),
    );
  assert.deepEqual(
    tools.find((t) => t.name === 'record_understanding').inputSchema.properties.focus.enum,
    pkg.teaching.dialogue.focuses.map((f) => f.id),
  );
  const noSkills = structuredClone(pkg);
  delete noSkills.teaching.selfEvaluation;
  assert.ok(
    !teachingToolsFor(noSkills).some((t) =>
      ['self_assessment', 'record_confidence'].includes(t.name),
    ),
  );
});
test('check setup speaks its authored question once; voice answer resolves before the next scene', async () => {
  const {createMoon, tutorView} = await import('../lessons/moon-daytime/model/moon.mjs');
  const pkg = await loadDirectory('lessons/moon-daytime');
  const model = createMoon(), spoken = [], errors = [], replies = [];
  let calls = 0;
  const session = new TeachingSession({
    pkg, port:{...model, start(){}, close(){}, presentation:()=>tutorView(model.snapshot().state)},
    infer:async ({context}) => {
      calls++;
      if(calls===1) return {tool:'start_check',arguments:JSON.stringify({question:'moon_visible',situation:'day'})};
      if(calls===2) return {tool:'answer_check',arguments:JSON.stringify({sceneId:context.view.currentCheck.id,answer:true,words:'Yes'})};
      if(calls===3) return {tool:'show_moment',arguments:JSON.stringify({moment:'blocked_light'})};
      return say('What blocks the reflected light here?');
    },
    speak:async text=>spoken.push(text), log:e=>{if(e.type==='error') errors.push(e); if(e.type==='reply') replies.push(e.text);},
  });
  await session.turn('A small question please');
  assert.equal(calls,1); // no inference may rewrite the authored question
  assert.equal(spoken[0],tutorView(model.snapshot().state).currentCheck.question);
  await session.turn('Yes');
  assert.equal(model.snapshot().state.attempts.at(-1).modality,'voice');
  assert.equal(model.snapshot().state.moment,'blocked_light');
  assert.equal(replies.length,3);
  assert.equal(spoken.join(' '),replies.join(' '));
  assert.deepEqual(errors,[]);
  session.close();
});
for (const interrupted of [false, true]) {
  test(`demonstration waits for narration, then ${interrupted ? 'respects interruption' : 'hands over with a canonical check'}`, async () => {
    const {createMoon,tutorView}=await import('../lessons/moon-daytime/model/moon.mjs');
    const pkg=await loadDirectory('lessons/moon-daytime'), model=createMoon();
    let calls=0, release, began;
    const begun=new Promise(resolve=>{began=resolve;});
    const gate=new Promise(resolve=>{release=resolve;});
    const errors=[];
    const session=new TeachingSession({
      pkg,port:{...model,start(){},close(){},presentation:()=>tutorView(model.snapshot().state)},
      infer:async ()=>{
        calls++;
        return calls===1
          ? {tool:'show_moment',arguments:JSON.stringify({moment:'night_light'})}
          : {tool:'start_check',arguments:JSON.stringify({question:'day_night',situation:'night'})};
      },
      speak:async ()=>{began();await gate;},
      log:e=>{if(e.type==='error')errors.push(e);},
    });
    const turn=session.turn('I do not know where moonlight comes from.');
    await begun;
    assert.equal(calls,1);
    if(interrupted)session.cancel();
    release();await turn;
    assert.equal(calls,interrupted?1:2);
    if(!interrupted)assert.equal(tutorView(model.snapshot().state).currentCheck.status,'awaiting_answer');
    assert.deepEqual(errors,[]);
    session.close();
  });
}
test('button completion is explicitly answered in the next tutor context', async () => {
  const {createMoon,tutorView}=await import('../lessons/moon-daytime/model/moon.mjs');
  const pkg=await loadDirectory('lessons/moon-daytime'), model=createMoon();
  let calls=0;
  const session=new TeachingSession({
    pkg,port:{...model,start(){},close(){},presentation:()=>tutorView(model.snapshot().state)},
    infer:async ({context})=>{
      if(++calls===1)return {tool:'start_check',arguments:JSON.stringify({question:'moon_visible',situation:'day'})};
      assert.equal(context.view.currentCheck.status,'answered');
      assert.equal(context.view.currentCheck.response.correct,true);
      assert.equal(context.view.currentCheck.response.modality,'button');
      assert.equal(context.snapshot.availableActions.includes('answer_check'),false);
      return say('Yes, the Moon is above the horizon. What supplies its light?');
    },
  });
  await session.turn('A small check please.');
  model.learnerPredict(true);
  await session.turn('Respond to the committed work.','observation');
  assert.equal(calls,2);
  session.close();
});
