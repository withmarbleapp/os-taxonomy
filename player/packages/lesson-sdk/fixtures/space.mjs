// The Sun, Earth and Moon seen from above Earth's north pole.
import { THREE } from '../stage.mjs';
import { star, earth, moon, orbit } from '../props.mjs';

export const setting = 'space';
export function build(stage) {
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 600);
  camera.position.set(-3, 34, 12);
  camera.lookAt(-3, 0, 0.5);
  const sunAt = new THREE.Vector3(-17, 0, 0);
  stage.setSun(sunAt, { reach: 14 });
  const sun = star({ at: sunAt.toArray(), radius: 2 });
  const home = earth({ radius: 3.2 });
  home.userData.globe.rotation.y = 2.2;
  const companion = moon({ at: [0.4, 0, -9.4], radius: 0.9 });
  stage.scene.add(sun, home, companion, orbit({ radius: 9.4 }));
  return { camera, tick: (t) => sun.userData.tick(t) };
}
