// A custom object from three sides, between kit objects of the same setting.
// Driven by `npm run kit -- look`.
import { THREE } from '../stage.mjs';
import * as props from '../props.mjs';

const neighbours = {
  daylight: () => [props.tree({ height: 5 }), props.character('mia')],
  underwater: () => [props.kelp({ height: 4 }), lifted(props.otter(), 1.2)],
  space: () => [props.earth({ radius: 1.6 }), props.moon({ radius: 1 })],
  tabletop: () => [props.cubes({ wide: 2, high: 2, deep: 1 }), props.counters({ count: 4, columns: 2 })],
};
const ground = {
  daylight: () => props.meadow(),
  underwater: () => props.shelf({ rx: 30, rz: 12, stones: 0 }),
  space: () => new THREE.Group(),
  tabletop: () => props.table(),
};
function lifted(object, y) {
  object.position.y = y;
  return object;
}
const measure = (object) => new THREE.Box3().setFromObject(object);

export async function build(stage, params) {
  const setting = params.get('setting') ?? 'daylight';
  const module = await import(params.get('object'));
  const make = module[params.get('export') ?? 'default'];
  const views = [0.5, 2.6, 4.2].map((turn) => {
    const holder = new THREE.Group().add(make());
    holder.rotation.y = turn;
    return holder;
  });
  const size = measure(views[0]).getSize(new THREE.Vector3()),
    step = Math.max(size.x, size.z, 1.5) * 1.5,
    [left, right] = neighbours[setting]();
  await Promise.all([left.userData.ready, right.userData.ready]);
  // Objects that do not rest on the ground (a planet, a fish) are lifted clear.
  const rest = setting === 'space' ? 0 : Math.max(0, -measure(views[0]).min.y);
  views.forEach((v, i) => v.position.set((i - 1) * step, rest, 0));
  const edge = 1.5 * step + Math.max(size.x, 2);
  left.position.x = -edge - measure(left).getSize(new THREE.Vector3()).x / 2;
  right.position.x = edge + measure(right).getSize(new THREE.Vector3()).x / 2;
  stage.scene.add(ground[setting](), left, right, ...views);
  stage.setSun(new THREE.Vector3(-0.5, 0.9, 0.7), { reach: edge * 2 + 10 });
  const all = new THREE.Box3();
  for (const o of [left, right, ...views]) all.union(measure(o));
  const centre = all.getCenter(new THREE.Vector3()),
    span = all.getSize(new THREE.Vector3());
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 800);
  const distance = Math.max(span.x / 2.2, span.y) / Math.tan((13 * Math.PI) / 180) / 1.6;
  camera.position.set(centre.x, centre.y + distance * 0.32, centre.z + distance);
  camera.lookAt(centre);
  return { camera };
}
