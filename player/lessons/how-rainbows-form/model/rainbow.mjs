import { object, validate, commandSchema, assertSnapshot } from '../contracts.mjs';
import {
  DEG,
  COLOURS,
  WATER,
  dropRay,
  rainbow,
  wrap,
  angleBetween,
  sunBehindSpot,
  facingWater,
} from './optics.mjs';

const bool = { type: 'boolean' },
  num = { type: 'number' },
  text = { type: 'string' };
const TASKS = ['demonstration', 'conditions', 'turn', 'walk', 'build', 'sun_height', 'aim_beam', 'predict', 'check'];
const task = { enum: TASKS };
const STATUS = ['no_sunlight', 'no_drops', 'sun_too_high', 'drops_elsewhere', 'looking_away', 'rainbow'];
const SITUATIONS = ['sun_behind', 'far_side', 'side_on', 'facing_sun', 'cloud_over_sun', 'water_off', 'high_sun'];
const MOMENTS = ['rainbow_scene', 'sunlight_path', 'inside_drop', 'colours_spread', 'why_a_bow', 'red_on_top', 'high_sun'];
const ACTIVITIES = ['sun_and_rain', 'turn_to_find', 'walk_around', 'make_rainbow', 'predict', 'aim_sunbeam', 'sun_height'];
const CHECKS = ['see_rainbow', 'sun_where', 'drop_exit', 'drop_colours', 'reach_rainbow'];
const FIND_TASKS = ['conditions', 'turn', 'walk', 'build'];
const DROP_CHECKS = ['drop_exit', 'drop_colours'];

const attempt = object({
  id: text,
  sceneId: text,
  task,
  check: text,
  situation: text,
  question: text,
  answer: text,
  correct: bool,
  assisted: bool,
  modality: { enum: ['button', 'voice'] },
  words: text,
});
const find = object({
  id: text,
  sceneId: text,
  task,
  source: { enum: ['rain', 'fountain'] },
  assisted: bool,
  amount: text,
});

// One object per question: its speech, its on-screen text and its buttons all come from here.
const QUESTIONS = {
  see_rainbow: { question: 'Can Mia see a rainbow from here?', choices: ['Yes', 'No'] },
  sun_where: {
    lead: 'Think about where Mia stood when she saw the rainbow.',
    question: 'To see a rainbow, where should the Sun be?',
    choices: ['Behind Mia', 'In front of Mia'],
    correct: 0,
    fact: 'The Sun has to be behind Mia, with the drops in front of her.',
  },
  drop_exit: {
    lead: 'The sunbeam has gone into the drop and reached the back.',
    question: 'After the bounce, where does the light come out?',
    choices: ['Out the far side', 'Back on the Sun’s side'],
    correct: 1,
    fact: 'The light comes back out on the Sun’s side.',
  },
  drop_colours: {
    lead: 'Look at the colours leaving the drop.',
    question: 'Where do the rainbow’s colours come from?',
    choices: ['They were already in the sunlight', 'The raindrop makes them'],
    correct: 0,
    fact: 'The colours were already in the sunlight. The drop spreads them out.',
  },
  reach_rainbow: {
    lead: 'Mia would love to touch her rainbow.',
    question: 'If Mia walks towards the rainbow, can she reach it?',
    choices: ['Yes, if she walks far enough', 'No, it moves when she moves'],
    correct: 1,
    fact: 'She can never reach it. The rainbow moves when Mia moves.',
  },
};
const SITUATION_LEAD = {
  sun_behind: 'The Sun is behind Mia, and she is looking at the rain.',
  far_side: 'Mia has walked to the far side of the rain. Now the Sun is in front of her.',
  side_on: 'Mia is standing to one side, with the Sun next to her.',
  facing_sun: 'The Sun is shining and the rain is falling, but Mia has turned to face the Sun.',
  cloud_over_sun: 'It is still raining, but a cloud has covered the Sun.',
  water_off: 'The Sun is shining, but the rain has stopped.',
  high_sun: 'The Sun is high in the sky, like at midday.',
};
const waterWord = (s) => (s.source === 'rain' ? 'rain' : 'fountain');
const STATUS_FACT = {
  rainbow: () => 'The Sun is behind Mia and the drops are in front: a rainbow.',
  no_sunlight: () => 'A cloud is blocking the sunlight. No sunlight, no rainbow.',
  no_drops: (s) => (s.source === 'rain' ? 'The rain has stopped. No drops, no rainbow.' : 'The fountain is off. No drops, no rainbow.'),
  sun_too_high: () => 'The Sun is too high. The bow has sunk below the ground.',
  drops_elsewhere: () => 'No rainbow from here. The drops are not on the side away from the Sun.',
  looking_away: () => 'Mia is looking the wrong way to see the colours.',
};

const facts = (s) => rainbow(s);
const isSeeQuestion = (s) => s.task === 'predict' || (s.task === 'check' && s.check === 'see_rainbow');
const homeView = (s) => (s.task === 'aim_beam' || (s.task === 'check' && DROP_CHECKS.includes(s.check)) ? 'drop' : 'outdoor');

export function questionFor(s) {
  if (!['predict', 'check'].includes(s.task)) return null;
  const q = QUESTIONS[s.task === 'predict' ? 'see_rainbow' : s.check];
  const lead =
    s.task === 'predict'
      ? 'This is a new place, and Mia’s window is covered.'
      : s.check === 'see_rainbow'
        ? SITUATION_LEAD[s.situation]
        : q.lead;
  return {
    id: s.sceneId,
    check: s.task === 'predict' ? 'see_rainbow' : s.check,
    question: q.question,
    choices: [...q.choices],
    speech: `${lead} ${q.question}`,
    status: s.revealed ? 'answered' : s.mode === 'activity' ? 'awaiting_answer' : 'paused_for_help',
    response: s.revealed ? (s.attempts.filter((a) => a.sceneId === s.sceneId).at(-1) ?? null) : null,
  };
}
const correctChoice = (s) => (isSeeQuestion(s) ? (facts(s).seen ? 0 : 1) : QUESTIONS[s.check].correct);
const factFor = (s) => {
  if (!isSeeQuestion(s)) return QUESTIONS[s.check].fact;
  const f = facts(s);
  return (f.seen ? 'Yes. ' : 'No. ') + STATUS_FACT[f.status](s);
};

const ACTIVITY_SPEECH = {
  sun_and_rain:
    'Tap the rain cloud to start or stop the rain. Tap the Sun’s cloud to cover or uncover the Sun. Watch Mia’s window to see when the rainbow shows up.',
  turn_to_find:
    'Mia is looking at the Sun, and she cannot see a rainbow. Drag the arrow in front of Mia to turn her, until the rainbow shows in her window.',
  walk_around:
    'Now Mia always looks at the rain. Drag Mia around the shower. Find where she has to stand to see the rainbow.',
  make_rainbow:
    'Here is a garden fountain, and the Sun is on the other side now. Make a rainbow for Mia. You can tap the fountain, move Mia and turn her.',
  aim_sunbeam: 'Drag the sunbeam up and down the drop. Watch where the colours come out.',
  sun_height: 'Tap the Sun to lift it higher in the sky. Watch what happens to Mia’s rainbow.',
};
const ACTIVITY_INSTRUCTION = {
  sun_and_rain: 'Tap the clouds. When does Mia see a rainbow?',
  turn_to_find: 'Turn Mia until she sees the rainbow.',
  walk_around: 'Move Mia around the rain. Where does she see the rainbow?',
  make_rainbow: 'Make a rainbow for Mia at the fountain.',
  aim_sunbeam: 'Move the sunbeam. Where do the colours come out?',
  sun_height: 'Tap the Sun to lift it. What happens to the rainbow?',
};
const ACTIVITY_TASK = {
  sun_and_rain: 'conditions',
  turn_to_find: 'turn',
  walk_around: 'walk',
  make_rainbow: 'build',
  predict: 'predict',
  aim_sunbeam: 'aim_beam',
  sun_height: 'sun_height',
};
const TASK_ACTIVITY = Object.fromEntries(Object.entries(ACTIVITY_TASK).map(([a, t]) => [t, a]));

function sunlightPathSpeech(s) {
  const start = 'Follow the yellow arrows of sunlight. ';
  return (
    start +
    {
      rainbow: 'They fly past Mia and into the drops. The drops send coloured light back to Mia’s eyes. That light is her rainbow.',
      looking_away: 'They fly into the drops, and the drops send coloured light back towards Mia. But Mia is looking the other way.',
      drops_elsewhere: 'They reach the drops. Each drop sends its colours back towards the Sun’s side, and Mia is not standing there.',
      no_drops: 'They fly past Mia, but there are no drops in the air to send the light back.',
      no_sunlight: 'They stop at the cloud. No sunlight reaches the drops.',
      sun_too_high: 'They come down very steeply. So the colours come back out steeply too, and hit the ground before they reach Mia.',
    }[facts(s).status]
  );
}
const MOMENT_SPEECH = {
  rainbow_scene:
    'This is Mia. The Sun is low behind her, and rain is falling in front of her. The little window shows what Mia sees: a rainbow.',
  inside_drop:
    'Let’s zoom in on one raindrop. A beam of sunlight goes in and bends. It bounces off the back of the drop. Then it bends again on the way out. So the light comes back out on the same side as the Sun.',
  colours_spread:
    'Sunlight looks white, but it is many colours mixed together. When light bends, each colour bends a little differently. Red bends the least and violet bends the most, so the colours fan out. The drop does not make the colours. It spreads out colours that were already in the sunlight.',
  why_a_bow:
    'Look at the dotted line from the Sun, through Mia’s head, to her shadow. Every drop that sends colour to Mia sits at the same angle from that line. Together those drops make a circle. The ground hides the bottom of the circle, so Mia sees a bow.',
  red_on_top:
    'Each drop sends only one colour to Mia’s eyes. The higher drop sends her red. The lower drop sends her violet. Millions of drops together paint the whole bow, with red on top.',
  high_sun:
    'Now the Sun is high, like at midday. The circle of colours has sunk below the ground. There are no raindrops down there, so Mia sees no rainbow. Rainbows show up when the Sun is low, in the morning or the evening.',
};
const MOMENT_INSTRUCTION = {
  rainbow_scene: 'Mia sees a rainbow. Look in her window.',
  sunlight_path: 'Follow the sunlight.',
  inside_drop: 'Light bends in, bounces, and bends out.',
  colours_spread: 'Each colour bends a little differently.',
  why_a_bow: 'The drops that send colour make a circle.',
  red_on_top: 'Higher drops send red. Lower drops send violet.',
  high_sun: 'High Sun: the bow sinks below the ground.',
};

export function tutorView(s) {
  const f = facts(s),
    covered = s.windowCovered,
    sunSide = angleBetween(s.heading, s.sunAz),
    onDrop = s.view === 'drop';
  const green = dropRay(s.beam, COLOURS[1].n);
  return {
    screen: onDrop
      ? {
          view: 'close-up of one raindrop (flat diagram)',
          shows:
            s.dropStage === 'to_bounce'
              ? 'A white sunbeam from the Sun’s side enters the drop, bends and reaches the back. The rest of the path is hidden until the child answers.'
              : 'A white sunbeam from the Sun’s side enters the drop, bends, bounces off the back and leaves as a fan of rainbow colours, running from red at one edge through orange, yellow, green and blue to violet at the other, on the Sun’s side. A faint line shows light that leaves through the back.',
          note: 'The colour fan outside the drop is drawn wider than in nature so it can be seen.',
        }
      : {
          view: 'meadow seen from outside, with a small window showing what Mia sees',
          shows: ['the Sun (low, not to scale)', 'the Sun’s cloud', s.source === 'rain' ? 'a rain cloud over the shower' : 'a garden fountain', 'Mia'],
          note: 'The rainbow is never drawn in the meadow itself. It only appears in Mia’s window, because a rainbow is light reaching her eyes, not an object standing in the field.',
        },
    conditions: onDrop
      ? null
      : {
          sun: (s.sunShining ? 'shining' : 'covered by a cloud') + `, ${s.sunHeight} in the sky`,
          water: s.raining ? (s.source === 'rain' ? 'rain falling' : 'fountain spraying') : s.source === 'rain' ? 'no rain falling' : 'fountain off',
        },
    mia: onDrop
      ? null
      : {
          sunIs: sunSide > 120 * DEG ? 'behind her' : sunSide < 60 * DEG ? 'in front of her' : 'to her side',
          lookingAt: angleBetween(s.heading, facingWater(s.spot)) < 50 * DEG ? `the ${waterWord(s)}` : `away from the ${waterWord(s)}`,
          window: covered ? 'covered until the child answers' : 'open',
          sees: covered ? 'hidden from the child' : f.seen ? `a rainbow (${f.amount})` : 'no rainbow',
          why: f.status,
        },
    drop: onDrop
      ? {
          beamHeight: Number(s.beam.toFixed(2)),
          lightLeavesDeg: Number(green.backAngleDeg.toFixed(1)),
          note: 'lightLeavesDeg is the angle between the leaving light and the direction straight back to the Sun. It never exceeds about 42; most light piles up near that angle.',
        }
      : null,
    supports: { sunlightArrows: s.rays !== 'none', colouredLightToMia: s.rays === 'full' && f.litShare > 0, circleOfDrops: s.cone, redAndVioletDrops: s.colourDrops },
    currentCheck: questionFor(s),
    investigation: FIND_TASKS.includes(s.task)
      ? { activity: TASK_ACTIVITY[s.task], target: 'A rainbow shows in Mia’s window.', targetReached: f.seen, foundThisScene: s.found }
      : null,
    currentAttempt: s.attempts.filter((a) => a.sceneId === s.sceneId).at(-1) ?? null,
    latestFind: s.finds.filter((a) => a.sceneId === s.sceneId).at(-1) ?? null,
    learnerCanDo: learnerCanDo(s),
  };
}
function learnerCanDo(s) {
  if (s.mode === 'demonstration')
    return ['Look and describe what is shown', ...(s.task !== 'demonstration' ? ['Try it: return to the same activity'] : [])];
  if (['predict', 'check'].includes(s.task))
    return s.revealed ? ['Look at the result'] : [`Answer by voice or button: ${questionFor(s).choices.join(' / ')}`, ...(homeView(s) === 'outdoor' ? ['Ask for a hint'] : [])];
  return {
    conditions: ['Tap the rain cloud to start or stop the rain', 'Tap the Sun’s cloud to cover or uncover the Sun'],
    turn: ['Drag the Turn Mia arrow (or arrow keys) to change where she looks'],
    walk: ['Drag Mia (or arrow keys) to walk her around the rain; she keeps looking at it'],
    build: ['Tap the fountain to switch it on or off', 'Tap the Sun’s cloud', 'Drag Mia to move her', 'Drag the Turn Mia arrow to turn her', 'Ask for a hint'],
    sun_height: ['Tap the Sun to move it: low, middle, high'],
    aim_beam: ['Drag the sunbeam up and down (or arrow keys)'],
  }[s.task];
}

export const descriptor = {
  protocolVersion: 1,
  kind: 'how-rainbows-form',
  apiVersion: 1,
  releaseId: 'how-rainbows-form-v1',
  description:
    'How a rainbow forms, for a child of about eight. Outdoor model: a low Sun, water drops (a rain shower or a fountain) and an explorer called Mia. A primary rainbow is every direction 42 degrees from the point opposite the Sun; Mia sees it only where sunlit drops lie in those directions and inside her view. rainbowStatus says why or why not: no_sunlight, no_drops, sun_too_high, drops_elsewhere (no drops opposite the Sun as seen from her spot), looking_away, rainbow. The rainbow is drawn only in Mia’s window, never in the meadow. Drop model: one round drop with real refraction, one reflection inside, and refraction out, for red, green and violet. Sizes and distances are illustrative; the Sun is drawn close. Not modelled: second bows, brightness, drop size, light that reflects more than once. Exact answers and assistance are stored separately from what the child says. No completion threshold.',
  stateSchema: object({
    view: { enum: ['outdoor', 'drop'] },
    task,
    mode: { enum: ['demonstration', 'activity'] },
    moment: text,
    demonstratedMoments: { type: 'array', items: text, maxItems: 7 },
    sceneId: text,
    sunAz: num,
    sunHeight: { enum: ['low', 'mid', 'high'] },
    sunShining: bool,
    raining: bool,
    source: { enum: ['rain', 'fountain'] },
    spot: num,
    heading: num,
    autoFace: bool,
    rays: { enum: ['none', 'sunlight', 'full'] },
    cone: bool,
    colourDrops: bool,
    windowCovered: bool,
    beam: num,
    dropStage: { enum: ['full', 'to_bounce'] },
    check: text,
    situation: text,
    revealed: bool,
    assisted: bool,
    found: bool,
    attempts: { type: 'array', items: attempt, maxItems: 100 },
    finds: { type: 'array', items: find, maxItems: 100 },
    instruction: text,
    rainbowStatus: { enum: STATUS },
    rainbowAmount: text,
    canToggleSun: bool,
    canToggleWater: bool,
    canTurn: bool,
    canWalk: bool,
    canMoveSun: bool,
    canAim: bool,
    canAnswer: bool,
    canHint: bool,
  }),
  actions: [
    {
      name: 'show_moment',
      description:
        'Show and narrate one moment with authored speech, then continue this turn into a question or activity for the child. rainbow_scene: the opening meadow, Sun behind Mia, rain ahead, rainbow in her window. sunlight_path: HELP on the CURRENT outdoor setup; draws sunlight arrows and any coloured light coming back to Mia, and says why she does or does not see a rainbow; marks pending work as assisted. inside_drop: close-up of one drop, light bends in, bounces off the back, bends out on the Sun’s side; use when the child wonders what the drops do. colours_spread: same close-up, white sunlight fans into colours that were already in it; use for "where do the colours come from" or "the water makes the colours". inside_drop and colours_spread pause current work without losing it; use resume_activity to return. Deeper, only once Sun-behind and the drop are familiar: why_a_bow (the drops that send colour form a circle round the line from Sun through head to shadow), red_on_top (higher drops send red, lower send violet), high_sun (midday Sun, bow below the ground). rainbow_scene and the deeper moments replace the setup, so they are refused while a question is unanswered.',
      inputSchema: object({ moment: { enum: MOMENTS } }),
    },
    {
      name: 'start_activity',
      description:
        'Start something for the child to do; speaks its authored instruction. Unscored investigations, usable unprompted: sun_and_rain (tap the clouds; rainbow needs sunlight AND drops), turn_to_find (turn Mia; she must face away from the Sun), walk_around (walk Mia round the shower while she faces it; she must stand with the Sun behind her), aim_sunbeam (drop close-up; slide the beam and see the colours always leave on the Sun’s side), sun_height (deeper; lift the Sun and watch the bow sink). Transfer: predict (a fresh arrangement with Mia’s window covered and no arrows; Yes/No; repeat for more practice at the same demand) and make_rainbow (harder: a fountain, Sun on the other side, everything free; the child builds the rainbow). A rainbow found in an investigation is reported as rainbow_found. Unanswered questions must be answered or left first.',
      inputSchema: object({ activity: { enum: ACTIVITIES } }),
    },
    {
      name: 'start_check',
      description:
        'Ask one small two-choice question about a single relationship; the runtime speaks the exact on-screen question, then wait. see_rainbow needs a situation and shows it with sunlight arrows kept and Mia’s window covered: sun_behind (yes), far_side, side_on, facing_sun, cloud_over_sun, water_off, high_sun (all no; high_sun only after that moment). sun_where: where should the Sun be (behind / in front). drop_exit: in the close-up, where the light comes out after the bounce. drop_colours: whether colours were in the sunlight or made by the drop. reach_rainbow: can Mia walk to the rainbow (deeper). Do not add a question of your own on top.',
      inputSchema: {
        type: 'object',
        properties: { question: { enum: CHECKS }, situation: { enum: SITUATIONS } },
        required: ['question'],
        additionalProperties: false,
      },
    },
    {
      name: 'answer_check',
      description:
        'Resolve a clear SPOKEN answer to the pending two-choice question. Pass its sceneId, the index of the choice the child meant (0 = first choice shown, 1 = second) and the child’s actual words. The model scores it exactly as a button press and records that it came by voice. Never use it for an unclear reply, a guess at what the child meant, or an answer you supplied.',
      inputSchema: object({ sceneId: text, choice: { type: 'integer', minimum: 0, maximum: 1 }, words: { type: 'string', minLength: 1, maxLength: 650 } }),
    },
    {
      name: 'leave_activity',
      description: 'Leave unfinished work when the child wants something else. Earlier attempts are kept and no answer is invented.',
      inputSchema: object({}),
    },
    {
      name: 'resume_activity',
      description:
        'Give control back to the child after help on their current activity (returning from the drop close-up to the meadow exactly as it was), or reopen an answered question for another try. A retry after help or after the answer was shown is recorded as assisted.',
      inputSchema: object({}),
    },
  ],
  events: {
    scene_changed: object({ task, sceneId: text }),
    support_changed: object({ kind: text, enabled: bool }),
    conditions_changed: object({ sunShining: bool, raining: bool, sunHeight: text }),
    explorer_moved: object({ spot: num, heading: num }),
    beam_moved: object({ beam: num }),
    rainbow_found: find,
    response_committed: attempt,
    response_reopened: object({ sceneId: text }),
  },
};

const PREDICT_SUNS = [0, 210 * DEG, 330 * DEG, 180 * DEG];
/** Fresh, unambiguous arrangements for prediction: half of them show a rainbow. */
export function predictionCases() {
  const out = [];
  for (const source of ['rain', 'fountain'])
    for (const sunAz of PREDICT_SUNS) {
      if (source === 'rain' && sunAz === PREDICT_SUNS[3]) continue; // the familiar teaching setup
      for (const situation of SITUATIONS.filter((x) => x !== 'high_sun')) {
        const s = arrange(situation, sunAz, source),
          f = rainbow(s);
        if (f.seen ? f.share >= 0.5 : f.share === 0 && (f.status !== 'drops_elsewhere' || f.litShare === 0))
          out.push({ key: `${source}:${Math.round(sunAz / DEG)}:${situation}`, situation, ...s, seen: f.seen });
      }
    }
  return out;
}
function arrange(situation, sunAz, source) {
  const good = sunBehindSpot(sunAz);
  const spot = situation === 'far_side' ? wrap(good + Math.PI) : situation === 'side_on' ? wrap(good - Math.PI / 2) : good;
  return {
    sunAz,
    source,
    sunHeight: situation === 'high_sun' ? 'high' : 'low',
    sunShining: situation !== 'cloud_over_sun',
    raining: situation !== 'water_off',
    spot,
    heading: situation === 'facing_sun' ? wrap(sunAz) : facingWater(spot),
  };
}

export function createRainbow({ sessionId = crypto.randomUUID(), random = Math.random } = {}) {
  let revision = 0,
    sequence = 0;
  const listeners = new Set(),
    commands = new Map(),
    usedCases = new Set();
  const WEST = Math.PI;
  let state = {
    view: 'outdoor',
    task: 'demonstration',
    mode: 'demonstration',
    moment: 'rainbow_scene',
    demonstratedMoments: ['rainbow_scene'],
    sceneId: sessionId + ':0',
    ...arrange('sun_behind', WEST, 'rain'),
    autoFace: false,
    rays: 'none',
    cone: false,
    colourDrops: false,
    windowCovered: false,
    beam: 0.86,
    dropStage: 'full',
    check: '',
    situation: '',
    revealed: false,
    assisted: true,
    found: false,
    attempts: [],
    finds: [],
    instruction: MOMENT_INSTRUCTION.rainbow_scene,
  };
  const pending = () => ['predict', 'check'].includes(state.task) && !state.revealed;
  function derived() {
    const f = facts(state),
      active = state.mode === 'activity',
      out = state.view === 'outdoor';
    return {
      rainbowStatus: f.status,
      rainbowAmount: f.amount,
      canToggleSun: active && out && ['conditions', 'build'].includes(state.task),
      canToggleWater: active && out && ['conditions', 'build'].includes(state.task),
      canTurn: active && out && ['turn', 'build'].includes(state.task),
      canWalk: active && out && ['walk', 'build'].includes(state.task),
      canMoveSun: active && out && state.task === 'sun_height',
      canAim: active && state.view === 'drop' && state.task === 'aim_beam',
      canAnswer: active && pending() && state.attempts.length < 100,
      canHint: active && out && (state.task === 'build' || pending()) && state.rays !== 'full',
    };
  }
  const snapshot = () =>
    assertSnapshot(descriptor, {
      protocolVersion: 1,
      sessionId,
      releaseId: descriptor.releaseId,
      revision,
      state: structuredClone({ ...state, ...derived() }),
      availableActions: descriptor.actions
        .filter((a) => {
          if (a.name === 'answer_check') return derived().canAnswer;
          if (a.name === 'leave_activity') return state.task !== 'demonstration';
          if (a.name === 'resume_activity') return state.task !== 'demonstration' && (state.mode === 'demonstration' || state.revealed);
          if (['start_activity', 'start_check'].includes(a.name)) return !pending();
          return true;
        })
        .map((a) => a.name),
    });
  function emit(source, ...events) {
    revision++;
    const update = {
      snapshot: snapshot(),
      events: events.map(([name, data], i) => ({
        id: `${sessionId}:${revision}:${i}`,
        revision,
        source,
        name,
        data: structuredClone(data),
      })),
    };
    for (const fn of listeners) fn(structuredClone(update));
    return update;
  }
  function setup(taskName, patch, instruction) {
    state = {
      ...state,
      view: 'outdoor',
      task: taskName,
      mode: taskName === 'demonstration' ? 'demonstration' : 'activity',
      moment: '',
      sceneId: sessionId + ':' + ++sequence,
      autoFace: false,
      rays: 'none',
      cone: false,
      colourDrops: false,
      windowCovered: false,
      dropStage: 'full',
      check: '',
      situation: '',
      revealed: false,
      assisted: !['predict', 'check', 'build'].includes(taskName),
      found: false,
      instruction,
      ...patch,
    };
  }
  // After the child changes something: replace the instruction with what happened,
  // and report the first rainbow of this scene.
  function afterChange(event) {
    const f = facts(state);
    const events = [event];
    if (FIND_TASKS.includes(state.task) || state.task === 'sun_height') state.instruction = STATUS_FACT[f.status](state);
    if (FIND_TASKS.includes(state.task) && f.seen && !state.found) {
      state.found = true;
      const entry = {
        id: `${sessionId}:find:${revision + 1}`,
        sceneId: state.sceneId,
        task: state.task,
        source: state.source,
        assisted: state.assisted,
        amount: f.amount,
      };
      state.finds.push(entry);
      events.push(['rainbow_found', entry]);
    }
    return emit('learner', ...events);
  }
  function commit(choice, modality = 'button', words = '') {
    if (!derived().canAnswer || ![0, 1].includes(choice)) return false;
    const q = questionFor(state);
    const entry = {
      id: `${sessionId}:attempt:${revision + 1}`,
      sceneId: state.sceneId,
      task: state.task,
      check: q.check,
      situation: state.situation,
      question: q.question,
      answer: q.choices[choice],
      correct: choice === correctChoice(state),
      assisted: state.assisted,
      modality,
      words,
    };
    state.attempts.push(entry);
    state.revealed = true;
    state.windowCovered = false;
    state.dropStage = 'full';
    if (isSeeQuestion(state)) state.rays = 'full';
    if (state.check === 'sun_where') Object.assign(state, arrange('sun_behind', state.sunAz, state.source), { rays: 'full' });
    state.instruction = factFor(state);
    return emit(modality === 'voice' ? 'agent' : 'learner', ['response_committed', entry]);
  }
  function reopen() {
    if (state.revealed) {
      state.revealed = false;
      state.assisted = true;
      if (isSeeQuestion(state)) {
        state.windowCovered = true;
        state.rays = state.task === 'predict' ? 'none' : 'sunlight';
      }
      if (state.check === 'sun_where') Object.assign(state, arrange('side_on', state.sunAz, state.source), { windowCovered: true, rays: 'sunlight' });
      if (state.check === 'drop_exit') state.dropStage = 'to_bounce';
    }
    state.mode = 'activity';
    state.moment = '';
    state.view = homeView(state);
    state.instruction = questionFor(state)?.question ?? ACTIVITY_INSTRUCTION[TASK_ACTIVITY[state.task]];
  }
  return {
    describe: () => structuredClone(descriptor),
    snapshot,
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    learnerToggleSun() {
      if (!derived().canToggleSun) return false;
      state.sunShining = !state.sunShining;
      return afterChange(['conditions_changed', { sunShining: state.sunShining, raining: state.raining, sunHeight: state.sunHeight }]);
    },
    learnerToggleWater() {
      if (!derived().canToggleWater) return false;
      state.raining = !state.raining;
      return afterChange(['conditions_changed', { sunShining: state.sunShining, raining: state.raining, sunHeight: state.sunHeight }]);
    },
    learnerSunHeight() {
      if (!derived().canMoveSun) return false;
      state.sunHeight = { low: 'mid', mid: 'high', high: 'low' }[state.sunHeight];
      return afterChange(['conditions_changed', { sunShining: state.sunShining, raining: state.raining, sunHeight: state.sunHeight }]);
    },
    /** Set the direction Mia faces (an azimuth). */
    learnerTurn(heading) {
      if (!derived().canTurn || !Number.isFinite(heading)) return false;
      state.heading = wrap(heading);
      return afterChange(['explorer_moved', { spot: state.spot, heading: state.heading }]);
    },
    /** Move Mia round the water to a new spot (an azimuth seen from the water). */
    learnerWalk(spot) {
      if (!derived().canWalk || !Number.isFinite(spot)) return false;
      const turn = wrap(spot) - state.spot;
      state.spot = wrap(spot);
      // In the supported walk she keeps looking at the water. In free building
      // her gaze keeps its direction relative to the water, as when walking round it.
      state.heading = state.autoFace ? facingWater(state.spot) : wrap(state.heading + turn);
      return afterChange(['explorer_moved', { spot: state.spot, heading: state.heading }]);
    },
    learnerBeam(beam) {
      if (!derived().canAim || !Number.isFinite(beam)) return false;
      state.beam = Math.max(0.05, Math.min(0.97, beam));
      return emit('learner', ['beam_moved', { beam: state.beam }]);
    },
    learnerAnswer(choice) {
      return commit(choice);
    },
    learnerHint() {
      if (!derived().canHint) return false;
      state.rays = 'full';
      state.assisted = true;
      // A waiting question stays on screen; only free building swaps in a hint line.
      if (!pending()) state.instruction = 'Follow the yellow arrows. Which side do the colours come back to?';
      return emit('learner', ['support_changed', { kind: 'sunlight_path', enabled: true }]);
    },
    learnerResume() {
      if (state.task === 'demonstration' || !(state.mode === 'demonstration' || state.revealed)) return false;
      reopen();
      return emit('learner', ['response_reopened', { sceneId: state.sceneId }]);
    },
    execute(command) {
      validate(commandSchema, command);
      if (commands.has(command.commandId)) return structuredClone(commands.get(command.commandId));
      const reject = (code, message) => ({
        commandId: command.commandId,
        accepted: false,
        error: { code, message },
        snapshot: snapshot(),
      });
      if (command.sessionId !== sessionId || command.releaseId !== descriptor.releaseId || command.expectedRevision !== revision)
        return reject('stale', 'Read the current scene before acting.');
      const action = descriptor.actions.find((a) => a.name === command.name);
      if (!action || !snapshot().availableActions.includes(command.name)) return reject('unavailable', 'Action unavailable in this state.');
      validate(action.inputSchema, command.args);
      const a = command.args;
      const done = (update, extra = {}) => {
        const result = { commandId: command.commandId, accepted: true, snapshot: update.snapshot ?? snapshot(), ...extra };
        commands.set(command.commandId, result);
        return structuredClone(result);
      };
      if (command.name === 'answer_check') {
        if (a.sceneId !== state.sceneId) return reject('stale_question', 'That answer belongs to a different question.');
        commit(a.choice, 'voice', a.words);
        return done({});
      }
      let event = ['scene_changed', null],
        speech,
        continueAfterSpeech = false;
      if (command.name === 'show_moment') {
        const m = a.moment;
        if (m === 'sunlight_path') {
          if (homeView(state) === 'drop' && state.task !== 'demonstration')
            return reject('wrong_view', 'The current work is in the drop close-up; use inside_drop or colours_spread to help there.');
          state.view = 'outdoor';
          state.rays = 'full';
          if (state.task !== 'demonstration') {
            state.mode = 'demonstration';
            if (!state.revealed) state.assisted = true;
          }
          speech = sunlightPathSpeech(state);
        } else if (['inside_drop', 'colours_spread'].includes(m)) {
          // A close-up keeps the outdoor arrangement and any current work exactly as they are.
          state.view = 'drop';
          state.dropStage = 'full';
          if (state.task !== 'demonstration') {
            state.mode = 'demonstration';
            if (!state.revealed) state.assisted = true;
          }
          speech = MOMENT_SPEECH[m];
        } else {
          if (pending()) return reject('unfinished_question', 'A question is waiting. Help with sunlight_path or the drop close-up, or leave it first.');
          const sunAz = WEST;
          setup('demonstration', arrange(m === 'high_sun' ? 'high_sun' : 'sun_behind', sunAz, 'rain'), MOMENT_INSTRUCTION[m]);
          if (m === 'why_a_bow' || m === 'high_sun') state.cone = true;
          if (m === 'red_on_top') state.colourDrops = true;
          speech = MOMENT_SPEECH[m];
        }
        state.moment = m;
        state.instruction = MOMENT_INSTRUCTION[m];
        if (!state.demonstratedMoments.includes(m)) state.demonstratedMoments.push(m);
        continueAfterSpeech = true;
      } else if (command.name === 'start_check') {
        if (a.question === 'see_rainbow') {
          if (!a.situation) return reject('missing_situation', 'see_rainbow needs a situation.');
          setup('check', { ...arrange(a.situation, WEST, 'rain'), check: 'see_rainbow', situation: a.situation, rays: 'sunlight', windowCovered: true }, '');
        } else if (a.question === 'sun_where')
          setup('check', { ...arrange('side_on', WEST, 'rain'), check: 'sun_where', rays: 'sunlight', windowCovered: true }, '');
        else if (a.question === 'reach_rainbow') setup('check', { ...arrange('sun_behind', WEST, 'rain'), check: 'reach_rainbow' }, '');
        else setup('check', { view: 'drop', check: a.question, beam: 0.86, dropStage: a.question === 'drop_exit' ? 'to_bounce' : 'full' }, '');
        speech = questionFor(state).speech;
      } else if (command.name === 'start_activity') {
        const t = ACTIVITY_TASK[a.activity];
        if (t === 'predict') {
          const all = predictionCases().filter((c) => !usedCases.has(c.key));
          if (!all.length) return reject('exhausted', 'No fresh arrangement is left; use make_rainbow or an investigation.');
          const wantYes = random() < 0.5,
            pool = all.filter((c) => c.seen === wantYes),
            from = pool.length ? pool : all,
            c = from[Math.min(from.length - 1, Math.floor(random() * from.length))];
          usedCases.add(c.key);
          const { key, seen, situation, ...geometry } = c;
          setup('predict', { ...geometry, situation, windowCovered: true }, '');
          speech = questionFor(state).speech;
        } else {
          const good = arrange('sun_behind', WEST, 'rain');
          const patch = {
            conditions: { ...good, raining: false },
            turn: { ...arrange('facing_sun', WEST, 'rain'), rays: 'sunlight' },
            walk: { ...arrange('far_side', WEST, 'rain'), autoFace: true, rays: 'sunlight' },
            build: { ...arrange('far_side', 0, 'fountain'), heading: wrap(Math.PI / 2), raining: false },
            sun_height: { ...good, cone: true },
            aim_beam: { view: 'drop', beam: 0.5 },
          }[t];
          setup(t, patch, ACTIVITY_INSTRUCTION[a.activity]);
          speech = ACTIVITY_SPEECH[a.activity];
        }
      } else if (command.name === 'leave_activity') {
        state.task = 'demonstration';
        state.mode = 'demonstration';
        state.moment = '';
        state.check = '';
        state.situation = '';
        state.windowCovered = false;
        state.dropStage = 'full';
        state.revealed = false;
        state.instruction = state.view === 'drop' ? 'Look at the light in the drop.' : 'Look at the Sun, the water and Mia.';
      } else {
        reopen();
        event = ['response_reopened', { sceneId: state.sceneId }];
        speech = questionFor(state)?.speech ?? ACTIVITY_SPEECH[TASK_ACTIVITY[state.task]];
      }
      const question = questionFor(state);
      if (question?.status === 'awaiting_answer') state.instruction = question.question;
      event[1] ??= { task: state.task, sceneId: state.sceneId };
      const update = emit('agent', event);
      return done(update, { ...(speech ? { speech } : {}), ...(continueAfterSpeech ? { continueAfterSpeech } : {}) });
    },
  };
}
export { WATER };
