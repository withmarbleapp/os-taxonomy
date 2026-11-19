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
  exec('start_check', { question: 'layer_plan', situation: 'small' });
  for (const [k, v] of Object.entries({ perLayer: '1', layers: '1', total: '1' }))
    model.enter(k, v);
  model.check();
  exec('resume_activity', {});
  const s = model.snapshot().state;
  for (const [k, v] of Object.entries({
    perLayer: s.cubesPerLayer,
    layers: s.layerCount,
    total: s.totalCubes,
  }))
    model.enter(k, String(v));
  model.check();
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
test('a decision is discarded when the scene changes while the tutor thinks, but not for a passive gesture', async () => {
  const pkg = await loadDirectory('lessons/cube-volume');
  assert.deepEqual(pkg.teaching.passiveEvents, ['block_rotated', 'entries_edited']);
  const run = async (during) => {
    const model = createCubes({ sessionId: crypto.randomUUID() });
    let count = 0;
    const spoken = [],
      logs = [];
    const session = new TeachingSession({
      port: { ...model, presentation: () => ({}), start: () => {}, close: () => {} },
      pkg,
      infer: async (request, signal, onEvent) => {
        if (!count++) {
          onEvent?.({ type: 'speech', text: 'First. ' });
          during(model);
          onEvent?.({ type: 'speech', text: 'Second.' });
          return say('First. Second.');
        }
        return say('Current.');
      },
      speak: async (t) => spoken.push(t.trim()),
      log: (e) => logs.push(e.type),
    });
    await session.turn('Look');
    session.close();
    return { spoken: spoken.join(' '), discarded: logs.includes('stale_decision_discarded') };
  };
  // Opening the layers changes what there is to talk about.
  const opened = await run((model) => model.gesture('open', true));
  assert.equal(opened.discarded, true);
  assert.ok(opened.spoken.endsWith('Current.'));
  assert.ok(!opened.spoken.includes('Second.'));
  // Turning the block does not: the reply is spoken in full, once.
  assert.deepEqual(await run((model) => model.gesture('turn', 0.2)), { spoken: 'First. Second.', discarded: false });
});
test('a field that belongs to another tool is dropped instead of losing the reply', async () => {
  const pkg = await loadDirectory('lessons/cube-volume'),
    model = createCubes({ sessionId: crypto.randomUUID() }),
    skill = pkg.teaching.selfEvaluation.skills[0].id;
  const spoken = [],
    logs = [],
    shown = [];
  const replies = [
    { tool: 'say', arguments: JSON.stringify({ text: 'Yes, 2 times 6 is 12.', notes: [{ skill, text: 'You said: six.' }] }) },
    { tool: 'finish', arguments: JSON.stringify({ text: 'Well done today.', notes: [{ skill, text: 'You said: six.' }] }) },
  ];
  const session = new TeachingSession({
    port: { ...model, presentation: () => ({}), start: () => {}, close: () => {} },
    pkg,
    infer: async () => replies.shift(),
    speak: async (t) => spoken.push(t),
    onReview: (r) => r && shown.push(r.outcome),
    log: (e) => logs.push(e),
  });
  session.started = true;
  await session.turn('2 times 6');
  assert.deepEqual(spoken, ['Yes, 2 times 6 is 12.']);
  assert.deepEqual(logs.find((e) => e.type === 'arguments_trimmed').dropped, ['notes']);
  assert.equal(logs.some((e) => e.type === 'error'), false);
  // Finishing may carry the wrap-up notes.
  await session.turn('I want to stop.');
  assert.equal(logs.some((e) => e.type === 'error'), false);
  assert.equal(shown.length, 1);
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
  notify({ snapshot: { revision: 1 }, events: [{ source: 'learner', name: pkg.teaching.observationEvents[0] }] });
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
    if (mode === 'stale') model.gesture('turn', 0.2);
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
  const { recordSchemaFor } = await import('../packages/teaching-runtime/session.mjs');
  const records = recordSchemaFor(pkg);
  assert.deepEqual(
    reflection.inputSchema.properties.skill.enum,
    pkg.teaching.selfEvaluation.skills.map((s) => s.id),
  );
  assert.deepEqual(
    records.confidence.items.properties.skill.enum,
    pkg.teaching.selfEvaluation.skills.map((s) => s.id),
  );
  assert.deepEqual(
    records.understanding.items.properties.focus.enum,
    pkg.teaching.dialogue.focuses.map((f) => f.id),
  );
  // Recording is a field on a decision, never a decision of its own.
  assert.ok(!tools.some((t) => ['record_understanding', 'record_confidence'].includes(t.name)));
  const noSkills = structuredClone(pkg);
  delete noSkills.teaching.selfEvaluation;
  assert.ok(!teachingToolsFor(noSkills).some((t) => t.name === 'self_assessment'));
  assert.equal(recordSchemaFor(noSkills).confidence, undefined);
});
test('a reply carries its understanding and confidence records in one inference', async () => {
  const { createMoon, tutorView } = await import('../lessons/moon-daytime/model/moon.mjs');
  const pkg = await loadDirectory('lessons/moon-daytime');
  const model = createMoon(),
    logs = [];
  let calls = 0,
    lastRequest;
  const session = new TeachingSession({
    pkg,
    port: { ...model, start() {}, close() {}, presentation: () => tutorView(model.snapshot().state) },
    infer: async (request) => {
      calls++;
      lastRequest = {
        learningSeen: request.context.learning.length,
        messages: [...request.messages],
      };
      return {
        ...say('Yes, it bounces off the Moon. Where does it go next?'),
        understanding: [
          { focus: 'light', interpretation: 'understood', evidence: 'Said sunlight bounces off the Moon.' },
          { focus: 'not-a-focus', interpretation: 'understood', evidence: 'Invalid focus is dropped.' },
        ],
        confidence: [{ skill: 'moonlight', words: 'I think I get it.' }],
      };
    },
    log: (e) => logs.push(e),
  });
  await session.turn('The sunlight bounces off the Moon. I think I get it.');
  assert.equal(calls, 1);
  assert.deepEqual(
    session.learning.map((l) => [l.focus, l.interpretation]),
    [['light', 'understood']],
  );
  assert.deepEqual(session.confidence, [{ skill: 'moonlight', words: 'I think I get it.' }]);
  assert.deepEqual(logs.filter((e) => e.type === 'error'), []);
  assert.equal(logs.filter((e) => e.type === 'reply').length, 1);
  // The next request shows the tutor what it recorded.
  await session.turn('Okay.');
  assert.equal(lastRequest.learningSeen, 1);
  assert.ok(lastRequest.messages.some((m) => m.name === 'record_understanding'));
  session.close();
});
test('the tutor is told to record inside its decision, and cannot record as a separate step', async () => {
  const { tutorSystem, teachingToolsFor: toolsFor } = await import(
    '../packages/teaching-runtime/session.mjs'
  );
  const pkg = await loadDirectory('lessons/moon-daytime');
  const system = tutorSystem(pkg);
  assert.match(system, /RECORDS:/);
  assert.match(system, /Focus IDs: light, horizon, explanation\./);
  const { createMoon, tutorView } = await import('../lessons/moon-daytime/model/moon.mjs');
  const model = createMoon(),
    errors = [];
  const session = new TeachingSession({
    pkg,
    port: { ...model, start() {}, close() {}, presentation: () => tutorView(model.snapshot().state) },
    infer: async () => ({
      tool: 'record_understanding',
      arguments: JSON.stringify({ focus: 'light', interpretation: 'understood', evidence: 'x' }),
    }),
    log: (e) => e.type === 'error' && errors.push(e.message),
  });
  await session.turn('Hello');
  assert.deepEqual(errors, ['Tutor requested an unavailable tool']);
  assert.ok(!toolsFor(pkg).some((t) => t.name.startsWith('record_')));
  session.close();
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
      if(calls===2) return {tool:'answer_check',arguments:JSON.stringify({sceneId:context.view.currentCheck.id,choice:0,words:'Yes'})};
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
  test(`the handover is prepared during narration but acts only after it, ${interrupted ? 'and is discarded on interruption' : 'then starts a canonical check'}`, async () => {
    const {createMoon,tutorView}=await import('../lessons/moon-daytime/model/moon.mjs');
    const pkg=await loadDirectory('lessons/moon-daytime'), model=createMoon();
    let calls=0, release, began, aheadSignal;
    const begun=new Promise(resolve=>{began=resolve;});
    const gate=new Promise(resolve=>{release=resolve;});
    const errors=[];
    const session=new TeachingSession({
      pkg,port:{...model,start(){},close(){},presentation:()=>tutorView(model.snapshot().state)},
      infer:async (request,signal)=>{
        calls++;
        if(calls===1)return {tool:'show_moment',arguments:JSON.stringify({moment:'night_light'})};
        aheadSignal=signal;
        // The prepared request already contains the narration being spoken.
        assert.ok(request.messages.some(m=>m.role==='assistant'&&/night for the explorer/.test(m.text)));
        return {tool:'start_check',arguments:JSON.stringify({question:'day_night',situation:'night'})};
      },
      speak:async ()=>{began();await gate;},
      log:e=>{if(e.type==='error')errors.push(e);},
    });
    const turn=session.turn('I do not know where moonlight comes from.');
    await begun;
    // Inference for the handover is already running, but nothing has acted on it.
    assert.equal(calls,2);
    assert.equal(tutorView(model.snapshot().state).currentCheck,null);
    if(interrupted)session.cancel();
    release();await turn;
    assert.equal(calls,2);
    assert.equal(aheadSignal.aborted,interrupted);
    assert.equal(tutorView(model.snapshot().state).currentCheck?.status,interrupted?undefined:'awaiting_answer');
    assert.deepEqual(errors,[]);
    session.close();
  });
}
test('speech streamed by a prepared handover is held until the narration has finished', async () => {
  const {createMoon,tutorView}=await import('../lessons/moon-daytime/model/moon.mjs');
  const pkg=await loadDirectory('lessons/moon-daytime'), model=createMoon();
  let calls=0, release, began, narrating=false;
  const begun=new Promise(resolve=>{began=resolve;});
  const gate=new Promise(resolve=>{release=resolve;});
  const spoken=[], errors=[];
  const session=new TeachingSession({
    pkg,port:{...model,start(){},close(){},presentation:()=>tutorView(model.snapshot().state)},
    infer:async (request,signal,onEvent)=>{
      if(++calls===1)return {tool:'show_moment',arguments:JSON.stringify({moment:'night_light'})};
      onEvent({type:'speech',text:'Where does the light start? '});
      return say('Where does the light start? Tell me what you see.');
    },
    speak:async text=>{
      assert.equal(narrating,false,'follow-up speech overlapped the narration');
      spoken.push(text);
      if(spoken.length===1){narrating=true;began();await gate;narrating=false;}
    },
    log:e=>{if(e.type==='error')errors.push(e);},
  });
  const turn=session.turn('I do not know where moonlight comes from.');
  await begun;
  assert.equal(calls,2);
  assert.equal(spoken.length,1);
  release();await turn;
  assert.equal(
    spoken.join(' ').replace(/\s+/g,' ').trim(),
    'Here it is night for the explorer. Watch sunlight reach the Moon, then reflect towards the explorer’s eyes. Where does the light start? Tell me what you see.',
  );
  assert.deepEqual(errors,[]);
  session.close();
});
test('a prepared handover is discarded when the scene changes during narration', async () => {
  const {createMoon,tutorView}=await import('../lessons/moon-daytime/model/moon.mjs');
  const pkg=await loadDirectory('lessons/moon-daytime'), model=createMoon();
  let calls=0, release, began;
  const begun=new Promise(resolve=>{began=resolve;});
  const gate=new Promise(resolve=>{release=resolve;});
  const seen=[], errors=[];
  const session=new TeachingSession({
    pkg,port:{...model,start(){},close(){},presentation:()=>tutorView(model.snapshot().state)},
    infer:async request=>{
      seen.push(request.context.snapshot.revision);
      if(++calls===1)return {tool:'show_moment',arguments:JSON.stringify({moment:'night_light'})};
      return say('What do you notice?');
    },
    speak:async ()=>{began();await gate;},
    log:e=>{if(e.type==='error')errors.push(e);},
  });
  const turn=session.turn('I do not know where moonlight comes from.');
  await begun;
  assert.equal(calls,2);
  // A routine view change during narration moves the revision without cancelling the turn.
  model.control('set_view',{view:model.snapshot().state.view==='space'?'sky':'space'});
  release();await turn;
  assert.equal(calls,3);
  assert.equal(seen[2],model.snapshot().revision);
  assert.deepEqual(errors,[]);
  session.close();
});
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
  model.answer(0);
  await session.turn('Respond to the committed work.','observation');
  assert.equal(calls,2);
  session.close();
});

test('wrap-up states come from recorded evidence, with help stamped by the runtime', async () => {
  const { outcomeFor, stampRecord } = await import('../packages/teaching-runtime/outcome.mjs');
  const pkg = {
    teaching: {
      id: 'lesson',
      curriculum: ['topic-1'],
      evidenceEvents: ['response_committed'],
      dialogue: {
        focuses: [
          { id: 'a', goals: ['g1'] },
          { id: 'b', goals: ['g2'] },
          { id: 'c', goals: ['g2'] },
          { id: 'd', goals: ['g3'] },
        ],
      },
      selfEvaluation: {
        skills: [
          { id: 'one', description: 'Do one.', focuses: ['a'] },
          { id: 'two', description: 'Do two.', focuses: ['b', 'c'] },
          { id: 'three', description: 'Do three.', focuses: ['d'] },
          { id: 'four', description: 'Do four.', focuses: [] },
        ],
      },
    },
  };
  const work = (assisted, sceneId = 's1') => ({ source: 'learner', name: 'response_committed', data: { assisted, sceneId } });
  const stamp = (record, origin, latest, sceneId = 's1') => stampRecord(record, { origin, work: latest, sceneId });
  const learning = [
    // Own words count as the child's own.
    stamp({ focus: 'a', interpretation: 'understood', evidence: 'said both are needed' }, 'learner'),
    // Committed work the lesson marked as helped stays "with help", however it is described.
    stamp({ focus: 'b', interpretation: 'understood', evidence: 'chose the right side entirely alone' }, 'observation', work(true)),
    // A question or a difficulty means the skill came up, not that it was shown.
    stamp({ focus: 'd', interpretation: 'needs_help', evidence: 'unsure where to stand' }, 'learner'),
  ];
  // Independence is never the default: work with no evidence event behind it is helped,
  assert.equal(stamp({}, 'observation').assisted, true);
  // and so are words about a task whose committed answer was helped,
  assert.equal(stamp({}, 'learner', work(true)).assisted, true);
  // until the child has moved on to another task.
  assert.equal(stamp({}, 'learner', work(true), 's2').assisted, false);
  assert.equal(stamp({}, 'learner', work(false)).assisted, false);
  const outcome = outcomeFor(pkg, learning, { one: 'You said: “both”.', four: 'You did four.' });
  assert.deepEqual(
    outcome.skills.map((r) => r.state),
    ['own', 'help', 'seen', 'none'],
  );
  assert.equal(outcome.skills[0].proof, 'You said: “both”.');
  assert.equal(outcome.skills[1].proof, 'chose the right side entirely alone');
  // A note cannot stand in for evidence.
  assert.equal(outcome.skills[3].proof, 'We haven’t tried this one yet.');
  assert.deepEqual([outcome.shown, outcome.complete, outcome.next], [1, false, 'two']);
  assert.deepEqual(outcome.skills[1].goals, ['g2']);
  assert.deepEqual(outcome.topics, ['topic-1']);
  // Unassisted work, later, lifts the skill to "on your own".
  learning.push(stamp({ focus: 'c', interpretation: 'understood', evidence: 'built it' }, 'observation', work(false)));
  assert.equal(outcomeFor(pkg, learning).skills[1].state, 'own');
});

test('review shows the wrap-up while the tutor speaks; finishing logs the outcome', async () => {
  const pkg = await loadDirectory('lessons/moon-daytime');
  const skill = pkg.teaching.selfEvaluation.skills[0],
    focus = skill.focuses[0];
  const { createMoon } = await import('../lessons/moon-daytime/model/moon.mjs');
  const model = createMoon({ sessionId: crypto.randomUUID() });
  const shown = [],
    logs = [],
    replies = [
      {
        tool: 'review',
        arguments: JSON.stringify({ text: 'Here is what you have done.', notes: [{ skill: skill.id, text: 'You said it bounces.' }] }),
        understanding: [{ focus, interpretation: 'understood', evidence: 'said the light bounces off the Moon' }],
      },
      say('Let us carry on.'),
      { tool: 'finish', arguments: JSON.stringify({ text: 'Well done today.' }) },
    ];
  let tools;
  const session = new TeachingSession({
    port: { ...model, presentation: () => ({}), start: () => {}, close: () => {} },
    pkg,
    infer: async (r) => ((tools = r.tools ?? tools), replies.shift()),
    onReview: (r) => shown.push(r && { moment: r.moment, states: r.outcome.skills.map((s) => s.state), proof: r.outcome.skills[0].proof }),
    log: (e) => logs.push(e),
  });
  session.started = true;
  await session.turn('How am I doing?');
  assert.equal(shown[0].moment, 'deciding');
  assert.equal(shown[0].states[0], 'own');
  assert.equal(shown[0].proof, 'You said it bounces.');
  // Answering takes the screen away again.
  await session.turn('I want to keep going.');
  assert.equal(shown[1], null);
  await session.turn('I want to stop now.');
  assert.equal(shown.at(-1).moment, 'finished');
  assert.equal(logs.find((e) => e.type === 'completed').outcome.skills[0].state, 'own');
  session.close();
  assert.equal(logs.at(-1).type, 'closed');
});

test('the outcome is saved when the child leaves, whether or not the closing words finish', async () => {
  const pkg = await loadDirectory('lessons/moon-daytime');
  const focus = pkg.teaching.selfEvaluation.skills[0].focuses[0];
  const { createMoon } = await import('../lessons/moon-daytime/model/moon.mjs');
  const make = (replies, speak) => {
    const logs = [];
    const session = new TeachingSession({
      port: { ...createMoon({ sessionId: crypto.randomUUID() }), presentation: () => ({}), start: () => {}, close: () => {} },
      pkg,
      infer: async () => replies.shift(),
      speak,
      log: (e) => logs.push(e),
    });
    return { session, logs };
  };
  // Leaving part-way.
  const early = make([{ ...say('Good.'), understanding: [{ focus, interpretation: 'understood', evidence: 'said it bounces' }] }]);
  early.session.started = true;
  await early.session.turn('It bounces off the Moon.');
  early.session.close();
  early.session.close();
  assert.deepEqual(early.logs.filter((e) => e.type === 'closed').map((e) => e.outcome.skills[0].state), ['own']);
  // Leaving while the tutor is still saying goodbye.
  let spoken;
  const speaking = new Promise((resolve) => (spoken = resolve));
  const late = make([{ tool: 'finish', arguments: JSON.stringify({ text: 'Well done today.' }) }], (text, signal) => {
    spoken();
    return new Promise((_, reject) => signal?.addEventListener('abort', () => reject(signal.reason)));
  });
  late.session.started = true;
  const turn = late.session.turn('I want to stop now.').catch(() => {});
  await speaking;
  late.session.close();
  await turn;
  assert.deepEqual(late.logs.filter((e) => e.outcome).map((e) => e.type), ['completed', 'closed']);
  // A lesson that was opened and never begun leaves nothing.
  const unopened = make([]);
  unopened.session.close();
  assert.equal(unopened.logs.some((e) => e.outcome), false);
});
