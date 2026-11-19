// Volume in layers, as moments on one representation: a block of equal unit
// cubes that the child can turn, open into layers, and build.
//
// This file holds only what is particular to the lesson: the block, what is
// true of it, and the words. Questions, help, retries and evidence are the
// shared engine's (/sdk/moments.mjs).
import { defineLesson } from '/sdk/moments.mjs';
import { chooseTask, shapeKey, practiceShapes, scorePlan } from './cube-tasks.mjs';

const bool = { type: 'boolean' },
  number = { type: 'number' },
  integer = { type: 'integer', minimum: 0, maximum: 999 };
const event = (properties) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });

// The numbers of a block. `dims` is [across, rows back, layers high].
function counts(s) {
  const [w, d, h] = s.dims,
    filling = s.building && s.filled.length < w * d;
  return {
    cubesPerLayer: w * d,
    layerCount: h,
    totalCubes: filling ? s.filled.length : w * d * h,
    layerComplete: !filling,
    interiorCount: Math.max(0, w - 2) * Math.max(0, d - 2) * Math.max(0, h - 2),
    hasInterior: w > 2 && d > 2 && h > 2,
  };
}
const block = (dims, more = {}) => ({ dims, ...more });
// A block the child has not seen, in any rotation. `stage` is 0 small, 1 large, 2 long.
const freshBlock = (stage) => (ctx) => {
  ctx.memory.used ??= [...practiceShapes];
  const dims = chooseTask(stage, ctx.memory.used, stage === 0 && !ctx.state.attempts.length, ctx.random);
  if (!dims) return null;
  ctx.memory.used.push(shapeKey(dims));
  return block(dims);
};

// Said before the plan question; the question itself stays short on screen.
const BOXES = 'Fill in the three boxes, then press Check my plan.';

// A highlight on the block in hand. It needs a whole block to point at, and it
// leaves the child in control: they can keep turning, opening and filling in.
const complete = (s, f) => (f.layerComplete ? true : 'Finish the layer first: this explanation needs a complete block.');
const highlight = (focus, extra = {}) => ({
  stay: true,
  available: complete,
  support: () => ({ focus, ...(focus === 'unit' ? {} : { layersOpen: true }) }),
  ...extra,
});

export const lesson = defineLesson({
  kind: 'cube-volume',
  releaseId: 'cube-volume-v4',
  description:
    'A filled rectangular solid made of equal unit cubes, with no gaps or overlaps. Dimensions are [width, depth, horizontal layers]; units are illustrative cubic units, not centimetres. The child can turn the block and open its whole horizontal layers at any time; neither changes how many cubes there are. interiorCount is how many cubes are enclosed on every side (none unless every dimension exceeds two): a fact for answering a child who leaves them out, not a topic to raise. Filling, stacking and adding back rows are real learner actions. The model scores a checked layer plan exactly; events alone do not establish understanding. No required stage count.',
  idle: 'Explore how layers help count cubes.',

  state: {
    schema: {
      dims: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'integer', minimum: 1, maximum: 8 } },
      building: bool,
      filled: { type: 'array', maxItems: 6, items: { type: 'string' } },
      rotation: number,
      layersOpen: bool,
      focus: { enum: ['none', 'unit', 'layers', 'inside'] },
    },
    initial: { dims: [3, 2, 2], building: false, filled: [], rotation: 0, layersOpen: false, focus: 'none' },
    clear: { building: false, filled: [], rotation: 0, layersOpen: false, focus: 'none' },
  },
  facts: {
    schema: { cubesPerLayer: integer, layerCount: integer, totalCubes: integer, layerComplete: bool, interiorCount: integer, hasInterior: bool },
    of: counts,
  },
  describe(s, f) {
    const [w, d, h] = s.dims,
      plan = s.kind === 'ask' ? Object.fromEntries(s.entries.map((e) => [e.field, Number(e.value)])) : null,
      expected = { perLayer: f.cubesPerLayer, layers: f.layerCount, total: f.totalCubes };
    return {
      block: s.building && !f.layerComplete ? `a ${w} by ${d} layer being filled: ${s.filled.length} of ${w * d} cubes placed` : `${w} cubes across, ${d} rows back, ${h} layers high`,
      layers: s.layersOpen ? 'pulled apart, each layer its own colour' : 'closed',
      highlighted: { none: 'nothing', unit: 'one cube', layers: 'the bottom layer', inside: 'the cubes shut in on every side' }[s.focus],
      counts: expected,
      // After a plan is checked: what they entered beside the block’s real counts.
      checkedPlan: s.kind === 'ask' && s.revealed ? { entered: plan, expected, wrongFields: Object.keys(expected).filter((k) => plan[k] !== expected[k]) } : null,
    };
  },

  gestures: {
    turn: {
      always: true,
      event: 'block_rotated',
      apply(s, delta) {
        if (!Number.isFinite(delta)) return false;
        s.rotation = (s.rotation + Math.max(-Math.PI, Math.min(Math.PI, delta))) % (Math.PI * 2);
        return { rotation: s.rotation };
      },
    },
    // Pulling the layers apart shows the answer to a plan, so it counts as help.
    open: {
      always: true,
      event: 'layers_opened',
      when: (s) => counts(s).layerComplete && s.dims[2] > 1,
      apply(s, opened = !s.layersOpen, { help }) {
        if (typeof opened !== 'boolean' || s.layersOpen === opened) return false;
        s.layersOpen = opened;
        if (opened) help();
        return { opened };
      },
    },
    // Put one cube into the layer being built: a named place, or the next free one.
    place: {
      event: 'cube_placed',
      when: (s) => s.building && !counts(s).layerComplete,
      apply(s, at) {
        const [w, d] = s.dims;
        let [x, z] = at ?? [];
        if (x === undefined)
          for (let k = 0; k < w * d; k++)
            if (!s.filled.includes(`${k % w},${Math.floor(k / w)}`)) {
              [x, z] = [k % w, Math.floor(k / w)];
              break;
            }
        if (!Number.isInteger(x) || !Number.isInteger(z) || x < 0 || z < 0 || x >= w || z >= d || s.filled.includes(`${x},${z}`)) return false;
        s.filled.push(`${x},${z}`);
        return { filled: s.filled.length, layerComplete: counts(s).layerComplete };
      },
    },
    stack: {
      event: 'layer_stacked',
      when: (s) => s.building && counts(s).layerComplete && s.dims[2] < 3,
      apply(s) {
        s.dims[2]++;
        return { layers: s.dims[2], totalCubes: counts(s).totalCubes };
      },
    },
    deepen: {
      event: 'back_rows_added',
      when: (s) => s.building && s.dims[1] === 2 && s.dims[2] === 3,
      apply(s) {
        const added = s.dims[0] * s.dims[2];
        s.dims[1]++;
        // The block is whole now: building is over, and it can be turned and opened.
        s.building = false;
        return { added, totalCubes: counts(s).totalCubes };
      },
    },
  },
  controls: {
    set_layers: {
      description:
        'Open or close the block’s layers when the child asks only for that. Opening before a plan is checked marks that plan as helped; closing does not undo it. It never changes how many cubes there are. To teach the idea, use show_moment.',
      args: { opened: bool },
      event: 'layers_opened',
      apply(s, { opened }, { help }) {
        if (s.layersOpen === opened || !counts(s).layerComplete) return false;
        s.layersOpen = opened;
        if (opened) help();
        return { opened };
      },
    },
  },
  events: {
    block_rotated: event({ rotation: number }),
    layers_opened: event({ opened: bool }),
    cube_placed: event({ filled: integer, layerComplete: bool }),
    layer_stacked: event({ layers: integer, totalCubes: integer }),
    back_rows_added: event({ added: integer, totalCubes: integer }),
  },

  // Each gives a block the child has not seen before, closed, with nothing highlighted.
  situations: {
    small: { lead: 'Your turn with a new block. ' + BOXES, arrange: freshBlock(0) },
    large: { lead: 'Your turn with a bigger block. ' + BOXES, arrange: freshBlock(1) },
    long: { lead: 'Your turn with a long block. ' + BOXES, arrange: freshBlock(2) },
  },

  show: {
    introduction: highlight('unit', {
      when: 'once, at the very start, to say what the lesson is about; follow it with a first question about the block on the table.',
      speech: 'We’re going to learn how to count all the small cubes in a block. We’ll count them in layers. I’ll show you first, then you can try.',
      instruction: 'Count the cubes in layers.',
    }),
    one_layer: highlight('layers', {
      when: 'the child counts only the cubes they can see on the front of the bottom layer, or does not know what a layer is. Child can: count the coloured layer, back row included.',
      speech: (s, f) => `Look at the coloured bottom layer. It has ${f.cubesPerLayer} cubes. A layer is one flat level of cubes. It includes the cubes at the back too.`,
      instruction: 'A layer is one flat level of cubes.',
    }),
    unit_help: highlight('unit', {
      when: 'the child counts faces or squares instead of cubes, or counts a corner cube more than once. Child can: say how many cubes the coloured piece is.',
      speech: 'Look at the coloured cube. Its top and sides are all part of the same little block. We count that cube once.',
      instruction: 'One cube counts once.',
    }),
    layer_help: highlight('layers', {
      when: 'a checked plan has the wrong number for cubes in one layer. Child can: count that layer again, front and back.',
      speech: 'Look at the bottom layer. Count the cubes at the front and at the back. All of them together make one layer.',
      instruction: 'Count the whole bottom layer.',
    }),
    repetition_help: highlight('layers', {
      when: 'the layer count is right but the total is wrong, or the child counts every cube one by one and loses track. Child can: add or multiply the layers to reach the total.',
      speech: (s, f) => `Each layer has ${f.cubesPerLayer} cubes. Add ${f.cubesPerLayer} again for the next layer. Keep going until you have counted every layer.`,
      instruction: 'Every layer has the same number of cubes.',
    }),
    volume: highlight('unit', {
      when: 'the child asks what volume means, or thinks a taller-looking block must always be bigger. Child can: say what is being counted to measure the block.',
      speech: 'Volume means how much space something takes up. We can measure this block by counting its small cubes. Each little cube counts as one.',
      instruction: 'Volume is how much space the block fills.',
    }),
    layers: highlight('layers', {
      when: 'the child has one layer and needs the step to the whole block. Child can: say why every layer has the same number of cubes.',
      speech: (s, f) =>
        `There are ${f.cubesPerLayer} cubes in each layer and ${f.layerCount} layers. That makes ${f.totalCubes} cubes altogether. Pulling the layers apart helps us see them. The number of cubes stays the same.`,
      instruction: 'Equal layers make the block.',
    }),
    no_buried: highlight('layers', {
      when: 'only if the child themselves says nothing is hidden inside a thin block. Never to open the subject.',
      available: (s, f) => (f.hasInterior ? 'This block does have a cube shut in on every side.' : complete(s, f)),
      speech: (s, f) =>
        `You’re right: no cube is completely hidden inside this block. Some may be behind others. There are ${f.cubesPerLayer} in each layer and ${f.layerCount} layers: ${f.totalCubes} cubes altogether.`,
      instruction: 'No cube is hidden right inside this block.',
    }),
    inside: highlight('inside', {
      when: 'only if the child’s own count or words leave out cubes they cannot see, or they ask whether those count, and this block has one enclosed on every side. Child can: find which layer the hidden cube belongs to.',
      available: (s, f) => (f.hasInterior ? complete(s, f) : 'This block has no cube shut in on every side; use larger_example.'),
      speech: 'Some cubes are hidden right inside this block. They still count! Pulling the layers apart lets us see where they belong.',
      instruction: 'Hidden cubes belong to a layer too.',
    }),
    compare_plan: highlight('layers', {
      when: 'a plan has just been checked and its numbers need comparing with the opened block. Child can: find which of their three numbers does not match.',
      available: (s, f) => (s.kind === 'ask' && s.revealed ? true : 'There is no checked plan to compare.'),
      speech: (s, f) =>
        `Look at your numbers beside the opened block. There are ${f.cubesPerLayer} cubes in each layer and ${f.layerCount} layers. That makes ${f.totalCubes} cubes altogether.`,
      instruction: 'Compare your numbers with the block.',
    }),
    larger_example: {
      when: 'only if the child has left out cubes they cannot see and the current block has none enclosed on every side. It replaces the block. Child can: say why counting layers still counts the middle cube.',
      speech: 'Here is a bigger block. A cube is hidden right in the middle. It is part of the middle layer, so counting every layer counts that cube too.',
      instruction: 'The middle cube is part of the middle layer.',
      arrange: () => block([3, 3, 3], { focus: 'inside', layersOpen: true }),
    },
    layer_example: {
      when: 'the child needs to see equal layers on a small block before trying one alone. It replaces the block. Child can: count one layer and say how many layers there are.',
      speech: 'This block has two layers, with 6 cubes in each. Add 6 and 6. That makes 12 cubes altogether.',
      instruction: 'Two layers of 6 make 12.',
      arrange: () => block([3, 2, 2], { focus: 'layers', layersOpen: true }),
    },
  },

  do: {
    build_layer: {
      when: 'the child builds a layer cube by cube, stacks it and adds back rows: it shows what a layer is. Never evidence that they can count with one, and not for a child who already explains layers.',
      speech: 'Let’s build a block. Tap the empty places to fill the bottom layer with cubes. When it is full, you can stack another layer on top.',
      instruction: 'Build a layer using equal cubes.',
      arrange: () => block([3, 2, 1], { building: true }),
      can: ['place', 'stack', 'deepen'],
      goal: (f, s) => f.layerComplete && s.dims[2] > 1,
      target: 'A full bottom layer with at least one more layer stacked on it.',
      detail: (f) => `${f.layerCount} layers of ${f.cubesPerLayer}`,
      canDo: (s) => [
        ...(counts(s).layerComplete ? [] : ['Tap an empty place (or Place cube) to put a cube in the layer']),
        ...(counts(s).layerComplete && s.dims[2] < 3 ? ['Stack layer'] : []),
        ...(s.dims[1] === 2 && s.dims[2] === 3 ? ['Add back rows'] : []),
        'Turn the block',
      ],
    },
    explore_block: {
      when: 'a filled 3 by 3 by 3 block to turn and open freely. Exploration, never evidence.',
      speech: 'Here is a bigger block to look at. Turn it round, and pull its layers apart to see inside.',
      instruction: 'Explore how layers help count cubes.',
      arrange: () => block([3, 3, 3]),
      canDo: ['Turn the block', 'Open or close the layers'],
    },
  },

  ask: {
    layer_plan: {
      when: 'the child counts a closed block they have not seen: cubes in one layer, number of layers, cubes altogether, then Check my plan. small is the first step (the very first is 2 by 2 by 2); large and long change the size, the shape and the arithmetic. Independent unless the layers were opened or an explanation was shown on that block first.',
      question: 'How many cubes altogether?',
      fields: [
        { id: 'perLayer', label: 'Cubes in one layer' },
        { id: 'layers', label: 'Number of layers' },
        { id: 'total', label: 'Cubes altogether' },
      ],
      accept: /^\d{1,3}$/,
      situations: ['small', 'large', 'long'],
      correct: (values, f, s) => scorePlan(s.dims, { perLayer: Number(values.perLayer), layers: Number(values.layers), total: Number(values.total) }),
      // Checking opens the block, so the child sees their numbers beside it.
      reveal: () => ({ layersOpen: true }),
      fact: (f) => `${f.cubesPerLayer} × ${f.layerCount} = ${f.totalCubes} cubes altogether.`,
    },
  },
});

export const { descriptor, tutorView, questionFor } = lesson;
export const createCubes = lesson.create;
