// Sea life and seabed, from the otter and kelp forest lesson. Use with the
// 'underwater' setting. Animals face +z and are sized against a sea otter
// about 2.6 long.
import { THREE, toon, flat, solid, unlined, PALETTE } from './stage.mjs';
import { blob, ellipsoid, merge, slab, shoreline, ribbon, tube } from './shapes.mjs';

const placed = (group, at) => {
  if (at) group.position.set(at[0], at[1], at[2]);
  return group;
};
function random(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 4294967296);
}
const both = (colour) => toon(colour, { side: THREE.DoubleSide });

// A slab of rock with a sandy top: the base a small habitat sits on. The top
// is at y = 0. `rx` and `rz` are its half-sizes.
export function shelf({ at, rx = 12, rz = 7, depth = 1.7, rock = PALETTE.seaRock, sand = PALETTE.seaSand, stones = 18, seed = 71 } = {}) {
  const g = new THREE.Group(),
    rand = random(seed),
    outline = shoreline(rx, rz);
  const base = solid(slab(outline, { depth, bevel: 0.42 }), toon(rock), g);
  base.position.y = -0.34;
  const top = solid(slab(outline.map(([x, z]) => [x * 0.985, z * 0.985]), { depth: 0.05, bevel: 0 }), toon(sand), g);
  top.position.y = 0.05;
  top.castShadow = false;
  const light = toon(PALETTE.seaRockLight),
    dark = toon(rock);
  for (let i = 0; i < stones; i++) {
    const a = rand() * Math.PI * 2,
      r = Math.sqrt(rand()) * 0.92,
      size = 0.4 + rand() * 0.75;
    const stone = solid(new THREE.IcosahedronGeometry(size, 1).scale(1.4, 0.45 + rand() * 0.45, 1), i % 3 ? light : dark, g);
    stone.position.set(Math.cos(a) * rx * r, 0.02, Math.sin(a) * rz * r);
    stone.rotation.y = rand() * Math.PI * 2;
  }
  return placed(g, at);
}

// Giant kelp: a wavering stem with paired blades. `height` in units.
export function kelp({ at, height = 6, colour = PALETTE.kelp, seed = 1 } = {}) {
  const g = new THREE.Group(),
    rand = random(seed),
    phase = rand() * 6,
    blades = [],
    stems = [],
    bulbs = [];
  for (let branch = 0; branch < 2; branch++) {
    const h = height * (branch === 0 ? 1 : 0.72),
      offset = (branch - 1) * 0.2;
    const spine = Array.from({ length: 9 }, (_, j) => {
      const t = j / 8;
      return new THREE.Vector3(Math.sin(t * 3 + phase) * 0.34 * t + offset * t, h * t, Math.cos(t * 2 + phase) * 0.25 * t);
    });
    const curve = new THREE.CatmullRomCurve3(spine);
    stems.push(tube(spine, 0.037, 5));
    for (let j = 1; j < 11; j++) {
      const t = j / 12,
        base = curve.getPoint(t),
        side = j % 2 ? 1 : -1,
        angle = phase + branch * 2.1 + j * 0.47,
        dir = new THREE.Vector3(Math.cos(angle) * side, 0, Math.sin(angle) * side),
        length = (1.1 + Math.sin(t * Math.PI) * 0.9) * (branch === 0 ? 1 : 0.85),
        width = 0.1 + Math.sin(t * Math.PI) * 0.075;
      const path = Array.from({ length: 6 }, (_, s) => {
        const q = s / 5,
          p = base.clone().addScaledVector(dir, length * q);
        p.y += Math.sin(q * Math.PI) * 0.38 - q * q * 0.65;
        return p;
      });
      blades.push(ribbon(path, { width: (q) => Math.pow(Math.sin(q * Math.PI), 0.8) * width, across: new THREE.Vector3(0, 1, 0) }).toNonIndexed());
      if (j % 2 === 0) bulbs.push(ellipsoid(base.x, base.y, base.z, 0.075, 0.12, 0.075, 8));
    }
  }
  solid(merge(blades), both(colour), g);
  solid(merge(stems), toon(PALETTE.kelpStem), g);
  solid(merge(bulbs), toon(colour), g);
  return placed(g, at);
}

// A tuft of long seagrass leaves.
export function seagrass({ at, height = 3, colour = PALETTE.seagrass, seed = 1 } = {}) {
  const g = new THREE.Group(),
    rand = random(seed),
    phase = rand() * 6,
    leaves = [];
  for (let j = 0; j < 9; j++) {
    const angle = j * 2.39996 + phase,
      h = height * (0.8 + (j % 4) * 0.16),
      lean = 0.6 + (j % 3) * 0.3;
    const path = Array.from({ length: 5 }, (_, n) => {
      const t = n / 4,
        r = 0.18 + t * t * lean;
      return new THREE.Vector3(Math.cos(angle) * r, h * t, Math.sin(angle) * r);
    });
    leaves.push(
      ribbon(path, {
        width: (t) => 0.14 * Math.sin(Math.PI * (0.08 + t * 0.92)),
        across: new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle)),
      }).toNonIndexed(),
    );
  }
  solid(merge(leaves), both(colour), g);
  return placed(g, at);
}

// A sea otter swimming on its front. The returned group has `userData.parts`
// (head, tail, paws, flippers) for a lesson that wants to pose it.
export function otter({ at } = {}) {
  const g = new THREE.Group(),
    fur = toon(PALETTE.fur),
    light = toon(PALETTE.furLight),
    cream = toon(PALETTE.muzzle),
    dark = flat('#152b2c');
  solid(blob([[0, 0, -0.15, 0.48, 0.4, 1.05], [0, 0.08, 0.65, 0.38, 0.38, 0.53]]), fur, g);
  const paws = [],
    flippers = [];
  for (const side of [-1, 1]) {
    const paw = new THREE.Group();
    paw.position.set(side * 0.39, -0.08, 0.63);
    solid(ellipsoid(0, -0.16, 0.14, 0.16, 0.17, 0.36, 10), fur, paw);
    solid(ellipsoid(0, -0.25, 0.4, 0.17, 0.12, 0.18, 10), light, paw);
    const flipper = new THREE.Group();
    flipper.position.set(side * 0.3, -0.06, -0.88);
    solid(ellipsoid(side * 0.06, 0, -0.28, 0.26, 0.11, 0.43, 10), fur, flipper);
    g.add(paw, flipper);
    paws.push(paw);
    flippers.push(flipper);
  }
  const head = new THREE.Group();
  head.position.set(0, 0.14, 1.02);
  g.add(head);
  solid(blob([[0, 0, 0, 0.43, 0.38, 0.4], [-0.33, 0.21, -0.07, 0.13, 0.14, 0.095], [0.33, 0.21, -0.07, 0.13, 0.14, 0.095]]), light, head);
  solid(blob([[-0.14, -0.09, 0.33, 0.22, 0.15, 0.16], [0.14, -0.09, 0.33, 0.22, 0.15, 0.16], [0, -0.25, 0.06, 0.26, 0.13, 0.27]]), cream, head);
  const face = new THREE.Mesh(blob([[-0.21, 0.09, 0.322, 0.043, 0.052, 0.035], [0.21, 0.09, 0.322, 0.043, 0.052, 0.035], [0, -0.015, 0.472, 0.09, 0.055, 0.048]], 8), dark);
  head.add(unlined(face));
  const tail = solid(ellipsoid(0, -0.03, -1.4, 0.16, 0.13, 0.65, 10), fur, g);
  g.userData.parts = { head, tail, paws, flippers };
  return placed(g, at);
}

// A small reef fish with a tail fin.
export function fish({ at, colour = PALETTE.fish, size = 1 } = {}) {
  const g = new THREE.Group();
  solid(ellipsoid(0, 0, 0, 0.13, 0.24, 0.49, 12), toon(colour), g);
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(0.28, -0.3);
  shape.lineTo(0.28, 0.3);
  shape.closePath();
  const tail = solid(new THREE.ShapeGeometry(shape).rotateY(Math.PI / 2), both(PALETTE.fin), g);
  tail.position.z = -0.43;
  const eyes = new THREE.Mesh(blob([[-0.118, 0.07, 0.25, 0.028, 0.034, 0.03], [0.118, 0.07, 0.25, 0.028, 0.034, 0.03]], 6), flat('#152b2c'));
  g.add(unlined(eyes));
  g.userData.parts = { tail };
  g.scale.setScalar(size);
  return placed(g, at);
}

// A spiny sea urchin.
export function urchin({ at, colour = PALETTE.urchin, size = 1 } = {}) {
  const parts = [ellipsoid(0, 0.26, 0, 0.29, 0.23, 0.29, 10)],
    up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 72; i++) {
    const angle = i * 2.39996,
      y = 1 - (2 * (i + 0.5)) / 72,
      r = Math.sqrt(1 - y * y),
      v = new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
    const spike = new THREE.ConeGeometry(0.037, 0.3 + (i % 3) * 0.035, 5);
    spike.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, v));
    spike.translate(v.x * 0.32, 0.26 + v.y * 0.22, v.z * 0.32);
    parts.push(spike);
  }
  const g = new THREE.Group();
  solid(merge(parts), toon(colour), g);
  g.scale.setScalar(size);
  return placed(g, at);
}

export function crab({ at, colour = PALETTE.crab, size = 1 } = {}) {
  const parts = [ellipsoid(0, 0.26, 0, 0.45, 0.22, 0.32, 12)];
  for (const side of [-1, 1]) {
    for (let j = 0; j < 4; j++) {
      const leg = new THREE.CylinderGeometry(0.035, 0.025, 0.65, 5);
      leg.rotateZ(side * 1.1);
      leg.rotateY((j - 1.5) * 0.4);
      leg.translate(side * 0.48, 0.14, (j - 1.5) * 0.18);
      parts.push(leg);
    }
    parts.push(ellipsoid(side * 0.49, 0.32, 0.4, 0.15, 0.12, 0.22, 8));
  }
  const g = new THREE.Group();
  solid(merge(parts), toon(colour), g);
  g.scale.setScalar(size);
  return placed(g, at);
}

export function seaStar({ at, colour = PALETTE.seaStar, size = 1 } = {}) {
  const parts = [ellipsoid(0, 0.16, 0, 0.3, 0.13, 0.3, 10)];
  for (let i = 0; i < 5; i++) parts.push(ellipsoid(0, 0.12, 0.3, 0.14, 0.1, 0.45, 10).rotateY((i * Math.PI * 2) / 5));
  const g = new THREE.Group();
  solid(merge(parts), toon(colour), g);
  g.scale.setScalar(size);
  return placed(g, at);
}

export function mussel({ at, colour = PALETTE.mussel, size = 1 } = {}) {
  const g = new THREE.Group();
  solid(blob([[-0.045, 0.2, 0, 0.17, 0.23, 0.34], [0.045, 0.2, 0, 0.17, 0.23, 0.34]], 10), toon(colour), g);
  g.scale.setScalar(size);
  return placed(g, at);
}

// Pale flecks drifting in the water, and far kelp as flat silhouettes: the
// depth of an underwater scene. Add once, behind everything.
export function seaDepth({ width = 60, seed = 5 } = {}) {
  const g = new THREE.Group(),
    rand = random(seed),
    haze = flat('#236f73', { transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
  for (let i = 0; i < 18; i++) {
    const h = 7 + rand() * 9,
      phase = rand() * 6;
    const spine = Array.from({ length: 7 }, (_, j) => new THREE.Vector3(Math.sin((j / 6) * 3 + phase) * 0.5, (h * j) / 6, 0));
    const frond = new THREE.Mesh(ribbon(spine, { width: (t) => 0.12 + 0.3 * Math.sin(Math.PI * t), across: new THREE.Vector3(0, 0, 1) }), haze);
    frond.position.set(((i - 8.5) * width) / 17, -1, -16 - rand() * 8);
    g.add(frond);
  }
  const flecks = [];
  for (let i = 0; i < 110; i++) flecks.push((rand() - 0.5) * 40, rand() * 16, (rand() - 0.5) * 26);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(flecks, 3));
  g.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#d6edc1', size: 0.055, transparent: true, opacity: 0.4, depthWrite: false })));
  return unlined(g);
}
