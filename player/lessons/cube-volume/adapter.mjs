import { mountLesson } from '/sdk/frame.mjs';
import { bindMoments } from '/sdk/moments-ui.mjs';
import { createCubes, questionFor, tutorView } from './model/cubes.mjs';
import { createCubeScene } from './scene/scene.mjs';
const $ = (id) => document.getElementById(id);
let exp;
const scene = createCubeScene({
  canvas: $('world'),
  onPlace: (x, z) => exp.gesture('place', [x, z]),
  onRotate: (d) => exp.gesture('turn', d),
  onOpen: (v) => exp.gesture('open', v),
});
// The plan's three boxes and its Check button are the standard fill-in controls.
const controls = bindMoments({
  model: () => exp,
  questionFor,
  ids: { 'fields-form': 'plan-form', 'fields-check': 'commit' },
});
const api = mountLesson({
  create: (opts) => (exp = createCubes(opts)),
  render(snapshot, cover) {
    scene.update(snapshot, cover);
    const s = snapshot.state,
      { filling } = controls(snapshot, cover);
    if (!cover) api.instruction(s.instruction);
    $('place').hidden = !s.canPlace;
    $('stack').hidden = !s.canStack;
    $('deepen').hidden = !s.canDeepen;
    $('actions').hidden = cover;
    $('plan-controls').hidden = !filling;
    $('peel').textContent = s.layersOpen ? 'Close layers' : 'Open layers';
  },
  view() {
    return {
      ...scene.presentation(),
      ...tutorView(exp.snapshot().state),
      cover: { layout: 'scene', title: 'How much space does a block fill?', startLabel: '↗ Let’s find out' },
    };
  },
  onStart() {
    api.instruction(exp.snapshot().state.instruction);
  },
});
// For the browser check (scripts/cube-browser-check.mjs).
window.cubeLesson = { model: () => exp, snapshot: () => exp?.snapshot(), view: () => scene.presentation(), project: scene.project };
$('turn').onclick = () => exp.gesture('turn', 0.3);
$('peel').onclick = () => exp.gesture('open');
$('fresh').onclick = () => api.intent('I would like to try a new block on my own.');
$('place').onclick = () => exp.gesture('place');
$('stack').onclick = () => exp.gesture('stack');
$('deepen').onclick = () => exp.gesture('deepen');
