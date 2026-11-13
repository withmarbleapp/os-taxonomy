// Synthetic learners only. Uses the explicitly selected local player's tutor.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { loadDirectory } from '../packages/authoring-tools/archive.mjs';
import { infer } from '../packages/providers/index.mjs';
import {
  TeachingSession,
  tutorSystem,
  teachingToolsFor,
} from '../packages/teaching-runtime/session.mjs';
import { createMoon, tutorView } from '../lessons/moon-daytime/model/moon.mjs';
const settings = JSON.parse(
  await readFile(join(homedir(), '.config/Marble/settings.json'), 'utf8'),
);
const pkg = await loadDirectory('lessons/moon-daytime');
const results = [];
for (const [name, inputs] of [
  ['handoff-check', [
    'Sunlight reaches the Moon and bounces towards our eyes.',
    'Can I try a small daytime question about whether the Moon is above the horizon?',
    {clickCurrent:true},
    'I want to stop now.',
  ]],
  ['full-novice', [
    'Okay, I have noticed the Moon at night before.',
    'Can you help me find the Sun in this picture?',
    'The sunlight hits the Moon and bounces towards our eyes.',
    'Show me how that works in daytime.',
    'Give me a small question about whether the Moon is above the explorer’s horizon in daytime, with the light showing.',
    {answerCurrent:true},
    'Show me the position where Earth blocks the view.',
    'Can I try turning Earth to get the moonlight to reach the explorer?',
    {theta:0.65,text:'Done.'},
    'So at night the sunlight still reaches the Moon, and in the day it can reflect to me too if Earth is not in the way.',
    'I want to stop now.',
  ]],
  ['full-prior', [
    'Sunlight reflects from the Moon into our eyes. The Sun and Moon can both be above our horizon during daytime. Can I try a prediction with no rays?',
    {answerCurrent:true},
    'Give me a day or night question with some help.',
    'Actually I want to leave this question and see the light route instead.',
    'I understand that the Moon reflects the Sun’s light, and Earth can block our view.',
    'I am ready to stop.',
  ]],
  ['short-replies', [
    'Okay.',
    'It bounces off the Moon to us.',
    'It is day for the explorer, and the Moon still gets sunlight.',
    'Yes, I think so.',
    'What should I try?',
    {theta:0.65,text:'Done.'},
    'Earth is not blocking the moonlight now.',
    'I would like to stop.',
  ]],
  ['neutral-opening', ['Okay.', 'I can see the Sun and Moon.']],
  ['purposeful-exploration', [
    'The Moon reflects sunlight into our eyes. Daytime means the Sun is above our horizon; the Moon can be above it too. Can I try turning Earth?',
    { theta: 0.65, text: 'Done.' },
    { text: 'Done.' },
  ]],
  [
    'uncertain',
    [
      'I have seen the Moon at night, but I do not know why it shines.',
      'The light starts at the Sun, reaches the Moon, and then goes to our explorer.',
      'Can we try a little question with the light still showing?',
    ],
  ],
  [
    'prior-knowledge',
    [
      'Sunlight hits the Moon and some bounces into our eyes. We can see it in the day when it is above our horizon too.',
      'I think I could explain that to someone.',
      'I would like a new prediction to try.',
    ],
  ],
]) {
  if (process.argv[2] && process.argv[2] !== name) continue;
  const model = createMoon();
  const events = [];
  const session = new TeachingSession({
    pkg,
    port: {
      ...model,
      start() {},
      close() {},
      presentation() {
        const s = model.snapshot().state;
        return {
          ...tutorView(s),
          view: s.view,
          mode: s.mode,
          instruction: s.instruction,
          lightSegments: s.rays ? (s.moonAboveHorizon ? 2 : 1) : 0,
          currentAttempt: s.attempts.filter((a) => a.sceneId === s.sceneId).at(-1) ?? null,
        };
      },
    },
    infer: async (input, signal) =>
      infer({
        settings,
        system: tutorSystem(pkg),
        tools: [
          ...teachingToolsFor(pkg),
          ...pkg.experience.actions.filter((a) =>
            input.context.snapshot.availableActions.includes(a.name),
          ),
        ],
        messages: input.messages,
        context: input.context,
        signal,
      }),
    log: (e) => {
      if (['decision', 'reply', 'command_result', 'error'].includes(e.type)) {
        events.push(e);
        console.log(
          name,
          JSON.stringify(
            e.type === 'command_result'
              ? { type: e.type, name: e.name, accepted: e.result.accepted }
              : e,
          ),
        );
      }
    },
  });
  await session.prepareOpening();
  if (session.opening) await session.opening.promise;
  await session.start();
  for (const step of inputs) {
    let input = typeof step === 'string' ? step : step.text;
    let origin='learner';
    if (step.clickCurrent) {
      const s=model.snapshot().state;
      if(tutorView(s).currentCheck?.status!=='awaiting_answer') throw Error('Expected a pending button check');
      model.learnerPredict(s.task==='daylight'?s.day:s.moonAboveHorizon);
      input='The learner committed a button answer. Respond to the current result and carry the teaching forward.';
      origin='observation';
      events.push({type:'synthetic_action',action:'answer_button',state:model.snapshot().state});
    }
    if (step.answerCurrent) {
      const s = model.snapshot().state;
      if (tutorView(s).currentCheck?.status !== 'awaiting_answer') throw Error('Expected a pending check before synthetic answer');
      input = s.task === 'daylight' ? (s.day ? 'Day' : 'Night') : (s.moonAboveHorizon ? 'Yes' : 'No');
    }
    if (typeof step === 'object' && step.theta !== undefined && model.snapshot().state.canTurn) {
      model.learnerView('space');
      for (let n = 0; n < 20; n++) {
        const delta = step.theta - model.snapshot().state.theta;
        if (Math.abs(delta) < 0.001) break;
        model.learnerTurn(delta);
      }
      model.learnerView('sky');
      events.push({type:'synthetic_action', action:'rotate_and_view', state:model.snapshot().state});
    }
    events.push({ type: origin==='learner'?'synthetic_learner':'synthetic_observation', text: input });
    console.log(name, origin==='learner'?'LEARNER':'OBSERVATION', input);
    await session.turn(input,origin);
  }
  results.push({ name, events, finalState: model.snapshot().state });
  session.close();
}
await mkdir('artifacts/moon', { recursive: true });
await writeFile(
  process.argv[2] ? `artifacts/moon/live-tutor-${process.argv[2]}.json` : 'artifacts/moon/live-tutor.json',
  JSON.stringify(
    { provider: settings.provider, model: settings.model, synthetic: true, results },
    null,
    2,
  ),
);
if (results.some((r) => r.events.some((e) => e.type === 'error'))) process.exitCode = 1;
