import { mountLesson } from '/sdk/frame.mjs';
import { createRainbow } from './model/rainbow.mjs';
import { createScene } from './scene/scene.mjs';
let model, api;
const scene = createScene(
  () => model,
  () => api?.viewChanged(),
);
api = mountLesson({
  create: (opts) => (model = createRainbow(opts)),
  render: (snapshot, cover) => scene.update(snapshot, cover),
  view: () => ({
    ...scene.presentation(),
    cover: {
      layout: 'illustrated',
      title: 'How does a rainbow form?',
      startLabel: '↗ Let’s find out',
    },
  }),
});
window.rainbowLesson = { model: () => model, snapshot: () => model?.snapshot(), view: () => scene.presentation() };
