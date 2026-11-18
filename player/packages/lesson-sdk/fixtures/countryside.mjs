// The Moon lesson's ground view: standing on the plaza, looking down the lane
// to the village.
import { THREE } from '../stage.mjs';
import { countryside } from '../props.mjs';

export const setting = 'daylight';
export function build(stage) {
  const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 7000);
  camera.position.set(0, 1.6, 0);
  camera.lookAt(0, 3.2, -10);
  const towardsSun = new THREE.Vector3(-0.5, 0.8, 0.2);
  stage.setSun(towardsSun, { centre: new THREE.Vector3(0, 0, -30), reach: 70 });
  const land = countryside({ avoid: [towardsSun.clone().normalize()] });
  stage.scene.add(land);
  return { camera, tick: land.userData.tick };
}
