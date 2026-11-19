// The kit's characters, standing and walking.
import { THREE } from '../stage.mjs';
import { meadow, grass, tree, character, CHARACTERS } from '../props.mjs';

export const setting = 'daylight';
export async function build(stage) {
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 4000);
  camera.position.set(0, 2.0, 11);
  camera.lookAt(0, 0.85, 0);
  stage.setSun(new THREE.Vector3(-0.5, 0.9, 0.7), { reach: 14 });
  const names = Object.keys(CHARACTERS),
    cast = names.map((name, i) => character(name, { at: [(i - (names.length - 1) / 2) * 1.5 - 0.6, 0, 0], pack: i === 0 }));
  cast.forEach((c, i) => (c.rotation.y = [0.3, 0, -0.25, 0.1][i] ?? 0));
  const walker = character('mia', { at: [3.4, 0, 0.6] });
  walker.rotation.y = -1.2;
  walker.userData.play('walk');
  stage.scene.add(meadow(), grass({ radius: 30, count: 9000 }), tree({ at: [-7, 0, -5], height: 7 }), ...cast, walker);
  await Promise.all([...cast, walker].map((c) => c.userData.ready));
  return {
    camera,
    labels: [...names.map((text, i) => ({ text, at: new THREE.Vector3(cast[i].position.x, -0.15, 0.4) })), { text: 'walk', at: new THREE.Vector3(3.4, -0.15, 1) }],
    tick: (t) => [...cast, walker].forEach((c) => c.userData.tick(t + 0.4)),
  };
}
