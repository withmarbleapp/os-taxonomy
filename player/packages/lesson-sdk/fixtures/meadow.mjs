// An arrangement made from the separate daylight pieces, seen from above: a
// flat clearing with a fountain and a child, ringed by trees.
import { THREE } from '../stage.mjs';
import { meadow, terrain, scatter, grass, flowers, tree, character, fountain, cloud, ray, mountains, skyClouds } from '../props.mjs';

export const setting = 'daylight';
export async function build(stage) {
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 7000);
  camera.position.set(9, 6, 24);
  camera.lookAt(0, 2.6, -6);
  const towardsSun = new THREE.Vector3(-0.55, 0.6, 0.35);
  stage.setSun(towardsSun, { centre: new THREE.Vector3(0, 0, -4), reach: 46 });
  const heightAt = terrain({ flat: 26 });
  const child = character('sam', { at: [2.2, 0, 7.5], pack: true });
  child.rotation.y = Math.PI + 0.25;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const turf = grass({ heightAt, radius: 70, keep: (x, z) => Math.hypot(x, z + 6) > 3.4 });
  stage.scene.add(
    meadow({ heightAt }),
    turf,
    flowers({ heightAt, to: 30 }),
    scatter({ heightAt, from: 30, to: 260, trees: 50 }),
    tree({ at: [-11, 0, -3], height: 8 }),
    tree({ at: [12.5, 0, 2], height: 7, kind: 'birch', seed: 4 }),
    fountain({ at: [0, 0, -6], radius: 2.7 }),
    child,
    mountains(),
    skyClouds({ avoid: [towardsSun.clone().normalize()] }),
    cloud({ at: [-9, 9, -8], size: 0.8 }),
    ray(V(-12, 10, -9), V(-1.5, 3.2, -6.4), { head: true }),
  );
  await child.userData.ready;
  return { camera, tick: (t) => (turf.userData.tick(t), child.userData.tick(t)) };
}
