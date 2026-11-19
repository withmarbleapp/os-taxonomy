// Open country, from the Moon lesson's ground scene: rolling meadow with real
// grass, four kinds of tree, a paved plaza and lane, a village, mountains and
// inked clouds. Use with the 'daylight' setting. Sizes are in metres: a person
// is about 1.5 tall and an oak about 8.
//
// `countryside()` is the whole scene in one call. The pieces are exported too,
// for a lesson that wants its own arrangement.
import { THREE, toon, flat, solid, unlined, PALETTE } from './stage.mjs';
import { merge, turned } from './shapes.mjs';

const placed = (group, at) => {
  if (at) group.position.set(at[0], at[1], at[2]);
  return group;
};
function random(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 4294967296);
}

// Collects shapes by colour and turns each colour into one mesh, so a village
// or a wood costs a handful of draws.
function batch() {
  const lists = new Map(),
    m = new THREE.Matrix4(),
    q = new THREE.Quaternion(),
    e = new THREE.Euler();
  return {
    // geometry, colour, position, scale, rotation
    add(geometry, colour, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1, rx = 0, ry = 0, rz = 0) {
      m.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, rz)), new THREE.Vector3(sx, sy, sz));
      if (!lists.has(colour)) lists.set(colour, []);
      lists.get(colour).push(geometry.clone().applyMatrix4(m));
    },
    build(parent, { shadow = true } = {}) {
      for (const [colour, parts] of lists) {
        const mesh = solid(merge(parts), toon(colour, { side: THREE.DoubleSide }), parent);
        mesh.castShadow = shadow;
      }
      lists.clear();
      return parent;
    },
  };
}

const cube = new THREE.BoxGeometry(1, 1, 1),
  stoneShape = new THREE.IcosahedronGeometry(1, 1),
  cone = new THREE.ConeGeometry(1, 1, 7),
  limb = new THREE.CylinderGeometry(0.65, 1, 1, 7),
  crown = new THREE.IcosahedronGeometry(1, 2);
{
  // Slightly lumpy, so a canopy is not a ball.
  const p = crown.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i),
      r = 1 + 0.06 * Math.sin(x * 23 + y * 12) + 0.045 * Math.sin(z * 26 - x * 18);
    p.setXYZ(i, x * r, y * r, z * r);
  }
  crown.computeVertexNormals();
}

// The lie of the land: level within `flat` of the centre, then low swells.
export function terrain({ flat: level = 10 } = {}) {
  return (x, z) => {
    const fade = THREE.MathUtils.smoothstep(Math.hypot(x, z), level, level + 65);
    return fade * (2.2 + 2.0 * Math.sin(x * 0.022 + z * 0.009) + 1.6 * Math.sin(z * 0.026 - x * 0.005));
  };
}
const level = () => 0;

// Grassland to the horizon. `heightAt` comes from `terrain()`; leave it out for
// flat ground. With `hills`, low green ridges ring the distance.
export function meadow({ heightAt = level, colour = PALETTE.grass, hills = true, seed = 3 } = {}) {
  const g = new THREE.Group(),
    rand = random(seed),
    geometry = new THREE.PlaneGeometry(1200, 1200, 200, 200).rotateX(-Math.PI / 2),
    p = geometry.attributes.position,
    tint = [];
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getZ(i);
    p.setY(i, heightAt(x, z));
    // Broad lighter and darker fields.
    const field = Math.sin(x * 0.035 + Math.sin(z * 0.032) * 1.8) + Math.sin(z * 0.041),
      k = field > 0.65 ? 1.08 : field < -0.7 ? 0.91 : 1;
    tint.push(k, k, k);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(tint, 3));
  geometry.computeVertexNormals();
  const land = solid(geometry, toon(colour, { vertexColors: true }), g);
  land.castShadow = false;
  const far = solid(new THREE.PlaneGeometry(18000, 18000).rotateX(-Math.PI / 2), toon(colour), g);
  far.position.y = -0.2;
  far.castShadow = false;
  if (hills) {
    const ridge = new THREE.SphereGeometry(1, 32, 12),
      b = batch();
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2,
        r = 480 + rand() * 140,
        h = 16 + rand() * 25;
      b.add(ridge, i % 2 ? PALETTE.hill : PALETTE.grassDark, Math.sin(a) * r, -h * 0.22, Math.cos(a) * r, 160, h, 110, 0, a, 0);
    }
    b.build(g, { shadow: false });
  }
  g.userData.heightAt = heightAt;
  return g;
}

// Far peaks, some with snow: the last layer before the sky.
export function mountains({ from = 0.45, count = 8, seed = 11 } = {}) {
  const g = new THREE.Group(),
    rand = random(seed),
    b = batch();
  const peak = (x, z, h, r, colour, snow) => {
    const n = 9,
      v = [],
      index = [],
      sx = (rand() - 0.5) * r * 0.6,
      sz = (rand() - 0.5) * r * 0.35;
    for (let ring = 0; ring < 2; ring++)
      for (let j = 0; j < n; j++) {
        const a = (j / n) * Math.PI * 2,
          k = 0.78 + rand() * 0.43;
        v.push(x + Math.sin(a) * r * k * (ring ? 0.48 : 1), ring ? h * (0.32 + rand() * 0.2) : -0.5, z + Math.cos(a) * r * k * (ring ? 0.44 : 0.8));
      }
    v.push(x + sx, h, z + sz);
    for (let j = 0; j < n; j++) {
      const k = (j + 1) % n;
      index.push(j, k, n + j, k, n + k, n + j, n + j, n + k, n * 2);
    }
    const body = new THREE.BufferGeometry();
    body.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    body.setIndex(index);
    body.computeVertexNormals();
    b.add(body, colour);
    if (!snow) return;
    const top = [x + sx, h + 0.1, z + sz],
      tri = [];
    for (let j = 0; j < n; j++) {
      const k = (n + j) * 3,
        t = 0.24 + rand() * 0.15;
      top.push((x + sx) * (1 - t) + v[k] * t, h * (1 - t) + v[k + 1] * t + 0.25, (z + sz) * (1 - t) + v[k + 2] * t);
    }
    for (let j = 0; j < n; j++) tri.push(0, j + 1, ((j + 1) % n) + 1);
    const cap = new THREE.BufferGeometry();
    cap.setAttribute('position', new THREE.Float32BufferAttribute(top, 3));
    cap.setIndex(tri);
    cap.computeVertexNormals();
    b.add(cap, PALETTE.snow);
  };
  for (let i = 0; i < count; i++) {
    const a = from + i * 0.22,
      r = 1450 + rand() * 200;
    peak(Math.sin(a) * r, Math.cos(a) * r, 140 + rand() * 155, 210 + rand() * 100, PALETTE.mountain, i % 3 === 0);
  }
  for (let i = 0; i < count - 1; i++) {
    const a = from + 0.17 + i * 0.22,
      r = 850 + rand() * 240;
    peak(Math.sin(a) * r, Math.cos(a) * r, 60 + rand() * 85, 160 + rand() * 120, i % 2 ? PALETTE.mountainNear : '#78978b', i === 3);
  }
  return b.build(g, { shadow: false });
}

function addTree(b, rand, x, y, z, h, kind) {
  const up = new THREE.Vector3(0, 1, 0);
  const branch = (ax, ay, az, bx, by, bz, r, colour) => {
    const a = new THREE.Vector3(ax, ay, az),
      d = new THREE.Vector3(bx, by, bz).sub(a),
      g = limb.clone().scale(r, d.length(), r);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, d.clone().normalize()));
    g.translate(ax + d.x / 2, ay + d.y / 2, az + d.z / 2);
    b.add(g, colour);
  };
  const bark = kind === 'birch' ? PALETTE.birch : PALETTE.trunk;
  branch(x, y, z, x + 0.1 * h, y + h * 0.68, z, h * 0.036, bark);
  if (kind === 'fir') {
    for (let j = 0; j < 4; j++) {
      const k = j / 4;
      b.add(cone, j % 2 ? PALETTE.pineLight : PALETTE.pine, x, y + h * (0.37 + k * 0.67), z, h * (0.3 - k * 0.22), h * (0.47 - k * 0.2), h * (0.29 - k * 0.2), 0, j * 0.55, 0);
    }
  } else if (kind === 'birch') {
    for (let j = 0; j < 7; j++) {
      const a = j * 2.4,
        cy = y + h * (0.5 + j * 0.065),
        cx = x + Math.sin(a) * h * 0.15,
        cz = z + Math.cos(a) * h * 0.12;
      branch(x, cy - h * 0.14, z, cx, cy, cz, h * 0.012, bark);
      b.add(crown, j % 2 ? PALETTE.leafLight : '#8ead54', cx, cy + h * 0.13, cz, h * 0.18, h * 0.22, h * 0.15, 0, a, 0);
    }
  } else if (kind === 'willow') {
    for (let j = 0; j < 9; j++) {
      const a = j * 2.4,
        cx = x + Math.sin(a) * h * 0.27,
        cz = z + Math.cos(a) * h * 0.25;
      branch(x, y + h * 0.4, z, cx, y + h * 0.67, cz, h * 0.016, bark);
      b.add(crown, j % 2 ? PALETTE.willow : '#779749', cx, y + h * 0.65, cz, h * 0.17, h * (0.28 + rand() * 0.13), h * 0.16, 0, a, 0.13 * Math.sin(a));
    }
  } else {
    for (let j = 0; j < 8; j++) {
      const a = j * 2.4,
        cx = x + Math.sin(a) * h * 0.25,
        cz = z + Math.cos(a) * h * 0.23,
        cy = y + h * (0.67 + rand() * 0.21);
      branch(x, y + h * 0.4, z, cx, cy - h * 0.1, cz, h * 0.022, bark);
      b.add(crown, j % 3 === 0 ? PALETTE.leafLight : PALETTE.leaf, cx, cy, cz, h * 0.25, h * 0.21, h * 0.24, 0, a, 0.18);
    }
  }
}
export const TREES = ['oak', 'fir', 'birch', 'willow'];

// One tree: 'oak' (spreading, the default), 'fir', 'birch' or 'willow'.
export function tree({ at, height = 8, kind = 'oak', seed = 1 } = {}) {
  const b = batch();
  addTree(b, random(seed), 0, 0, 0, height, kind);
  return placed(b.build(new THREE.Group()), at);
}

// Trees of mixed kinds in a ring between two distances from the centre,
// leaving the middle clear. `keep(x, z)` can refuse a spot.
export function scatter({ trees = 40, from = 30, to = 280, heightAt = level, keep = () => true, seed = 7 } = {}) {
  const b = batch(),
    rand = random(seed);
  for (let i = 0; i < trees; i++) {
    const a = rand() * Math.PI * 2,
      r = from + rand() * (to - from),
      x = Math.sin(a) * r,
      z = Math.cos(a) * r,
      h = 5 + rand() * 9;
    if (keep(x, z)) addTree(b, rand, x, heightAt(x, z), z, h, TREES[i % 4]);
  }
  return b.build(new THREE.Group());
}

// A low leafy shrub and a field stone, for the middle distance.
export function bush({ at, size = 1, colour = PALETTE.leafDark } = {}) {
  const b = batch();
  b.add(crown, colour, 0, 0.45 * size, 0, 0.8 * size, 0.6 * size, 0.75 * size);
  b.add(crown, PALETTE.leaf, 0.45 * size, 0.35 * size, 0.2 * size, 0.5 * size, 0.42 * size, 0.5 * size);
  return placed(b.build(new THREE.Group()), at);
}
export function rock({ at, size = 1, colour = PALETTE.stone, seed = 1 } = {}) {
  const b = batch();
  b.add(stoneShape, colour, 0, 0.2 * size, 0, 0.6 * size, 0.38 * size, 0.5 * size, 0, random(seed)() * 6, 0);
  return placed(b.build(new THREE.Group()), at);
}

// Real grass: thousands of small tufts within `radius`, swaying a little. Call
// `group.userData.tick(seconds)` each frame for the sway. `keep(x, z)` leaves
// paths and paving bare.
export function grass({ radius = 110, count = 22000, heightAt = level, keep = () => true, seed = 19 } = {}) {
  const rand = random(seed),
    positions = [],
    uvs = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2,
      r = 2 + Math.pow(rand(), 0.75) * radius,
      x = Math.sin(a) * r,
      z = Math.cos(a) * r,
      h = 0.16 + rand() * 0.29,
      w = (0.43 + rand() * 0.28) / 2,
      turn = rand() * Math.PI;
    if (!keep(x, z)) continue;
    const y = heightAt(x, z) + 0.025,
      dx = Math.cos(turn) * w,
      dz = Math.sin(turn) * w;
    positions.push(x - dx, y, z - dz, x + dx, y, z + dz, x + dx, y + h, z + dz, x - dx, y, z - dz, x + dx, y + h, z + dz, x - dx, y + h, z - dz);
    uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  const material = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, light: { value: new THREE.Color(1, 1, 1) } },
    side: THREE.DoubleSide,
    vertexShader: `uniform float time; varying vec2 vUv; varying vec3 vWorld;
      void main(){ vUv = uv; vec3 p = position;
        p.x += sin(time * 1.25 + position.x * 0.45 + position.z * 0.31) * 0.045 * uv.y;
        vec4 w = modelMatrix * vec4(p, 1.0); vWorld = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform vec3 light; varying vec2 vUv; varying vec3 vWorld;
      float blade(vec2 p, float root, float lean, float height, float width){
        float y = p.y / height; float centre = root + lean * y * y;
        return max(abs(p.x - centre) - width * (1.0 - y), max(-y, y - 1.0)); }
      void main(){
        float d = min(blade(vUv, 0.22, -0.18, 0.69, 0.05), min(blade(vUv, 0.44, 0.09, 0.98, 0.052),
          min(blade(vUv, 0.64, 0.19, 0.8, 0.058), blade(vUv, 0.79, 0.14, 0.50, 0.05))));
        if (d > 0.0) discard;
        vec3 col = mix(vec3(0.19, 0.34, 0.17), vec3(0.57, 0.71, 0.29), vUv.y);
        col *= 0.94 + sin(vWorld.x * 2.1 + vWorld.z * 1.3) * 0.08;
        if (d > -0.008) col = mix(vec3(0.10, 0.18, 0.08), col, smoothstep(15.0, 75.0, length(vWorld.xz)) * 0.7);
        gl_FragColor = vec4(pow(col, vec3(2.2)) * light, 1.0); }`,
  });
  const g = new THREE.Group().add(new THREE.Mesh(geometry, material));
  g.userData.tick = (seconds) => (material.uniforms.time.value = seconds);
  // The blades draw their own colour, so they do not follow the stage's light.
  // `light` (a THREE.Color, white by default) dims and tints them, for dusk or night.
  g.userData.light = material.uniforms.light.value;
  return unlined(g);
}

// Buttercups, daisies and small stones scattered between two distances.
export function flowers({ count = 120, from = 3, to = 40, heightAt = level, keep = () => true, seed = 23 } = {}) {
  const b = batch(),
    rand = random(seed);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2,
      r = from + rand() * (to - from),
      x = Math.sin(a) * r,
      z = Math.cos(a) * r;
    if (!keep(x, z)) continue;
    const y = heightAt(x, z);
    if (i % 6 === 0) b.add(stoneShape, '#c2bd95', x, y + 0.1, z, 0.2 + rand() * 0.25, 0.16, 0.25, 0, rand() * 6, 0);
    else {
      const h = 0.2 + rand() * 0.2,
        petal = i % 3 ? '#f0d76b' : i % 5 ? '#eee7c6' : '#c8b6d4';
      b.add(limb, '#577e3c', x, y + h / 2, z, 0.012, h, 0.012);
      for (let k = 0; k < 5; k++) {
        const t = (k / 5) * Math.PI * 2;
        b.add(stoneShape, petal, x + Math.sin(t) * 0.052, y + h, z + Math.cos(t) * 0.052, 0.055, 0.025, 0.055);
      }
      b.add(stoneShape, '#a57c32', x, y + h + 0.015, z, 0.028, 0.025, 0.028);
    }
  }
  return b.build(new THREE.Group(), { shadow: false });
}

let pavingTexture;
function paving() {
  if (pavingTexture) return pavingTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d'),
    rand = random(5),
    columns = 4,
    rows = 8,
    w = c.width / columns,
    h = c.height / rows;
  g.fillStyle = '#303d3b';
  g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < rows; row++)
    for (let column = -1; column <= columns; column++) {
      const x = (column + (row % 2) * 0.5) * w,
        y = row * h,
        k = 0.85 + rand() * 0.24;
      g.fillStyle = `rgb(${185 * k}, ${185 * k}, ${167 * k})`;
      g.fillRect(x + 3, y + 3, w - 6, h - 6);
      g.fillStyle = 'rgba(255,255,255,0.14)';
      g.fillRect(x + 3, y + 3, w - 6, 5);
      g.fillStyle = 'rgba(0,0,0,0.16)';
      g.fillRect(x + 3, y + h - 9, w - 6, 6);
    }
  pavingTexture = new THREE.CanvasTexture(c);
  pavingTexture.colorSpace = THREE.SRGBColorSpace;
  pavingTexture.wrapS = pavingTexture.wrapT = THREE.RepeatWrapping;
  pavingTexture.anisotropy = 8;
  return pavingTexture;
}
const paved = () => toon('#ffffff', { map: paving() });
const tile = (x, z) => [x / 2.64, z / 5.76];

// A round paved place with a kerb, lying on the ground at `at`.
export function plaza({ at = [0, 0, 0], radius = 9, heightAt = level } = {}) {
  const g = new THREE.Group(),
    geometry = new THREE.RingGeometry(0, radius, 80, 12).rotateX(-Math.PI / 2).translate(at[0], 0, at[2]),
    p = geometry.attributes.position,
    uv = geometry.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getZ(i);
    p.setY(i, heightAt(x, z) + 0.065);
    uv.setXY(i, ...tile(x, z));
  }
  geometry.computeVertexNormals();
  solid(geometry, paved(), g).castShadow = false;
  const b = batch();
  for (let i = 0; i < 80; i++) {
    const a = (i / 80) * Math.PI * 2,
      x = at[0] + Math.sin(a) * radius,
      z = at[2] + Math.cos(a) * radius;
    b.add(cube, '#c9c7ad', x, heightAt(x, z) + 0.12, z, 0.25, 0.2, 0.66, 0, a + Math.PI / 2, 0);
  }
  return b.build(g);
}

// A paved lane following `centre(z)` (its x at each z) from z = `from` away to
// z = `to`, with kerbstones.
export function lane({ centre = () => 0, from = -13, to = -400, width = 3.3, heightAt = level, keep = () => true } = {}) {
  const g = new THREE.Group(),
    positions = [],
    uvs = [],
    index = [],
    steps = Math.round(Math.abs(to - from) / 1.1);
  for (let i = 0; i <= steps; i++) {
    const z = from - i * 1.1,
      x = centre(z);
    for (const side of [-1, 1]) {
      const px = x + (side * width) / 2;
      positions.push(px, heightAt(px, z) + 0.045, z);
      uvs.push(side === -1 ? 0 : width / 2.64, z / 5.76);
    }
    if (i) index.push(i * 2 - 2, i * 2 - 1, i * 2, i * 2, i * 2 - 1, i * 2 + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  solid(geometry, paved(), g).castShadow = false;
  const b = batch();
  for (let z = from; z > Math.max(to, from - 110); z -= 1.2)
    for (const side of [-1, 1]) {
      const x = centre(z) + side * (width / 2 + 0.13);
      if (keep(x, z)) b.add(cube, '#c9c7ad', x, heightAt(x, z) + 0.1, z, 0.22, 0.19, 1.12);
    }
  return b.build(g);
}

// A limestone fountain: a wide basin, a column and a small upper bowl, with
// four arcs of water. `radius` is the basin's outer rim.
export function fountain({ at, radius = 1.7 } = {}) {
  const g = new THREE.Group(),
    b = batch(),
    k = radius / 1.7;
  b.add(new THREE.CylinderGeometry(1.85, 1.94, 0.17, 12), '#aaa78f', 0, 0.085, 0);
  b.add(turned([[0, 0.15], [1.34, 0.15], [1.34, 0.49], [1.43, 0.62], [1.64, 0.62], [1.7, 0.52], [1.7, 0.2], [1.8, 0.17], [0, 0.17]], 24), PALETTE.stoneLight);
  b.add(new THREE.TorusGeometry(1.54, 0.115, 6, 24), '#e1d9bc', 0, 0.61, 0, 1, 1, 1, Math.PI / 2);
  b.add(new THREE.CylinderGeometry(0.28, 0.43, 0.95, 10), '#bdb698', 0, 0.78, 0);
  b.add(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 12), '#e1d9bc', 0, 1.24, 0);
  b.add(turned([[0, 1.22], [0.25, 1.22], [0.69, 1.5], [0.73, 1.64], [0.62, 1.67], [0.57, 1.54], [0.2, 1.38], [0, 1.38]], 24), PALETTE.stoneLight);
  b.add(new THREE.CylinderGeometry(0.11, 0.18, 0.36, 10), '#bdb698', 0, 1.62, 0);
  b.build(g);
  const water = toon('#70b9ae');
  for (const [r, y] of [[1.33, 0.54], [0.57, 1.6]]) {
    const pool = solid(new THREE.CircleGeometry(r, 48).rotateX(-Math.PI / 2), water, g);
    pool.position.y = y;
    pool.castShadow = false;
  }
  const arcs = new THREE.Group(),
    spray = flat('#b5e7de');
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.3,
      dx = Math.sin(a),
      dz = Math.cos(a),
      path = [[0.1, 1.8], [0.27, 2.1], [0.48, 1.99], [0.61, 1.67], [0.86, 1.32], [1.1, 0.55]].map(([r, y]) => new THREE.Vector3(dx * r, y, dz * r));
    arcs.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path), 32, 0.027, 6, false), spray));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 4, 20).rotateX(Math.PI / 2), flat('#d5f0df'));
    ring.position.set(dx * 1.1, 0.555, dz * 1.1);
    arcs.add(ring);
  }
  g.add(unlined(arcs));
  g.userData.water = arcs; // hide to turn the fountain off
  g.scale.setScalar(k);
  return placed(g, at);
}

function addHouse(b, x, y, z, w, d, h, roof) {
  b.add(cube, PALETTE.wall, x, y + h * 0.5, z, w, h, d);
  const gable = new THREE.BufferGeometry();
  gable.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([-w * 0.58, 0, -d * 0.58, w * 0.58, 0, -d * 0.58, 0, h * 0.65, -d * 0.58, -w * 0.58, 0, d * 0.58, w * 0.58, 0, d * 0.58, 0, h * 0.65, d * 0.58], 3),
  );
  gable.setIndex([0, 2, 1, 3, 4, 5, 0, 3, 5, 0, 5, 2, 2, 5, 4, 2, 4, 1]);
  gable.computeVertexNormals();
  b.add(gable, roof, x, y + h, z);
  b.add(cube, '#c6b59a', x + w * 0.23, y + h * 1.42, z - d * 0.2, 0.65, h * 0.62, 0.7);
  for (const side of [-1, 1]) {
    b.add(cube, '#354f4c', x + side * w * 0.27, y + h * 0.6, z + d * 0.505, w * 0.17, h * 0.23, 0.06);
    for (const edge of [-1, 1]) b.add(cube, '#60827a', x + side * w * 0.27 + edge * w * 0.105, y + h * 0.6, z + d * 0.52, w * 0.055, h * 0.27, 0.08);
  }
  b.add(cube, '#67533d', x, y + h * 0.24, z + d * 0.51, w * 0.16, h * 0.48, 0.09);
}

// A cottage with a pitched roof, chimney, door and shuttered windows; its
// front faces +z.
export function house({ at, width = 9, depth = 10, height = 7, roof = PALETTE.roof } = {}) {
  const b = batch();
  addHouse(b, 0, 0, 0, width, depth, height, roof);
  return placed(b.build(new THREE.Group()), at);
}

// A cluster of cottages round a tall church with a clock, centred on `at`.
export function village({ at = [0, 0, -250], houses = 17, heightAt = level, seed = 41 } = {}) {
  const b = batch(),
    rand = random(seed),
    roofs = ['#bb6744', '#8b725e', '#bc9254'];
  for (let i = 0; i < houses; i++) {
    const x = at[0] - 45 + (i % 6) * 17 + rand() * 5,
      z = at[2] + 20 - Math.floor(i / 6) * 30;
    addHouse(b, x, heightAt(x, z), z, 8 + rand() * 4, 9 + rand() * 4, 6 + rand() * 4, roofs[i % 3]);
  }
  const cx = at[0] - 13,
    cz = at[2] - 20,
    cy = heightAt(cx, cz);
  addHouse(b, cx, cy, cz, 9, 11, 18, PALETTE.roofSlate);
  b.add(new THREE.CylinderGeometry(1.25, 1.25, 0.12, 16), '#f3e6ba', cx, cy + 14, cz + 5.7, 1, 1, 1, Math.PI / 2);
  b.add(cube, '#394b42', cx, cy + 14.38, cz + 5.8, 0.12, 0.85, 0.1);
  b.add(cube, '#394b42', cx + 0.3, cy + 14, cz + 5.8, 0.65, 0.12, 0.1);
  return b.build(new THREE.Group());
}

// Clouds drawn on the sky: flat-bottomed, cream on top, with an inked edge.
// They are pictures far away, not objects, so they always face the viewer.
// `avoid` is a list of directions (THREE.Vector3) to keep clear, such as
// towards the Sun or Moon.
export function skyClouds({ count = 14, avoid = [], distance = 1350 } = {}) {
  const g = new THREE.Group(),
    taken = [];
  for (let i = 0; i < count; i++) {
    const w = 190 + (i % 4) * 60,
      spread = Math.atan((Math.hypot(w, w / 1.8) * 0.5) / distance);
    const material = new THREE.ShaderMaterial({
      uniforms: { variation: { value: i * 2.1 } },
      side: THREE.DoubleSide,
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv;
        vec4 centre = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); centre.xy += position.xy; gl_Position = projectionMatrix * centre; }`,
      fragmentShader: `uniform float variation; varying vec2 vUv;
        void main(){ vec2 p = vec2((vUv.x - 0.5) * 2.8, (vUv.y - 0.5) * 1.8); p.x += sin(p.y * 9.0 + variation) * 0.025;
          float d = length((p - vec2(-0.75, -0.03)) / vec2(0.45, 0.24)) - 1.0;
          d = min(d, length((p - vec2(-0.35, 0.13)) / vec2(0.45, 0.36)) - 1.0);
          d = min(d, length((p - vec2(0.09, 0.24)) / vec2(0.44, 0.46)) - 1.0);
          d = min(d, length((p - vec2(0.52, 0.06)) / vec2(0.40, 0.30)) - 1.0);
          d = min(d, length((p - vec2(0.86, -0.07)) / vec2(0.37, 0.20)) - 1.0);
          d = max(d, -p.y - 0.25); if (d > 0.0) discard;
          float belly = -0.08 + 0.035 * sin(p.x * 8.0 + variation);
          vec3 c = p.y < belly ? vec3(0.70, 0.82, 0.84) : vec3(1.0, 0.99, 0.91);
          if (p.y < belly + 0.055 && p.y > belly) c = vec3(0.84, 0.90, 0.88);
          if (d > -0.035) c = vec3(0.13, 0.23, 0.25);
          gl_FragColor = vec4(pow(c, vec3(2.2)), 1.0); }`,
    });
    const picture = new THREE.Mesh(new THREE.PlaneGeometry(w, w / (1.8 + (i % 3) * 0.2)), material);
    picture.frustumCulled = false;
    for (let j = 0; j < 64; j++) {
      const a = (i / count) * Math.PI * 2 + j * 0.29,
        up = ((12 + (i % 4) * 8) * Math.PI) / 180 + (j % 3) * 0.045,
        d = new THREE.Vector3(Math.sin(a) * Math.cos(up), Math.sin(up), -Math.cos(a) * Math.cos(up));
      if (avoid.every((v) => d.angleTo(v) > spread + 0.14) && taken.every((t) => d.angleTo(t.d) > spread + t.spread + 0.035)) {
        picture.position.copy(d).multiplyScalar(distance);
        taken.push({ d, spread });
        g.add(picture);
        break;
      }
    }
  }
  return unlined(g);
}

// The whole Moon-lesson countryside: you stand on the edge of a paved plaza
// with a fountain, a lane winds away past trees and a wall to a village, and
// mountains close the view. Returns a group with `userData.heightAt(x, z)` for
// placing your own things on the ground, and `userData.tick(seconds)`.
export function countryside({ village: town = true, peaks = true, avoid = [] } = {}) {
  const g = new THREE.Group(),
    heightAt = terrain(),
    rand = random(271),
    road = (z) => Math.sin((-z + 5) * 0.017) * 5 + Math.sin((-z + 5) * 0.005) * 11,
    square = { x: 0, z: -7, r: 9 },
    onPlaza = (x, z, margin = 0) => Math.hypot(x - square.x, z - square.z) < square.r + margin,
    onLane = (x, z) => z < -13 && z > -410 && Math.abs(x - road(z)) < 2.2,
    open = (x, z) => !onPlaza(x, z, 0.5) && !onLane(x, z);
  const fx = -1.35,
    fz = -10.5,
    turf = grass({ heightAt, keep: open }),
    clouds = skyClouds({ avoid });
  g.add(
    meadow({ heightAt }),
    plaza({ at: [square.x, 0, square.z], radius: square.r, heightAt }),
    lane({ centre: road, heightAt, keep: (x, z) => !onPlaza(x, z, 0.25) }),
    fountain({ at: [fx, heightAt(fx, fz) + 0.075, fz] }),
    turf,
    flowers({ heightAt, keep: open }),
    clouds,
  );
  const b = batch();
  for (const [x, z, h, kind] of [[-14, -31, 7.5, 'oak'], [-17, -43, 8.2, 'oak'], [20, -50, 10, 'birch'], [-31, -65, 10, 'willow'], [37, -75, 12, 'fir'], [-27, 40, 8, 'fir'], [26, 48, 9, 'oak'], [56, 8, 11, 'willow'], [-58, 10, 12, 'birch']])
    addTree(b, rand, x, heightAt(x, z), z, h, kind);
  for (let i = 0; i < 47; i++) {
    const a = rand() * Math.PI * 2,
      r = 95 + rand() * 200,
      x = Math.sin(a) * r,
      z = Math.cos(a) * r;
    if (z < 0 && Math.abs(x - road(z)) < 18) continue;
    addTree(b, rand, x, heightAt(x, z), z, 5 + rand() * 9, TREES[i % 4]);
  }
  for (let i = 0; i < 12; i++) {
    const x = -90 + i * 14,
      z = -185 - (i % 3) * 11;
    addTree(b, rand, x, heightAt(x, z), z, 4.3 + rand() * 1.4, 'oak');
  }
  // A low stone wall and a timber fence lead towards the village.
  for (let z = -65; z > -200; z -= 3.5) {
    const x = road(z) + 7;
    b.add(cube, '#b1ad91', x, heightAt(x, z) + 0.5, z, 0.65, 1, 3.35);
  }
  for (let z = -30; z > -110; z -= 6) {
    const x = road(z) - 6,
      y = heightAt(x, z);
    b.add(cube, PALETTE.wood, x, y + 0.65, z, 0.16, 1.3, 0.16);
    for (const dy of [0.4, 0.9]) b.add(cube, '#a48b5a', x, y + dy, z - 3, 0.12, 0.13, 6);
  }
  b.build(g);
  if (town) g.add(village({ at: [0, 0, -250], heightAt }));
  if (peaks) g.add(mountains());
  g.userData.heightAt = heightAt;
  g.userData.tick = turf.userData.tick;
  // For a scene that changes with the time of day: the grass (see `grass`) and
  // the sky's clouds, to dim or hide.
  g.userData.turf = turf;
  g.userData.clouds = clouds;
  return g;
}
