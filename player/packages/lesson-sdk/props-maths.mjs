// Things to count, measure and compare. Use with the 'tabletop' setting. One
// unit cube is 1 across, so sizes can be read straight off the model.
import { THREE, toon, flat, solid, unlined, PALETTE } from './stage.mjs';
import { box, turned } from './shapes.mjs';

const placed = (group, at) => {
  if (at) group.position.set(at[0], at[1], at[2]);
  return group;
};
const material = (m) => (typeof m === 'string' ? toon(m) : m);
let unitGeometry;
const unit = () => (unitGeometry ??= box(0.94, 0.94, 0.94, 0.1));

// The surface everything stands on.
export function table({ radius = 60, colour = PALETTE.table } = {}) {
  const g = new THREE.Group();
  const top = solid(new THREE.CircleGeometry(radius, 64), toon(colour), g);
  top.rotation.x = -Math.PI / 2;
  top.castShadow = false;
  return g;
}

// A block of unit cubes, `wide` along x, `high` up and `deep` along z, with its
// near left bottom corner at the origin. Each cube stays visible, so the child
// can count them. `group.userData.cubes[x][y][z]` are the cubes, for a lesson
// that hides, lifts or recolours layers.
export function cubes({ at, wide = 1, high = 1, deep = 1, colour = PALETTE.unit } = {}) {
  const g = new THREE.Group(),
    mat = material(colour),
    all = [];
  for (let x = 0; x < wide; x++) {
    all.push([]);
    for (let y = 0; y < high; y++) {
      all[x].push([]);
      for (let z = 0; z < deep; z++) {
        const cube = solid(unit(), mat, g);
        cube.position.set(x + 0.5, y + 0.03, -z - 0.5);
        all[x][y].push(cube);
      }
    }
  }
  g.userData.cubes = all;
  return placed(g, at);
}

// Place-value blocks laid out left to right: hundreds as flats, tens as rods
// standing up, ones as single cubes.
export function baseTen({ at, hundreds = 0, tens = 0, ones = 0 } = {}) {
  const g = new THREE.Group();
  let x = 0;
  for (let i = 0; i < hundreds; i++) {
    g.add(cubes({ at: [x, 0, 0], wide: 10, high: 10, deep: 1, colour: PALETTE.hundred }));
    x += 11;
  }
  for (let i = 0; i < tens; i++) {
    g.add(cubes({ at: [x, 0, 0], wide: 1, high: 10, deep: 1, colour: PALETTE.ten }));
    x += 1.6;
  }
  x += tens ? 0.6 : 0;
  for (let i = 0; i < ones; i++) g.add(cubes({ at: [x + (i % 5) * 1.4, Math.floor(i / 5) * 1.4, 0], colour: PALETTE.unit }));
  return placed(g, at);
}

// A bar cut into equal parts, with the first `filled` coloured in.
export function fractionBar({ at, parts = 4, filled = 1, length = 8, colour = PALETTE.part } = {}) {
  const g = new THREE.Group(),
    w = length / parts,
    on = toon(colour),
    off = toon(PALETTE.paper),
    piece = box(w - 0.08, 0.5, 1.2, 0.08);
  for (let i = 0; i < parts; i++) solid(piece, i < filled ? on : off, g).position.set(w * (i + 0.5), 0, 0);
  return placed(g, at);
}

// A disc cut into equal slices, with the first `filled` coloured in.
export function fractionCircle({ at, parts = 4, filled = 1, radius = 2, colour = PALETTE.part } = {}) {
  const g = new THREE.Group(),
    on = toon(colour),
    off = toon(PALETTE.paper),
    slice = (Math.PI * 2) / parts;
  for (let i = 0; i < parts; i++) {
    // A wedge with a hairline gap each side, so every slice keeps its own edge.
    const geometry = new THREE.CylinderGeometry(radius, radius, 0.35, Math.max(6, Math.round(48 / parts)), 1, false, i * slice + 0.012, slice - 0.024);
    const piece = solid(geometry, i < filled ? on : off, g);
    piece.material.side = THREE.DoubleSide;
    piece.position.y = 0.2;
  }
  return placed(g, at);
}

// Text standing in the scene, always facing the viewer. For numbers on a
// model; instructions and names belong to the page, not the scene.
export function label(text, { at, size = 0.9, colour = PALETTE.ink } = {}) {
  const c = document.createElement('canvas'),
    font = '600 96px "Baloo 2", system-ui, sans-serif',
    measure = c.getContext('2d');
  measure.font = font;
  c.width = Math.ceil(measure.measureText(text).width) + 24;
  c.height = 128;
  const g = c.getContext('2d');
  g.font = font;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = colour;
  g.fillText(text, c.width / 2, 68);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry((size * c.width) / c.height, size),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }),
  );
  const group = new THREE.Group().add(plane);
  group.userData.faceCamera = true;
  return placed(unlined(group), at);
}

// A number line lying along x from the origin, one unit per `step`, with a
// tick and a number at each mark.
export function numberLine({ at, from = 0, to = 10, step = 1, spacing = 1, colour = PALETTE.ink } = {}) {
  const g = new THREE.Group(),
    count = Math.round((to - from) / step),
    length = count * spacing,
    mat = flat(colour);
  const line = new THREE.Mesh(box(length + 1, 0.08, 0.08, 0.02), mat);
  line.position.set(length / 2, 0.02, 0);
  g.add(line);
  for (let i = 0; i <= count; i++) {
    const tick = new THREE.Mesh(box(0.08, 0.08, 0.5, 0.02), mat);
    tick.position.set(i * spacing, 0.02, 0);
    g.add(tick, label(String(from + i * step), { at: [i * spacing, 0.5, 0.9], size: 0.7, colour }));
  }
  return placed(g, at);
}

// Round counters in a row or an array of `columns`.
export function counters({ at, count = 5, columns = count, colour = PALETTE.part } = {}) {
  const g = new THREE.Group(),
    mat = material(colour),
    disc = turned([[0, 0], [0.4, 0], [0.45, 0.06], [0.45, 0.16], [0.4, 0.22], [0, 0.22]], 28);
  for (let i = 0; i < count; i++) solid(disc, mat, g).position.set((i % columns) * 1.1, 0, Math.floor(i / columns) * 1.1);
  return placed(g, at);
}

// A two-pan balance. `tilt` runs from -1 (left side down) to 1 (right side
// down); 0 is level. Things to weigh go in `group.userData.pans[0 or 1]`.
export function balance({ at, tilt = 0, colour = PALETTE.metal } = {}) {
  const g = new THREE.Group(),
    mat = toon(colour),
    wood = toon(PALETTE.wood);
  solid(turned([[0, 0], [1.3, 0], [1.4, 0.12], [1.3, 0.3], [0.3, 0.42], [0.18, 3.6], [0.28, 3.75], [0, 3.8]], 32), wood, g);
  const beam = new THREE.Group();
  beam.position.y = 3.55;
  beam.rotation.z = -tilt * 0.22;
  g.add(beam);
  solid(box(7, 0.22, 0.3, 0.08), mat, beam).position.y = -0.11;
  const pans = [-1, 1].map((side) => {
    const hanger = new THREE.Group();
    hanger.position.x = side * 3.2;
    hanger.rotation.z = tilt * 0.22; // pans hang level
    beam.add(hanger);
    for (const x of [-0.9, 0.9]) {
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 2.1, 5), flat(PALETTE.ink));
      cord.position.set(x * 0.5, -1.05, 0);
      cord.rotation.z = x * 0.42;
      hanger.add(unlined(cord));
    }
    const pan = new THREE.Group();
    pan.position.y = -2.1;
    solid(turned([[0, 0], [1.0, 0], [1.25, 0.28], [1.18, 0.3], [0.95, 0.08], [0, 0.08]], 32), mat, pan);
    hanger.add(pan);
    return pan;
  });
  g.userData.pans = pans;
  g.userData.beam = beam;
  return placed(g, at);
}
