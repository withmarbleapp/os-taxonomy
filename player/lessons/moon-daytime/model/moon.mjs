// The Moon's daytime visit, as moments on one representation: the Sun, Earth
// and Moon seen from space, linked to the sky an explorer on Earth would see.
//
// This file holds only what is particular to the lesson: the geometry, what is
// true of it, and the words. Questions, help, retries and evidence are the
// shared engine's (/sdk/moments.mjs).
import { defineLesson } from '/sdk/moments.mjs';
import { facts, makeTasks, scorePath } from './geometry.mjs';

const bool = { type: 'boolean' },
  num = { type: 'number' };
const PHI = 1.55;
const at = (theta, phi = PHI) => ({ theta, phi, originTheta: theta });
// Every arrangement the child has been shown is remembered, so a fresh
// prediction is never a near copy of an example.
const used = (ctx) => (ctx.memory.used ??= [{ theta: 2.35, phi: PHI }]);
const staged = (ctx, theta, phi = PHI) => {
  used(ctx).push({ theta, phi });
  return at(theta, phi);
};
// Any moment that draws the light's route makes a later "build the route" helped.
const withLight = (ctx, patch) => {
  ctx.memory.lightShown = true;
  return { ...patch, rays: true };
};
const fresh = (ctx) => {
  let tasks;
  try {
    tasks = makeTasks(ctx.random, used(ctx));
  } catch {
    return null;
  }
  return staged(ctx, tasks[0].theta, tasks[0].phi);
};
const horizonHint = () => ({ patch: { view: 'space', horizon: true } });

export const lesson = defineLesson({
  kind: 'moon-daytime',
  releaseId: 'moon-daytime-v8',
  description:
    'Illustrative Sun–Earth–Moon geometry with a linked observer sky. day means Sun above the local horizon; moonAboveHorizon means Moon above it. Distances and body sizes are not to scale. This is not a real-date sky forecast: clouds, glare/contrast, eclipses, refraction and orbit tilt are omitted. Fresh predictions use daylight quarter-like arrangements well away from the horizon and Sun. Above horizon is NOT a guarantee of real-world visibility. Turning Earth changes the observer; looking around only changes the camera. Ground view hides bodies below the horizon. Rays explain reflected sunlight, not eyes emitting light. No completion threshold.',
  opening: 'daytime_moon',
  idle: 'Look at the current arrangement.',

  state: {
    schema: {
      theta: num,
      phi: num,
      originTheta: num,
      view: { enum: ['space', 'sky'] },
      horizon: bool,
      rays: bool,
    },
    initial: { ...at(2.35), view: 'sky', horizon: false, rays: false },
    clear: { view: 'space', horizon: false, rays: false },
  },
  facts: {
    schema: { day: bool, moonAboveHorizon: bool, sunAltitude: num, moonAltitude: num },
    of(s) {
      const f = facts(s.theta, s.phi);
      return { day: f.day, moonAboveHorizon: f.visible, sunAltitude: f.sunAltitude, moonAltitude: f.moonAltitude };
    },
  },
  describe(s, f) {
    return {
      view:
        s.view === 'space'
          ? {
              name: 'space diagram',
              visibleObjects: ['Sun (bright yellow)', 'Earth', 'Moon', 'explorer on Earth'],
              note: 'All bodies appear in the diagram even when below the explorer’s horizon.',
            }
          : {
              name: 'explorer sky',
              aboveHorizon: [...(f.day ? ['Sun'] : []), ...(f.moonAboveHorizon ? ['Moon'] : [])],
              note: 'Look around or use Find Sun / Find Moon; above horizon does not mean currently in camera frame.',
            },
      explorer: {
        time: f.day ? 'daytime' : 'nighttime',
        moon: f.moonAboveHorizon ? 'above horizon; reflected light can reach explorer' : 'below horizon; Earth blocks reflected light',
      },
      supports: { lightRoute: s.rays, horizon: s.horizon },
    };
  },

  gestures: {
    // Turning Earth carries the explorer round; it is only possible from space.
    turn: {
      event: 'geometry_changed',
      when: (s) => s.view === 'space',
      apply(s, delta) {
        if (!Number.isFinite(delta)) return false;
        s.theta = (s.theta + Math.max(-0.4, Math.min(0.4, delta)) + Math.PI * 2) % (Math.PI * 2);
        return { theta: s.theta, phi: s.phi };
      },
    },
  },
  controls: {
    set_view: {
      description:
        'Navigate the CURRENT arrangement between space and the explorer sky, without resetting work. Use when the child asks to look through the explorer’s eyes or return to space; do it rather than asking permission again. For teaching a new idea prefer show_moment. Showing the sky before a prediction is answered counts as help.',
      args: { view: { enum: ['space', 'sky'] } },
      event: 'view_changed',
      apply(s, { view }, { help }) {
        if (!['space', 'sky'].includes(view) || s.view === view) return false;
        s.view = view;
        if (s.kind === 'do' && s.mode === 'activity')
          s.instruction = view === 'sky' ? 'Look around the sky. Where is the Moon?' : 'Turn Earth, then look through the explorer’s eyes.';
        // The sky gives a prediction away.
        if (view === 'sky' && s.kind === 'ask' && s.item === 'moon_visible') help();
        return { view };
      },
    },
  },
  events: {
    view_changed: { type: 'object', properties: { view: { enum: ['space', 'sky'] } }, required: ['view'], additionalProperties: false },
    geometry_changed: { type: 'object', properties: { theta: num, phi: num }, required: ['theta', 'phi'], additionalProperties: false },
  },

  // Arrangements a question can be asked about. They keep the light route and
  // the horizon on screen, so an answer here is supported, not independent.
  situations: {
    night: { supported: true, arrange: (ctx) => withLight(ctx, { ...staged(ctx, 0.65), horizon: true }) },
    day: { supported: true, arrange: (ctx) => withLight(ctx, { ...staged(ctx, 2.35), horizon: true }) },
    below: { supported: true, arrange: (ctx) => withLight(ctx, { ...staged(ctx, 3.95), horizon: true }) },
  },

  show: {
    night_light: {
      when: 'introduces reflected light, at night.',
      speech: 'Here it is night for the explorer. Watch sunlight reach the Moon, then reflect towards the explorer’s eyes.',
      instruction: 'Follow the light to the Moon and towards the explorer.',
      arrange: (ctx) => withLight(ctx, { ...staged(ctx, 0.65), horizon: true }),
    },
    daytime_light: {
      when: 'the same route by day.',
      speech: 'Now the explorer is in daylight. The Moon still reflects sunlight towards their eyes.',
      instruction: 'Follow the light to the Moon and towards the explorer.',
      arrange: (ctx) => withLight(ctx, { ...staged(ctx, 2.35), horizon: true }),
    },
    blocked_light: {
      when: 'Earth blocking the view.',
      speech: 'Sunlight still reaches the Moon. Here Earth blocks the reflected light from reaching the explorer.',
      instruction: 'Follow the light to the Moon and towards the explorer.',
      arrange: (ctx) => withLight(ctx, { ...staged(ctx, 3.95), horizon: true }),
    },
    daytime_moon: {
      when: 'the explorer’s sky with both Sun and Moon in it.',
      speech: 'Look through the explorer’s eyes: both the Sun and Moon are in this daytime sky.',
      instruction: 'Look for the Moon in our daytime sky.',
      arrange: (ctx) => ({ ...staged(ctx, 2.35), view: 'sky' }),
    },
    daytime_without_moon: {
      when: 'a daytime sky with the Moon below the horizon.',
      speech: 'This explorer is in daylight, but the Moon is below their horizon.',
      instruction: 'It is still daytime. Where has the Moon gone?',
      arrange: (ctx) => ({ ...staged(ctx, 3.95), view: 'sky' }),
    },
    light_journey: {
      when: 'help on CURRENT work: draws the light’s route on the arrangement in hand.',
      speech: 'Follow sunlight from the Sun to the Moon. Reflected light reaches the explorer only when Earth does not block the view.',
      instruction: 'Watch the sunlight travel.',
      support: (s, f, ctx) => withLight(ctx, { view: 'space' }),
    },
    horizon: {
      when: 'help on CURRENT work: displays the rose-colored line labeled Horizon; use that visible name for it in either view.',
      speech:
        'Look at the rose-colored line labeled Horizon. It marks the explorer’s ground level, separating their sky from the region hidden by Earth.',
      instruction: 'Find the rose-colored line labeled Horizon.',
      support: () => ({ view: 'space', horizon: true }),
    },
  },

  do: {
    turn_earth: {
      when: 'find a position where reflected moonlight reaches the explorer (night or day), then inspect their sky; use after reflection is familiar. Exploration, not evidence.',
      speech:
        'Turn Earth until reflected moonlight can reach the explorer. Then choose See the sky to check your result. Nighttime or daytime both count.',
      instruction: 'Turn Earth until moonlight can reach the explorer, then check the sky.',
      arrange: (ctx) => withLight(ctx, { ...staged(ctx, 3.95), horizon: true }),
      can: ['turn'],
      goal: (f) => f.moonAboveHorizon,
      target: 'Reflected moonlight reaches the explorer. Night or day counts.',
      detail: (f) => (f.day ? 'by day' : 'by night'),
      canDo: ['Drag Earth (or arrow keys) to turn it', 'Choose See the sky to look through the explorer’s eyes'],
    },
  },

  ask: {
    day_night: {
      when: 'a supported check of day and night, with the light route and horizon kept on screen.',
      question: 'Is it day or night where the explorer is?',
      choices: ['Day', 'Night'],
      situations: ['night', 'day', 'below'],
      correct: (f) => (f.day ? 0 : 1),
      hint: horizonHint,
      hide: () => ({ view: 'space' }),
      reveal: () => ({ view: 'sky' }),
      fact: (f) => (f.day ? 'The Sun is above the explorer’s horizon: daytime.' : 'The Sun is below the explorer’s horizon: nighttime.'),
    },
    moon_visible: {
      when: 'whether the Moon is above the explorer’s horizon. With a named situation it is a supported check; with fresh it is a new arrangement with no light route drawn, for transfer once the idea is secure.',
      question: 'Is the Moon above the explorer’s horizon?',
      choices: ['Yes', 'No'],
      situations: ['night', 'day', 'below'],
      fresh,
      correct: (f) => (f.moonAboveHorizon ? 0 : 1),
      hint: horizonHint,
      hide: () => ({ view: 'space' }),
      reveal: () => ({ view: 'sky' }),
      fact: (f) => (f.moonAboveHorizon ? 'The Moon is above the explorer’s horizon.' : 'The Moon is below the horizon, behind Earth.'),
    },
    light_path: {
      when: 'the child builds the light’s route by tapping. Independent only if the route has not been drawn for them earlier in the session.',
      question: 'Tap the Sun, the Moon and the explorer in the order light travels to our eyes, then check your journey.',
      order: [
        { id: 'sun', label: 'Sun' },
        { id: 'moon', label: 'Moon' },
        { id: 'observer', label: 'Explorer' },
      ],
      supported: (ctx) => !!ctx.memory.lightShown,
      arrange: (ctx) => staged(ctx, 2.65, 2.02),
      correct: (draft) => scorePath(draft),
      hint: (s, f, ctx) => ({ patch: withLight(ctx, { view: 'space' }) }),
      hide: () => ({ view: 'space', rays: false }),
      reveal: (s, f, ctx) => withLight(ctx, {}),
      fact: 'Sunlight travels from the Sun to the Moon, then to our eyes.',
    },
  },
});

export const { descriptor, tutorView, questionFor } = lesson;
export const createMoon = lesson.create;
