// Every daylight prop side by side, with its name.
import { THREE } from '../stage.mjs';
import * as props from '../props.mjs';

export const setting = 'daylight';
export async function build(stage) {
  const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 600);
  camera.position.set(0, 10, 34);
  camera.lookAt(0, 3.6, 0);
  stage.setSun(new THREE.Vector3(0.5, 0.8, 0.6), { reach: 30 });
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  stage.scene.add(props.meadow());
  const items = [
    ["tree()", props.tree({ at: [-15, 0, -2] }), V(-15, -0.5, 1)],
    ["tree({ kind: 'fir' })", props.tree({ at: [-10.5, 0, -2], kind: 'fir' }), V(-10.5, -0.5, 1)],
    ["'birch'", props.tree({ at: [-6.8, 0, -2], kind: 'birch' }), V(-6.8, -0.5, 1)],
    ["'willow'", props.tree({ at: [-2.6, 0, -2], kind: 'willow' }), V(-2.6, -0.5, 1)],
    ['bush()', props.bush({ at: [0.6, 0, 1], size: 1.2 }), V(0.6, -0.5, 2)],
    ['rock()', props.rock({ at: [2.6, 0, 1], size: 1.4 }), V(2.6, -0.5, 2)],
    ["character('mia')", props.character('mia', { at: [4.6, 0, 1] }), V(4.6, -0.5, 2)],
    ['fountain()', props.fountain({ at: [8.2, 0, 0] }), V(8.2, -0.5, 2.5)],
    ['house()', props.house({ at: [15.5, 0, -6] }), V(15.5, -0.5, 0)],
    ['arrow()', props.arrow({ at: [10.8, 0.5, 3] }), V(12.4, -0.5, 3.6)],
    ['cloud()', props.cloud({ at: [-4, 11.5, -6] }), V(-4, 9.3, -6)],
    ['cloud({ colour })', props.cloud({ at: [4, 11.5, -6], colour: '#8f99a8' }), V(4, 9.3, -6)],
    ['ray(a, b, { head })', props.ray(V(10.5, 11, -3), V(14, 7.7, -3), { head: true }), V(12.5, 6.9, -3)],
  ];
  for (const [, object] of items) stage.scene.add(object);
  await Promise.all(items.map(([, object]) => object.userData.ready));
  return { camera, labels: items.map(([text, , at]) => ({ text, at })) };
}
