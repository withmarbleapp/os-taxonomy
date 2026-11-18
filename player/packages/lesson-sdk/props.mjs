// Ready-made objects in Marble's look, for any lesson scene.
//
//   import { createStage } from '/sdk/stage.mjs';
//   import { countryside, character } from '/sdk/props.mjs';
//   const stage = createStage(canvas);
//   stage.scene.add(countryside(), character('mia', { at: [0, 0, -3] }));
//
// Every function returns a THREE.Group standing on y = 0 at the origin (or at
// `at`), sized in metres-ish units where a child is about 1.5 tall. Scale and
// move the group freely. Colours default to the shared palette. Anything a
// lesson needs that is not here is built with `toon`, `flat` and `solid` from
// the stage, in the same way these are.
import { THREE, toon, flat, solid, unlined, PALETTE } from './stage.mjs';

// Repeatable variety: the same seed always gives the same object.
function random(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 4294967296);
}
const placed = (group, at) => {
  if (at) group.position.set(at[0], at[1], at[2]);
  return group;
};

// --- Sky --------------------------------------------------------------------

// A soft cloud: shaded, no outline, no shadow. `parts` are [x, y, z, radius];
// leave them out for a small puffy cloud. Change `group.userData.material.color`
// to darken it for rain.
export function cloud({ at, parts, colour = PALETTE.cloud, size = 1 } = {}) {
  const g = new THREE.Group(),
    mat = toon(colour);
  for (const [x, y, z, r] of parts ?? [
    [-1.6, 0, 0, 1.5],
    [0, 0.5, 0, 1.9],
    [1.7, 0, 0, 1.5],
    [0.4, -0.3, 0.8, 1.4],
  ]) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat);
    m.position.set(x, y, z);
    m.scale.y = 0.72;
    g.add(m);
  }
  unlined(g);
  g.userData.material = mat;
  g.scale.setScalar(size);
  return placed(g, at);
}

// The Sun as someone on the ground sees it: a small bright disc in a soft
// glow. Place it far off in its true direction and show it only to a camera
// that could really see it, such as a character's own view. In a view from
// above the Sun is off the picture: use `stage.edgePoint` and the page's
// `.sun-marker` to show where the light comes from, with `ray`s arriving from
// that side and the cast shadows doing the rest.
export function sun({ at, radius = 1.6 } = {}) {
  const g = new THREE.Group();
  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 9, radius * 9),
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: false,
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `varying vec2 vUv; void main(){ float r = length(vUv - 0.5) * 9.0;
        float a = 0.55 * exp(-max(r - 1.0, 0.0) * 1.7) + 0.16 * exp(-max(r - 1.0, 0.0) * 0.55);
        gl_FragColor = vec4(vec3(1.0, 0.94, 0.66), a * (1.0 - smoothstep(3.6, 4.5, r))); }`,
    }),
  );
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 48), flat('#fffbe6', { fog: false }));
  disc.position.z = 0.02;
  g.add(glow, disc);
  g.userData.faceCamera = true;
  return placed(unlined(g), at);
}

// --- Teaching marks ---------------------------------------------------------

// A straight line of light or a pointer from `a` to `b` (THREE.Vector3). Flat
// colour, no outline or shadow, so it reads as drawn onto the scene. With
// `head`, it ends in an arrowhead at `b`.
export function ray(a, b, { colour = '#ffcf33', radius = 0.09, opacity = 1, head = false } = {}) {
  const g = new THREE.Group(),
    d = b.clone().sub(a),
    length = d.length();
  if (length < 1e-3) return g;
  const up = new THREE.Vector3(0, 1, 0),
    mat = flat(colour, { transparent: opacity < 1, opacity });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 8), mat);
  shaft.position.copy(a).addScaledVector(d, 0.5);
  shaft.quaternion.setFromUnitVectors(up, d.clone().normalize());
  g.add(shaft);
  if (head) {
    const tip = new THREE.Mesh(new THREE.ConeGeometry(radius * 3.2, radius * 9, 12), mat);
    tip.position.copy(b);
    tip.quaternion.copy(shaft.quaternion);
    g.add(tip);
  }
  return unlined(g);
}

// A chunky outlined arrow lying along +x from the origin: a handle or a
// direction marker that belongs to the scene, unlike a `ray`.
export function arrow({ at, length = 3.5, colour = '#f2b53a' } = {}) {
  const g = new THREE.Group(),
    mat = flat(colour);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 20), mat);
  head.rotation.z = -Math.PI / 2;
  head.position.x = length - 0.55;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, length - 1.1, 12), mat);
  shaft.rotation.z = -Math.PI / 2;
  shaft.position.x = (length - 1.1) / 2;
  g.add(head, shaft);
  return placed(g, at);
}

// Removes a group's objects and frees what they hold. For marks rebuilt often.
export function clear(group) {
  for (const child of [...group.children]) {
    child.traverse((o) => {
      o.geometry?.dispose();
      o.material?.dispose();
    });
    group.remove(child);
  }
}
export * from './props-light.mjs';
export * from './props-people.mjs';
export * from './props-land.mjs';
export * from './props-sea.mjs';
export * from './props-space.mjs';
export * from './props-maths.mjs';
