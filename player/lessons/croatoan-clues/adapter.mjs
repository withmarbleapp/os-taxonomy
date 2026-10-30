import { mountLesson } from '/sdk/frame.mjs';
import { createExperience } from './model/starter.mjs';
import { createScene } from './scene/scene.mjs';
import { introduction } from './model/introduction.mjs';
const container = document.getElementById('experience');
let exp;
const scene = createScene({ container, getExperience: () => exp });
const api = mountLesson({
  create: (opts) => (exp = createExperience(opts)),
  render: (s, cover) => scene.update(s, cover),
  view: () => ({
    ...scene.presentation(),
    cover: { layout: 'illustrated', title: 'Where did the Roanoke settlers go?', startLabel: '↗ Let’s find out' },
    activeSource: exp.snapshot().state.activeSource,
    scene: exp.snapshot().state.scene,
  }),
  onStart() {
    exp.learner('show_introduction', { beat: 'where' });
  },
});
container.addEventListener('scene-instruction', (e) =>
  api.instruction(
    exp?.snapshot().state.introduction.active
      ? ''
      : typeof e.detail === 'string'
        ? e.detail
        : (e.detail?.text ?? ''),
  ),
);
container.addEventListener('intro-narration', (e) => {
  if (e.detail.leave) {
    if (e.detail.firstVisit) exp.learner('visit_place', { place: 'map' });
    api.narrate(
      e.detail.firstVisit
        ? 'Choose a place on the map. We’ll examine clues and think about what they can tell us.'
        : 'Back to your investigation.',
    );
  } else api.narrate(introduction.find((b) => b.id === e.detail.beat)?.text ?? '');
});
