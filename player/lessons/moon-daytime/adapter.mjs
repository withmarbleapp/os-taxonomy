import { mountLesson } from '/sdk/frame.mjs';
import { createMoon } from './model/moon.mjs';
import { createScene } from './scene/scene.mjs';
let model, api;
const scene = createScene(
  () => model,
  () => api?.viewChanged(),
);
api = mountLesson({
  create: (opts) => (model = createMoon(opts)),
  render: (snapshot, cover) => scene.update(snapshot, cover),
  view: () => ({
    ...scene.presentation(),
    cover: {
      layout: 'illustrated',
      title: 'Why can we see the Moon in daytime?',
      startLabel: '↗ Let’s find out',
    },
    currentAttempt:
      model
        ?.snapshot()
        .state.attempts.filter((a) => a.sceneId === model.snapshot().state.sceneId)
        .at(-1) ?? null,
  }),
});
window.moonLesson = { snapshot: () => model?.snapshot(), view: () => scene.presentation() };
