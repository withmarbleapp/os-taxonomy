// A kelp forest on a rock shelf: the otter lesson's habitat, from the kit.
import { THREE } from '../stage.mjs';
import { shelf, kelp, seagrass, otter, fish, urchin, crab, seaStar, mussel, seaDepth } from '../props.mjs';

export const setting = 'underwater';
export function build(stage) {
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 150);
  camera.position.set(21, 17.5, 32);
  camera.lookAt(-2, 2.3, 0);
  stage.setSun(new THREE.Vector3(-12, 24, 9), { reach: 22 });
  let seed = 9;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
  const spot = (spread = 0.85) => {
    const a = rand() * Math.PI * 2,
      r = Math.sqrt(rand()) * spread;
    return [Math.cos(a) * 12 * r, 0.08, Math.sin(a) * 7 * r];
  };
  const scene = stage.scene;
  scene.add(seaDepth(), shelf());
  const golds = ['#9eaa42', '#b4a146', '#7d9b49', '#c0ad50'];
  for (let i = 0; i < 22; i++) scene.add(kelp({ at: spot(0.8), height: 4 + rand() * 3.5, colour: golds[i % 4], seed: i + 1 }));
  for (let i = 0; i < 5; i++) scene.add(seagrass({ at: spot(0.9), seed: i + 1 }));
  for (let i = 0; i < 16; i++) scene.add(urchin({ at: spot(0.9) }));
  for (let i = 0; i < 5; i++) scene.add(crab({ at: spot(0.9) }), seaStar({ at: spot(0.9) }), mussel({ at: spot(0.9) }));
  const swimmers = [];
  for (let i = 0; i < 16; i++) {
    const f = fish({ at: spot(0.8) });
    f.position.y = 1.2 + rand() * 4;
    f.rotation.y = rand() * 6.28;
    scene.add(f);
    swimmers.push(f);
  }
  const otters = [[-4, 2.6, 1.5, 0.6], [3.5, 3.4, -1, -2.2], [6.5, 1.3, 3, 2.4]].map(([x, y, z, turn]) => {
    const o = otter({ at: [x, y, z] });
    o.rotation.set(-0.25, turn, 0, 'YXZ');
    scene.add(o);
    return o;
  });
  return {
    camera,
    tick(t) {
      swimmers.forEach((f, i) => (f.userData.parts.tail.rotation.y = Math.sin(t * 6 + i) * 0.5));
      otters.forEach((o, i) => (o.userData.parts.tail.rotation.y = Math.sin(t * 2 + i) * 0.3));
    },
  };
}
