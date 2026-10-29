import { mountLesson } from '/sdk/frame.mjs';
import { createCubes } from './model/cubes.mjs';
import { createCubeScene } from './scene/scene.mjs';
const $ = (id) => document.getElementById(id);
let exp, lastTask;
const scene = createCubeScene({
  canvas: $('world'),
  onPlace: (x, z) => exp.learnerPlace(x, z),
  onRotate: (d) => exp.learnerRotate(d),
  onOpen: (v) => exp.learnerOpen(v),
});
const api = mountLesson({
  create: (opts) => (exp = createCubes(opts)),
  render(snapshot, cover) {
    scene.update(snapshot, cover);
    const s = snapshot.state;
    if (!cover && s.task !== lastTask) {
      lastTask = s.task;
      api.instruction(
        s.task === 'plan'
          ? 'Use layers to count this block.'
          : s.task === 'fill'
            ? 'Build a layer using equal cubes.'
            : 'Explore how layers help count cubes.',
      );
    }
    for (const [id, action] of [
      ['place', 'place_cube'],
      ['stack', 'stack_layer'],
      ['deepen', 'add_back_rows'],
    ])
      $(id).hidden = !s.learnerActions.some((a) => a.name === action && a.enabled);
    $('actions').hidden = cover;
    $('plan-controls').hidden = cover || s.task !== 'plan';
    for (const key of ['perLayer', 'layers', 'total']) {
      if (document.activeElement !== $(key)) $(key).value = s.plan[key] ?? '';
      $(key).disabled = s.revealed;
    }
    $('commit').disabled = s.revealed;
    $('peel').textContent = s.layersOpen ? 'Close layers' : 'Open layers';
  },
  view() {
    const s = exp.snapshot().state,
      a = s.attempts.filter((a) => a.sceneId === s.sceneId).at(-1);
    return {
      ...scene.presentation(),
      cover: { layout: 'scene', title: 'How much space does a block fill?', startLabel: '↗ Let’s find out' },
      currentAttempt: a
        ? {
            ...a,
            expected: { perLayer: s.cubesPerLayer, layers: s.layerCount, total: s.totalCubes },
            wrongFields: ['perLayer', 'layers', 'total'].filter(
              (k) =>
                a[k] !==
                { perLayer: s.cubesPerLayer, layers: s.layerCount, total: s.totalCubes }[k],
            ),
          }
        : null,
    };
  },
  onStart() {
    api.instruction('Explore how layers help count cubes.');
  },
});
$('turn').onclick = () => exp.learnerRotate(0.3);
$('peel').onclick = () => exp.learnerOpen();
$('fresh').onclick = () => api.intent('I would like to try a new block on my own.');
for (const k of ['perLayer', 'layers', 'total'])
  $(k).oninput = () => exp.learnerEdit(k, $(k).value);
$('plan-form').onsubmit = (e) => {
  e.preventDefault();
  exp.learnerCommit();
};

$('place').onclick = () => exp.learnerPlace();
$('stack').onclick = () => exp.learnerStack();
$('deepen').onclick = () => exp.learnerDeepen();
