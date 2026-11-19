// Shaping tools: the handful of ways Marble's objects are formed.
//
// Almost everything in the kit is one of these, coloured with `toon` and added
// with `solid`. A custom object made the same way will sit beside the kit
// without looking foreign:
//
//   blob     soft bodies: animals, fruit, stones, clouds, limbs
//   turned   anything round about an axis: cups, columns, vases, wheels
//   slab     a flat outline given thickness: islands, leaves of land, tiles
//   ribbon   thin strips that bend: leaves, kelp, flags, paper
//   tube     stems, ropes, pipes, tails
//   box      blocks, with softened edges
//
// Keep forms few and rounded, and let the silhouette say what the thing is.
import { THREE } from './stage.mjs';

// Joins geometries into one, so a body made of several forms is outlined and
// shaded as a single object. The inputs are disposed.
export function merge(parts) {
  const positions = [],
    normals = [];
  for (const part of parts) {
    const g = part.index ? part.toNonIndexed() : part;
    if (!g.attributes.normal) g.computeVertexNormals();
    positions.push(g.attributes.position.array);
    normals.push(g.attributes.normal.array);
    if (g !== part) g.dispose();
    part.dispose();
  }
  const join = (arrays) => {
    const out = new Float32Array(arrays.reduce((n, a) => n + a.length, 0));
    let at = 0;
    for (const a of arrays) {
      out.set(a, at);
      at += a.length;
    }
    return out;
  };
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(join(positions), 3));
  geometry.setAttribute('normal', new THREE.BufferAttribute(join(normals), 3));
  return geometry;
}

// One stretched sphere: centre x, y, z and half-sizes sx, sy, sz.
export function ellipsoid(x, y, z, sx, sy, sz, detail = 16) {
  return new THREE.SphereGeometry(1, detail, Math.round(detail * 0.75)).scale(sx, sy, sz).translate(x, y, z);
}

// A soft body from overlapping stretched spheres, each [x, y, z, sx, sy, sz].
// An otter's body is two; a head with ears is three.
export function blob(parts, detail = 16) {
  return merge(parts.map((p) => ellipsoid(...p, detail)));
}

// A profile of [radius, height] points spun round the vertical axis.
export function turned(profile, segments = 40) {
  return new THREE.LatheGeometry(
    profile.map(([r, y]) => new THREE.Vector2(r, y)),
    segments,
  );
}

// A flat outline of [x, z] points, lying on the ground, given `depth` downwards
// from y = 0 and a softened top edge.
export function slab(outline, { depth = 1, bevel = 0.3 } = {}) {
  const shape = new THREE.Shape();
  outline.forEach(([x, z], i) => (i ? shape.lineTo(x, z) : shape.moveTo(x, z)));
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelSegments: 2,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel * 0.8,
    curveSegments: 24,
  });
  g.rotateX(Math.PI / 2);
  return g;
}

// An organic outline for `slab`: a wobbly ellipse of half-sizes rx, rz.
export function shoreline(rx, rz, { points = 80, wobble = 0.035 } = {}) {
  return Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2,
      r = 1 + wobble * 0.7 * Math.sin(a * 9) + wobble * Math.sin(a * 5);
    return [Math.cos(a) * rx * r, Math.sin(a) * rz * r];
  });
}

// A thin strip following `points` (THREE.Vector3). `width(t)` gives its half
// width from t = 0 at the start to 1 at the tip; `across` is the direction the
// strip is wide in. Draw it with a double-sided material.
export function ribbon(points, { width = (t) => 0.1 * Math.sin(Math.PI * t), across } = {}) {
  const curve = new THREE.CatmullRomCurve3(points),
    steps = Math.max(8, points.length * 4),
    vertices = [],
    index = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps,
      p = curve.getPoint(t),
      tangent = curve.getTangent(t),
      side = (across ?? new THREE.Vector3(0, 0, 1)).clone().cross(tangent).normalize();
    if (side.lengthSq() < 0.5) side.set(1, 0, 0);
    const w = typeof width === 'function' ? width(t) : width;
    for (const sign of [-1, 1]) vertices.push(...p.clone().addScaledVector(side, w * sign).toArray());
    if (i < steps) index.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

// A round stem through `points` (THREE.Vector3).
export function tube(points, radius = 0.05, sides = 6) {
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), points.length * 5, radius, sides, false);
}

// A block with softened edges, standing on y = 0.
export function box(width, height, depth, round = 0.06) {
  const b = Math.min(round, width / 2, height / 2, depth / 2) / 2,
    shape = new THREE.Shape(),
    w = width / 2 - 2 * b,
    h = height / 2 - 2 * b;
  shape.absarc(w, h, b, 0, Math.PI / 2);
  shape.absarc(-w, h, b, Math.PI / 2, Math.PI);
  shape.absarc(-w, -h, b, Math.PI, Math.PI * 1.5);
  shape.absarc(w, -h, b, Math.PI * 1.5, Math.PI * 2);
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * b,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: b,
    bevelThickness: b,
    curveSegments: 4,
  });
  g.translate(0, height / 2, -(depth - 2 * b) / 2);
  return g;
}
