// Maths on a table: counting cubes, place value, fractions, a number line and
// a balance.
import { THREE } from '../stage.mjs';
import { table, cubes, baseTen, fractionBar, fractionCircle, numberLine, counters, balance } from '../props.mjs';

export const setting = 'tabletop';
export function build(stage) {
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 400);
  camera.position.set(4, 22, 34);
  camera.lookAt(4, 2, 0);
  stage.setSun(new THREE.Vector3(-0.5, 1, 0.6), { centre: new THREE.Vector3(4, 0, 0), reach: 26 });
  const scale = balance({ at: [15, 0, -2], tilt: 0.6 });
  scale.userData.pans[0].add(cubes({ at: [-0.5, 0.1, 0.5] }));
  scale.userData.pans[1].add(cubes({ at: [-1, 0.1, 0.5], wide: 2, high: 2 }));
  stage.scene.add(
    table(),
    cubes({ at: [-12, 0, -3], wide: 4, high: 3, deep: 2 }),
    baseTen({ at: [-5, 0, -4], hundreds: 1, tens: 3, ones: 4 }),
    fractionBar({ at: [-12, 0, 5], parts: 5, filled: 2 }),
    fractionCircle({ at: [0.5, 0, 5.5], parts: 6, filled: 5 }),
    counters({ at: [5.5, 0, 4], count: 12, columns: 4 }),
    numberLine({ at: [-10, 0, 10], to: 10, spacing: 2 }),
    scale,
  );
  return { camera };
}
