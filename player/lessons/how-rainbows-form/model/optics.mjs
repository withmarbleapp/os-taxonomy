// Exact geometry for the lesson. Two independent pieces:
//  1. one spherical water drop (refraction in, one internal reflection, refraction out);
//  2. where a primary rainbow lies for an observer, and whether she sees it.
// Angles are radians unless a name ends in Deg. Axes: x east, y up, z south.
// An azimuth a points along (cos a, 0, sin a).

export const DEG = Math.PI / 180;
export const BOW_ANGLE = 42 * DEG; // red edge of the primary bow, from the point opposite the Sun
export const SUN_ELEVATION = { low: 20 * DEG, mid: 35 * DEG, high: 55 * DEG };
export const EYE_HEIGHT = 2.2; // illustrative units; the explorer is drawn large
export const FOV = 100 * DEG; // the explorer's horizontal field of view
export const MAX_LOOK_UP = 55 * DEG;
export const WATER = {
  rain: { radius: 7, height: 10, ring: 12.5 },
  fountain: { radius: 3, height: 4.5, ring: 6.5 },
};
// Refractive index of water for three representative colours.
export const COLOURS = [
  { id: 'red', n: 1.331 },
  { id: 'green', n: 1.335 },
  { id: 'violet', n: 1.343 },
];

const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const norm2 = (a) => {
  const l = Math.hypot(a[0], a[1]);
  return [a[0] / l, a[1] / l];
};
// Snell's law for unit direction d meeting a surface with unit normal n that
// points against d; eta = n1 / n2.
function refract(d, n, eta) {
  const c = -dot(d, n),
    k = 1 - eta * eta * (1 - c * c);
  if (k < 0) return null;
  const f = eta * c - Math.sqrt(k);
  return norm2([eta * d[0] + f * n[0], eta * d[1] + f * n[1]]);
}
const reflect = (d, n) => {
  const c = dot(d, n);
  return [d[0] - 2 * c * n[0], d[1] - 2 * c * n[1]];
};

/**
 * One ray through a unit-radius drop centred on the origin. Sunlight travels
 * along +x and enters at height `beam` (0 = through the middle, 1 = grazing
 * the top). Returns the points where it enters, bounces and leaves, the
 * direction it leaves in, and `backAngleDeg`: the angle between the leaving
 * ray and the direction straight back towards the Sun.
 */
export function dropRay(beam, n) {
  const b = Math.max(0, Math.min(0.999, beam));
  const entry = [-Math.sqrt(1 - b * b), b];
  const inside = refract([1, 0], entry, 1 / n);
  // Next hit on the circle from `entry` along `inside`.
  const t1 = -2 * dot(entry, inside);
  const back = [entry[0] + t1 * inside[0], entry[1] + t1 * inside[1]];
  const bounced = reflect(inside, [-back[0], -back[1]]);
  const t2 = -2 * dot(back, bounced);
  const exit = [back[0] + t2 * bounced[0], back[1] + t2 * bounced[1]];
  const out = refract(bounced, [-exit[0], -exit[1]], n);
  // Light that is not reflected leaves through the back of the drop.
  const through = refract(inside, [-back[0], -back[1]], n);
  const backAngleDeg = Math.acos(Math.max(-1, Math.min(1, -out[0]))) / DEG;
  return { beam: b, entry, inside, back, bounced, exit, out, through, backAngleDeg };
}

/** The largest back angle for a colour: where its light piles up (the rainbow angle). */
export function rainbowAngleDeg(n) {
  let best = { angle: 0, beam: 0 };
  for (let b = 0; b <= 0.999; b += 0.0005) {
    const a = dropRay(b, n).backAngleDeg;
    if (a > best.angle) best = { angle: a, beam: b };
  }
  return best;
}

export const wrap = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
export const angleBetween = (a, b) => {
  const d = Math.abs(wrap(a) - wrap(b));
  return Math.min(d, 2 * Math.PI - d);
};

export function sunDirection(sunAz, sunHeight) {
  const e = SUN_ELEVATION[sunHeight];
  return [Math.cos(e) * Math.cos(sunAz), Math.sin(e), Math.cos(e) * Math.sin(sunAz)];
}
export function explorerPosition(spot, source) {
  const r = WATER[source].ring;
  return [r * Math.cos(spot), EYE_HEIGHT, r * Math.sin(spot)];
}

/**
 * Directions (from the eye) of the bow: every direction 42 degrees from the
 * point opposite the Sun. Sample i is at angle 360/count * i round that point,
 * starting from the top.
 */
export function bowDirections(sunAz, sunHeight, count = 90, angle = BOW_ANGLE) {
  const s = sunDirection(sunAz, sunHeight),
    a = [-s[0], -s[1], -s[2]];
  // v: perpendicular to the axis, in the vertical plane, pointing up.
  const e = SUN_ELEVATION[sunHeight];
  const v = [Math.sin(e) * -Math.cos(sunAz), Math.cos(e), Math.sin(e) * -Math.sin(sunAz)];
  // u: horizontal, perpendicular to both.
  const u = [-Math.sin(sunAz), 0, Math.cos(sunAz)];
  const out = [];
  for (let i = 0; i < count; i++) {
    const p = (i / count) * 2 * Math.PI,
      c = Math.cos(angle),
      q = Math.sin(angle);
    out.push([0, 1, 2].map((k) => c * a[k] + q * (Math.cos(p) * v[k] + Math.sin(p) * u[k])));
  }
  return out;
}

/** Does a sight line from `eye` along `d` pass through the water (a cylinder on the ground at the origin)? */
export function throughWater(eye, d, source) {
  const { radius, height } = WATER[source];
  const A = d[0] * d[0] + d[2] * d[2],
    B = 2 * (eye[0] * d[0] + eye[2] * d[2]),
    C = eye[0] * eye[0] + eye[2] * eye[2] - radius * radius,
    disc = B * B - 4 * A * C;
  if (A < 1e-9 || disc <= 0) return false;
  let t1 = Math.max(0, (-B - Math.sqrt(disc)) / (2 * A)),
    t2 = (-B + Math.sqrt(disc)) / (2 * A);
  if (t2 <= t1) return false;
  // Keep the part of the sight line that is between the ground and the top of the water.
  if (d[1] > 1e-9) t2 = Math.min(t2, (height - eye[1]) / d[1]);
  else if (d[1] < -1e-9) t2 = Math.min(t2, -eye[1] / d[1]);
  return t2 > t1;
}

/**
 * What the explorer can see. `setup` holds sunAz, sunHeight, sunShining,
 * raining, source ('rain' | 'fountain'), spot (her azimuth as seen from the
 * water) and heading (the azimuth she faces).
 * status:
 *   no_sunlight      a cloud covers the Sun
 *   no_drops         no water in the air
 *   sun_too_high     the whole bow lies below the horizon
 *   drops_elsewhere  no drops in the part of the sky opposite the Sun
 *   looking_away     coloured light reaches her, but from outside her view
 *   rainbow          she sees it
 */
export function rainbow(setup, count = 90) {
  const eye = explorerPosition(setup.spot, setup.source);
  const samples = bowDirections(setup.sunAz, setup.sunHeight, count).map((d) => {
    const above = d[1] > 0.02;
    const lit = above && setup.sunShining && setup.raining && throughWater(eye, d, setup.source);
    const inView =
      angleBetween(Math.atan2(d[2], d[0]), setup.heading) <= FOV / 2 &&
      Math.asin(d[1]) <= MAX_LOOK_UP;
    return { above, lit, seen: lit && inView };
  });
  const n = (key) => samples.filter((s) => s[key]).length,
    above = n('above'),
    lit = n('lit'),
    seen = n('seen');
  const enough = Math.ceil(count / 30); // ignore slivers under 12 degrees of arc
  const status = !setup.sunShining
    ? 'no_sunlight'
    : !setup.raining
      ? 'no_drops'
      : above < enough
        ? 'sun_too_high'
        : lit < enough
          ? 'drops_elsewhere'
          : seen < enough
            ? 'looking_away'
            : 'rainbow';
  const share = above ? seen / above : 0;
  return {
    status,
    seen: status === 'rainbow',
    amount: status !== 'rainbow' ? 'none' : share >= 0.6 ? 'most of a bow' : 'a piece of a bow',
    share,
    litShare: above ? lit / above : 0,
    samples,
    // How high the top of the bow stands above the horizon (negative: below ground).
    topDeg: (BOW_ANGLE - SUN_ELEVATION[setup.sunHeight]) / DEG,
  };
}

/** The spot where the Sun is directly behind someone who looks at the water. */
export const sunBehindSpot = (sunAz) => wrap(sunAz);
export const facingWater = (spot) => wrap(spot + Math.PI);
