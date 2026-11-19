// How does a rainbow form?, as moments on one representation: a meadow with
// the Sun, water drops and an explorer called Mia, and a close-up of one drop.
//
// This file holds only what is particular to the lesson: the arrangements,
// what the optics say is true of them, the child's gestures and the words.
// Questions, help, retries and evidence are the shared engine's
// (/sdk/moments.mjs).
import { defineLesson } from '/sdk/moments.mjs';
import { DEG, COLOURS, WATER, dropRay, rainbow, wrap, angleBetween, sunBehindSpot, facingWater } from './optics.mjs';

const bool = { type: 'boolean' },
  num = { type: 'number' },
  text = { type: 'string' };
const STATUS = ['no_sunlight', 'no_drops', 'sun_too_high', 'drops_elsewhere', 'looking_away', 'rainbow'];
const SITUATIONS = ['sun_behind', 'far_side', 'side_on', 'facing_sun', 'cloud_over_sun', 'water_off', 'high_sun'];
const WEST = Math.PI;

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
// After the child changes something, the line on screen says what happened.
const whatHappened = (f, s) => STATUS_FACT[rainbow(s).status](s);
const seen = (f, s) => rainbow(s).seen;

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
function freshCase(ctx) {
  const used = (ctx.memory.usedCases ??= new Set());
  const all = predictionCases().filter((c) => !used.has(c.key));
  if (!all.length) return null;
  const wantYes = ctx.random() < 0.5,
    pool = all.filter((c) => c.seen === wantYes),
    from = pool.length ? pool : all,
    c = from[Math.min(from.length - 1, Math.floor(ctx.random() * from.length))];
  used.add(c.key);
  const { key, seen: _seen, situation: _situation, ...geometry } = c;
  return geometry;
}

function sunlightPathSpeech(s) {
  return (
    'Follow the yellow arrows of sunlight. ' +
    {
      rainbow: 'They fly past Mia and into the drops. The drops send coloured light back to Mia’s eyes. That light is her rainbow.',
      looking_away: 'They fly into the drops, and the drops send coloured light back towards Mia. But Mia is looking the other way.',
      drops_elsewhere: 'They reach the drops. Each drop sends its colours back towards the Sun’s side, and Mia is not standing there.',
      no_drops: 'They fly past Mia, but there are no drops in the air to send the light back.',
      no_sunlight: 'They stop at the cloud. No sunlight reaches the drops.',
      sun_too_high: 'They come down very steeply. So the colours come back out steeply too, and hit the ground before they reach Mia.',
    }[rainbow(s).status]
  );
}
// Work that lives in the close-up of the drop, not in the meadow.
const DROP_WORK = ['aim_sunbeam', 'drop_exit', 'drop_colours'];
const conditions = (s) => ({ sunShining: s.sunShining, raining: s.raining, sunHeight: s.sunHeight });
const outdoors = (s) => s.view === 'outdoor';
// The child's own hint outdoors: the full path of the light.
const lightHint = () => ({ patch: { rays: 'full' }, instruction: 'Follow the yellow arrows. Which side do the colours come back to?' });
const good = () => arrange('sun_behind', WEST, 'rain');

export const lesson = defineLesson({
  kind: 'how-rainbows-form',
  releaseId: 'how-rainbows-form-v2',
  description:
    'How a rainbow forms, for a child of about eight. Outdoor model: a low Sun, water drops (a rain shower or a fountain) and an explorer called Mia. A primary rainbow is every direction 42 degrees from the point opposite the Sun; Mia sees it only where sunlit drops lie in those directions and she is looking that way. rainbowStatus says why she does or does not see one. The rainbow is drawn only in Mia’s window, never in the meadow, because it is light reaching her eyes and not an object. Close-up model: one drop as a flat diagram; light bends in, bounces off the back and bends out on the Sun’s side, each colour by a slightly different amount. Sizes, distances and the width of the colour fan are illustrative. Not modelled: the second bow, brightness, drop size, fog bows.',
  opening: 'rainbow_scene',
  idle: (s) => (s.view === 'drop' ? 'Look at the light in the drop.' : 'Look at the Sun, the water and Mia.'),
  leave: () => ({ windowCovered: false, dropStage: 'full' }),

  state: {
    schema: {
      view: { enum: ['outdoor', 'drop'] },
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
    },
    initial: {
      view: 'outdoor',
      ...good(),
      autoFace: false,
      rays: 'none',
      cone: false,
      colourDrops: false,
      windowCovered: false,
      beam: 0.86,
      dropStage: 'full',
    },
    clear: { view: 'outdoor', autoFace: false, rays: 'none', cone: false, colourDrops: false, windowCovered: false, dropStage: 'full' },
  },
  facts: {
    schema: { rainbowStatus: { enum: STATUS }, rainbowAmount: text },
    of(s) {
      const f = rainbow(s);
      return { rainbowStatus: f.status, rainbowAmount: f.amount };
    },
  },
  describe(s) {
    const f = rainbow(s),
      covered = s.windowCovered,
      sunSide = angleBetween(s.heading, s.sunAz),
      onDrop = s.view === 'drop';
    const green = dropRay(s.beam, COLOURS[1].n);
    return {
      view: onDrop
        ? {
            name: 'close-up of one raindrop (flat diagram)',
            shows:
              s.dropStage === 'to_bounce'
                ? 'A white sunbeam from the Sun’s side enters the drop, bends and reaches the back. The rest of the path is hidden until the child answers.'
                : 'A white sunbeam from the Sun’s side enters the drop, bends, bounces off the back and leaves as a fan of rainbow colours, running from red at one edge through orange, yellow, green and blue to violet at the other, on the Sun’s side. A faint dotted line shows the light that passes straight through.',
            note: 'The colour fan outside the drop is drawn wider than in nature so it can be seen.',
          }
        : {
            name: 'meadow seen from outside, with a small window showing what Mia sees',
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
    };
  },

  gestures: {
    toggle_sun: {
      event: 'conditions_changed',
      when: outdoors,
      apply(s) {
        s.sunShining = !s.sunShining;
        return conditions(s);
      },
    },
    toggle_water: {
      event: 'conditions_changed',
      when: outdoors,
      apply(s) {
        s.raining = !s.raining;
        return conditions(s);
      },
    },
    move_sun: {
      event: 'conditions_changed',
      when: outdoors,
      apply(s) {
        s.sunHeight = { low: 'mid', mid: 'high', high: 'low' }[s.sunHeight];
        return conditions(s);
      },
    },
    // Set the direction Mia faces (an azimuth).
    turn: {
      event: 'explorer_moved',
      when: outdoors,
      apply(s, heading) {
        if (!Number.isFinite(heading)) return false;
        s.heading = wrap(heading);
        return { spot: s.spot, heading: s.heading };
      },
    },
    // Move Mia round the water to a new spot (an azimuth seen from the water).
    walk: {
      event: 'explorer_moved',
      when: outdoors,
      apply(s, spot) {
        if (!Number.isFinite(spot)) return false;
        const turn = wrap(spot) - s.spot;
        s.spot = wrap(spot);
        // In the supported walk she keeps looking at the water. In free building
        // her gaze keeps its direction relative to the water, as when walking round it.
        s.heading = s.autoFace ? facingWater(s.spot) : wrap(s.heading + turn);
        return { spot: s.spot, heading: s.heading };
      },
    },
    aim: {
      event: 'beam_moved',
      when: (s) => s.view === 'drop',
      apply(s, beam) {
        if (!Number.isFinite(beam)) return false;
        s.beam = Math.max(0.05, Math.min(0.97, beam));
        return { beam: s.beam };
      },
    },
  },
  events: {
    conditions_changed: { type: 'object', properties: { sunShining: bool, raining: bool, sunHeight: text }, required: ['sunShining', 'raining', 'sunHeight'], additionalProperties: false },
    explorer_moved: { type: 'object', properties: { spot: num, heading: num }, required: ['spot', 'heading'], additionalProperties: false },
    beam_moved: { type: 'object', properties: { beam: num }, required: ['beam'], additionalProperties: false },
  },

  // Arrangements "Can Mia see a rainbow from here?" can be asked about. The
  // sunlight arrows stay on screen; Mia's window is covered by the question.
  situations: Object.fromEntries(
    SITUATIONS.map((name) => [name, { lead: SITUATION_LEAD[name], arrange: () => ({ ...arrange(name, WEST, 'rain'), rays: 'sunlight' }) }]),
  ),

  show: {
    rainbow_scene: {
      when: 'the opening meadow, Sun behind Mia, rain ahead, rainbow in her window.',
      speech: 'This is Mia. The Sun is low behind her, and rain is falling in front of her. The little window shows what Mia sees: a rainbow.',
      instruction: 'Mia sees a rainbow. Look in her window.',
      arrange: good,
    },
    sunlight_path: {
      when: 'HELP on the CURRENT outdoor setup; draws sunlight arrows and any coloured light coming back to Mia, and says why she does or does not see a rainbow.',
      speech: sunlightPathSpeech,
      instruction: 'Follow the sunlight.',
      available: (s) =>
        s.kind !== 'show' && DROP_WORK.includes(s.item) ? 'The current work is in the drop close-up; use inside_drop or colours_spread to help there.' : true,
      support: () => ({ view: 'outdoor', rays: 'full' }),
    },
    inside_drop: {
      when: 'close-up of one drop, light bends in, bounces off the back, bends out on the Sun’s side; use when the child wonders what the drops do. Pauses current work without losing it; resume_activity returns to it.',
      speech:
        'Let’s zoom in on one raindrop. A beam of sunlight goes in and bends. It bounces off the back of the drop. Then it bends again on the way out. So the light comes back out on the same side as the Sun.',
      instruction: 'Light bends in, bounces, and bends out.',
      aside: true,
      support: () => ({ view: 'drop', dropStage: 'full' }),
    },
    colours_spread: {
      when: 'the same close-up, white sunlight fans into colours that were already in it; use for "where do the colours come from" or "the water makes the colours". Pauses current work without losing it.',
      speech:
        'Sunlight looks white, but it is many colours mixed together. When light bends, each colour bends a little differently. Red bends the least and violet bends the most, so the colours fan out. The drop does not make the colours. It spreads out colours that were already in the sunlight.',
      instruction: 'Each colour bends a little differently.',
      aside: true,
      support: () => ({ view: 'drop', dropStage: 'full' }),
    },
    why_a_bow: {
      when: 'deeper, only once Sun-behind and the drop are familiar: the drops that send colour form a circle round the line from Sun through head to shadow.',
      speech:
        'Look at the dotted line from the Sun, through Mia’s head, to her shadow. Every drop that sends colour to Mia sits at the same angle from that line. Together those drops make a circle. The ground hides the bottom of the circle, so Mia sees a bow.',
      instruction: 'The drops that send colour make a circle.',
      arrange: () => ({ ...good(), cone: true }),
    },
    red_on_top: {
      when: 'deeper: higher drops send red, lower send violet.',
      speech:
        'Each drop sends only one colour to Mia’s eyes. The higher drop sends her red. The lower drop sends her violet. Millions of drops together paint the whole bow, with red on top.',
      instruction: 'Higher drops send red. Lower drops send violet.',
      arrange: () => ({ ...good(), colourDrops: true }),
    },
    high_sun: {
      when: 'deeper: midday Sun, bow below the ground.',
      speech:
        'Now the Sun is high, like at midday. The circle of colours has sunk below the ground. There are no raindrops down there, so Mia sees no rainbow. Rainbows show up when the Sun is low, in the morning or the evening.',
      instruction: 'High Sun: the bow sinks below the ground.',
      arrange: () => ({ ...arrange('high_sun', WEST, 'rain'), cone: true }),
    },
  },

  do: {
    sun_and_rain: {
      when: 'unscored investigation: tap the clouds; a rainbow needs sunlight AND drops.',
      speech:
        'Tap the rain cloud to start or stop the rain. Tap the Sun’s cloud to cover or uncover the Sun. Watch Mia’s window to see when the rainbow shows up.',
      instruction: 'Tap the clouds. When does Mia see a rainbow?',
      arrange: () => ({ ...good(), raining: false }),
      can: ['toggle_sun', 'toggle_water'],
      goal: seen,
      target: 'A rainbow shows in Mia’s window.',
      detail: (f) => f.rainbowAmount,
      status: whatHappened,
      canDo: ['Tap the rain cloud to start or stop the rain', 'Tap the Sun’s cloud to cover or uncover the Sun'],
    },
    turn_to_find: {
      when: 'unscored investigation: turn Mia; she must face away from the Sun.',
      speech:
        'Mia is looking at the Sun, and she cannot see a rainbow. Drag the arrow in front of Mia to turn her, until the rainbow shows in her window.',
      instruction: 'Turn Mia until she sees the rainbow.',
      arrange: () => ({ ...arrange('facing_sun', WEST, 'rain'), rays: 'sunlight' }),
      can: ['turn'],
      goal: seen,
      target: 'A rainbow shows in Mia’s window.',
      detail: (f) => f.rainbowAmount,
      status: whatHappened,
      canDo: ['Drag the Turn Mia arrow (or arrow keys) to change where she looks'],
    },
    walk_around: {
      when: 'unscored investigation: walk Mia round the shower while she faces it; she must stand with the Sun behind her.',
      speech: 'Now Mia always looks at the rain. Drag Mia around the shower. Find where she has to stand to see the rainbow.',
      instruction: 'Move Mia around the rain. Where does she see the rainbow?',
      arrange: () => ({ ...arrange('far_side', WEST, 'rain'), autoFace: true, rays: 'sunlight' }),
      can: ['walk'],
      goal: seen,
      target: 'A rainbow shows in Mia’s window.',
      detail: (f) => f.rainbowAmount,
      status: whatHappened,
      canDo: ['Drag Mia (or arrow keys) to walk her around the rain; she keeps looking at it'],
    },
    make_rainbow: {
      when: 'transfer, harder: a fountain, Sun on the other side, everything free; the child builds the rainbow. Reaching it unaided counts as evidence.',
      speech:
        'Here is a garden fountain, and the Sun is on the other side now. Make a rainbow for Mia. You can tap the fountain, move Mia and turn her.',
      instruction: 'Make a rainbow for Mia at the fountain.',
      arrange: () => ({ ...arrange('far_side', 0, 'fountain'), heading: wrap(Math.PI / 2), raining: false }),
      can: ['toggle_sun', 'toggle_water', 'turn', 'walk'],
      goal: seen,
      counts: true,
      target: 'A rainbow shows in Mia’s window.',
      detail: (f) => f.rainbowAmount,
      status: whatHappened,
      hint: lightHint,
      hintAvailable: (s) => s.rays !== 'full',
      canDo: ['Tap the fountain to switch it on or off', 'Tap the Sun’s cloud', 'Drag Mia to move her', 'Drag the Turn Mia arrow to turn her'],
    },
    aim_sunbeam: {
      when: 'unscored investigation in the drop close-up: slide the beam and see the colours always leave on the Sun’s side.',
      speech: 'Drag the sunbeam up and down the drop. Watch where the colours come out.',
      instruction: 'Move the sunbeam. Where do the colours come out?',
      arrange: () => ({ view: 'drop', beam: 0.5 }),
      can: ['aim'],
      canDo: ['Drag the sunbeam up and down (or arrow keys)'],
    },
    sun_height: {
      when: 'deeper, unscored: lift the Sun and watch the bow sink.',
      speech: 'Tap the Sun to lift it higher in the sky. Watch what happens to Mia’s rainbow.',
      instruction: 'Tap the Sun to lift it. What happens to the rainbow?',
      arrange: () => ({ ...good(), cone: true }),
      can: ['move_sun'],
      status: whatHappened,
      canDo: ['Tap the Sun to move it: low, middle, high'],
    },
  },

  ask: {
    see_rainbow: {
      when: 'needs a situation, shown with sunlight arrows kept and Mia’s window covered: sun_behind (yes), far_side, side_on, facing_sun, cloud_over_sun, water_off, high_sun (all no; high_sun only after that moment). With fresh it is transfer: a new arrangement with no arrows; repeat for more practice at the same demand.',
      question: 'Can Mia see a rainbow from here?',
      choices: ['Yes', 'No'],
      situations: SITUATIONS,
      fresh: freshCase,
      lead: (s) => (s.situation === 'fresh' ? 'This is a new place, and Mia’s window is covered.' : undefined),
      correct: (f, s) => (rainbow(s).seen ? 0 : 1),
      hint: lightHint,
      hintAvailable: (s) => s.rays !== 'full',
      hide: (s) => ({ windowCovered: true, rays: s.situation === 'fresh' ? 'none' : 'sunlight' }),
      reveal: () => ({ windowCovered: false, rays: 'full' }),
      fact: (f, s) => (rainbow(s).seen ? 'Yes. ' : 'No. ') + STATUS_FACT[rainbow(s).status](s),
    },
    sun_where: {
      when: 'where should the Sun be (behind / in front).',
      lead: 'Think about where Mia stood when she saw the rainbow.',
      question: 'To see a rainbow, where should the Sun be?',
      choices: ['Behind Mia', 'In front of Mia'],
      correct: 0,
      arrange: () => arrange('side_on', WEST, 'rain'),
      hint: lightHint,
      hintAvailable: (s) => s.rays !== 'full',
      // The answer is shown by moving Mia; another try puts her back to one side.
      hide: (s) => ({ ...arrange('side_on', s.sunAz, s.source), windowCovered: true, rays: 'sunlight' }),
      reveal: (s) => ({ ...arrange('sun_behind', s.sunAz, s.source), windowCovered: false, rays: 'full' }),
      fact: 'The Sun has to be behind Mia, with the drops in front of her.',
    },
    drop_exit: {
      when: 'in the close-up, where the light comes out after the bounce.',
      lead: 'The sunbeam has gone into the drop and reached the back.',
      question: 'After the bounce, where does the light come out?',
      choices: ['Out the far side', 'Back on the Sun’s side'],
      correct: 1,
      arrange: () => ({ view: 'drop', beam: 0.86 }),
      hide: () => ({ dropStage: 'to_bounce' }),
      reveal: () => ({ dropStage: 'full' }),
      fact: 'The light comes back out on the Sun’s side.',
    },
    drop_colours: {
      when: 'whether the colours were in the sunlight or made by the drop.',
      lead: 'Look at the colours leaving the drop.',
      question: 'Where do the rainbow’s colours come from?',
      choices: ['They were already in the sunlight', 'The raindrop makes them'],
      correct: 0,
      arrange: () => ({ view: 'drop', beam: 0.86 }),
      fact: 'The colours were already in the sunlight. The drop spreads them out.',
    },
    reach_rainbow: {
      when: 'deeper: can Mia walk to the rainbow.',
      lead: 'Mia would love to touch her rainbow.',
      question: 'If Mia walks towards the rainbow, can she reach it?',
      choices: ['Yes, if she walks far enough', 'No, it moves when she moves'],
      correct: 1,
      arrange: good,
      hint: lightHint,
      hintAvailable: (s) => s.rays !== 'full',
      fact: 'She can never reach it. The rainbow moves when Mia moves.',
    },
  },
});

export const { descriptor, tutorView, questionFor } = lesson;
export const createRainbow = lesson.create;
export { WATER };
