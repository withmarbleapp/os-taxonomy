// Light that looks like light: glowing beams and continuous colour, drawn by
// adding brightness to what is behind them. Use on a dark or mid-toned
// backdrop; against a pale sky they wash out, and a plain `ray` reads better.
//
// Colours of the spectrum added together make white, so a bundle of
// `spectrum` beams lying on top of each other is a white beam, and it comes
// apart into colours wherever the beams separate. That is the physics, so
// build dispersion that way and it will look right at every stage.
import { THREE, unlined } from './stage.mjs';

const material = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  fog: false,
  side: THREE.DoubleSide,
  blending: THREE.AdditiveBlending,
  vertexShader: `attribute vec4 tint; attribute float edge; varying vec4 vTint; varying float vEdge;
    void main(){ vTint = tint; vEdge = edge; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying vec4 vTint; varying float vEdge;
    void main(){ gl_FragColor = vec4(vTint.rgb, vTint.a * exp(-vEdge * vEdge * 3.5)); }`,
});

// Collects glowing shapes into one mesh. `line` is a soft-edged beam between
// two points; `sheet` fills the space between two beams, for a fan of colour.
// Colours are THREE.Color; `strength` 1 is full brightness at the centre line.
export function light() {
  const position = [],
    tint = [],
    edge = [],
    push = (p, c, a, e) => {
      position.push(p.x, p.y, p.z);
      tint.push(c.r, c.g, c.b, a);
      edge.push(e);
    },
    quad = (p0, p1, p2, p3, c0, c1, a0, a1, e0, e1) => {
      // p0-p1 is one long side, p3-p2 the other.
      push(p0, c0, a0, e0), push(p1, c0, a1, e0), push(p2, c1, a1, e1);
      push(p0, c0, a0, e0), push(p2, c1, a1, e1), push(p3, c1, a0, e1);
    };
  const api = {
    // `fade` lets a beam dim towards its far end: strength there, from 0 to 1.
    line(a, b, { colour, width = 0.06, strength = 1, fade = 1, facing = new THREE.Vector3(0, 0, 1) } = {}) {
      const along = b.clone().sub(a);
      if (along.lengthSq() < 1e-8) return api;
      const side = along.clone().cross(facing).normalize().multiplyScalar(width);
      quad(a.clone().add(side), b.clone().add(side), b.clone().sub(side), a.clone().sub(side), colour, colour, strength, strength * fade, 1.6, -1.6);
      return api;
    },
    // A path of several points as joined lines.
    path(points, options) {
      for (let i = 1; i < points.length; i++) api.line(points[i - 1], points[i], options);
      return api;
    },
    // The area between beam a0→a1 and beam b0→b1, shading from one colour to
    // the other, `strength` at the start and `fade` times that at the far end.
    sheet(a0, a1, b0, b1, colourA, colourB, { strength = 1, fade = 0 } = {}) {
      quad(a0, a1, b1, b0, colourA, colourB, strength, strength * fade, 0, 0);
      return api;
    },
    build() {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
      geometry.setAttribute('tint', new THREE.Float32BufferAttribute(tint, 4));
      geometry.setAttribute('edge', new THREE.Float32BufferAttribute(edge, 1));
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = 6;
      return unlined(mesh);
    },
  };
  return api;
}

const ANCHORS = ['#ff1f14', '#ff7a12', '#ffd91a', '#58e03c', '#1fd6c9', '#2f7bff', '#7a3dff', '#a02cf0'].map((c) => new THREE.Color(c));
// The colour of light at `t`, from 0 (red) through orange, yellow, green and
// blue to 1 (violet).
export function spectrumColour(t) {
  const x = Math.max(0, Math.min(1, t)) * (ANCHORS.length - 1),
    i = Math.min(ANCHORS.length - 2, Math.floor(x));
  return ANCHORS[i].clone().lerp(ANCHORS[i + 1], x - i);
}
// `count` colours across the spectrum, balanced so that all of them added
// together make white of brightness `total`.
export function spectrum(count = 24, total = 1) {
  const colours = Array.from({ length: count }, (_, i) => spectrumColour(i / (count - 1))),
    sum = colours.reduce((s, c) => s.add(c), new THREE.Color(0, 0, 0));
  return colours.map((c) => new THREE.Color((c.r / sum.r) * total, (c.g / sum.g) * total, (c.b / sum.b) * total));
}
export const WHITE_LIGHT = new THREE.Color(1, 0.98, 0.9);
