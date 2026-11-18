// Close-up of one raindrop, drawn on the shared stage with kit pieces. The
// paths inside the drop are the model's own refraction and reflection, worked
// out for many colours between red and violet: laid on top of each other they
// make the white beam, and they come apart into the colours where the model
// says they do. Outside the drop the fan is widened so a child can see it;
// that widening is display only. The drop is hugely magnified beside Mia, who
// stands on a patch of meadow far below.
import { THREE, toon, flat, solid, unlined, PALETTE } from '/sdk/stage.mjs';
import { character, grass, label, light, spectrum, WHITE_LIGHT } from '/sdk/props.mjs';
import { slab, shoreline } from '/sdk/shapes.mjs';
import { COLOURS, dropRay } from '../model/optics.mjs';

const C = { x: 0.9, y: 0.3 }, // drop centre
  R = 1.15,
  GROUND = -2.38,
  FAN = 5, // how much wider the colour fan is drawn than it really is
  SHADES = 30,
  N_RED = COLOURS[0].n,
  N_VIOLET = COLOURS[2].n;
export const STORM = { top: '#0a1a2c', mid: '#12304a', horizon: '#1f4a63' };
const at = (p, z = 0) => new THREE.Vector3(C.x + p[0] * R, C.y + p[1] * R, z);

export function createDropView(stage) {
  const root = new THREE.Group();
  root.visible = false;
  stage.scene.add(root);
  const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 400);

  // The drop: clear water with an ink rim and one highlight.
  const drop = new THREE.Mesh(
    new THREE.SphereGeometry(R, 64, 44),
    toon('#8fd0f2', { transparent: true, opacity: 0.3, depthWrite: false }),
  );
  drop.position.set(C.x, C.y, 0);
  drop.renderOrder = 2;
  const shine = new THREE.Mesh(
    new THREE.TorusGeometry(R * 0.72, 0.035, 6, 28, 0.85),
    flat('#ffffff', { transparent: true, opacity: 0.55, depthWrite: false }),
  );
  shine.position.set(C.x, C.y, R * 0.62);
  shine.rotation.z = 1.75;
  shine.renderOrder = 3;
  root.add(drop, unlined(shine));

  // Far below: a patch of meadow with Mia looking up.
  const patch = { x: -1.45, rx: 1.55, rz: 0.85 }, // where the 42-degree light comes down
    island = new THREE.Group(),
    outline = shoreline(patch.rx, patch.rz, { wobble: 0.05 });
  solid(slab(outline, { depth: 0.34, bevel: 0.1 }), toon('#7a6a4f'), island).position.y = -0.1;
  solid(slab(outline.map(([x, z]) => [x * 0.99, z * 0.99]), { depth: 0.04, bevel: 0 }), toon(PALETTE.grass), island).position.y = 0.03;
  const turf = grass({
    radius: patch.rx / 0.42,
    count: 1300,
    keep: (x, z) => ((x * 0.42) / (patch.rx * 0.93)) ** 2 + ((z * 0.42) / (patch.rz * 0.9)) ** 2 < 1,
  });
  turf.scale.setScalar(0.42);
  turf.position.y = 0.03;
  const mia = character('mia', { at: [-0.05, 0.03, 0.15], height: 0.62 });
  mia.rotation.y = 0.75; // turned towards the drop, three-quarters on to us
  island.add(turf, mia);
  island.position.set(patch.x, GROUND, 0);
  root.add(island);

  // Light is rebuilt whenever it changes.
  const lit = new THREE.Group();
  root.add(lit);
  const shades = spectrum(SHADES, 2.4),
    glow = WHITE_LIGHT.clone().multiplyScalar(0.3),
    faint = new THREE.Color(1, 1, 1).multiplyScalar(0.35);
  // The handle on the incoming beam: a bead the child slides up and down.
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), flat('#ffda72'));
  root.add(knob);
  const hidden = label('?', { size: 0.6, colour: '#ffffff' });
  root.add(hidden);

  // Cut a polyline to a fraction of its length, to draw light travelling.
  function partial(points, u) {
    const lengths = points.slice(1).map((p, i) => p.distanceTo(points[i]));
    let left = lengths.reduce((a, b) => a + b, 0) * Math.max(0, Math.min(1, u));
    const out = [points[0]];
    for (let i = 0; i < lengths.length && left > 0; i++) {
      out.push(points[i].clone().lerp(points[i + 1], Math.min(1, left / lengths[i])));
      left -= lengths[i];
    }
    return out;
  }

  // The picture is fitted into the part of the screen the page leaves free:
  // below the instruction, above the answer buttons and the walkie.
  let view = { width: 1, height: 1, perUnit: 1, handleX: -1.5 },
    last = '';
  function frame(width, height) {
    if (width === view.width && height === view.height) return;
    const narrow = width <= 800,
      world = narrow ? { x0: -3.05, x1: 2.5, y0: GROUND - 0.6, y1: 1.65 } : { x0: -3.5, x1: 2.9, y0: GROUND - 0.6, y1: 1.65 },
      free = narrow ? { left: 0, right: width, top: 128, bottom: height - 190 } : { left: 0, right: width, top: 165, bottom: height - 150 },
      perUnit = Math.min((free.right - free.left) / (world.x1 - world.x0), (free.bottom - free.top) / (world.y1 - world.y0)),
      half = Math.tan((camera.fov / 2) * (Math.PI / 180)),
      distance = height / (2 * half * perUnit);
    // Looking straight at the drop's plane, moved so the picture's middle sits
    // in the middle of the free area.
    camera.position.set(
      (world.x0 + world.x1) / 2 - ((free.left + free.right) / 2 - width / 2) / perUnit,
      (world.y0 + world.y1) / 2 + ((free.top + free.bottom) / 2 - height / 2) / perUnit,
      distance,
    );
    camera.rotation.set(0, 0, 0);
    camera.updateMatrixWorld();
    // The bead sits between the Sun sign at the left edge and the drop.
    const leftEdge = camera.position.x - width / 2 / perUnit;
    view = { width, height, perUnit, handleX: Math.min(-0.75, Math.max(leftEdge + 150 / perUnit, -1.9)) };
    last = '';
  }
  const toScreen = (x, y) => ({
    x: view.width / 2 + (x - camera.position.x) * view.perUnit,
    y: view.height / 2 - (y - camera.position.y) * view.perUnit,
  });

  return {
    root,
    camera,
    frame,
    tick(seconds) {
      turf.userData.tick(seconds);
      mia.userData.tick(seconds);
    },
    /** Screen position of the handle on the incoming beam. */
    handle(beam) {
      return toScreen(view.handleX, C.y + beam * R);
    },
    /** Beam height for a pointer position. */
    beamAt(clientY) {
      return (camera.position.y + (view.height / 2 - clientY) / view.perUnit - C.y) / R;
    },
    /** u: 0..1 progress of the travelling light (1 = whole journey drawn). */
    draw(state, u) {
      const key = [state.beam, state.dropStage, state.canAim, u.toFixed(3)].join();
      if (key === last) return;
      last = key;
      for (const old of [...lit.children]) {
        old.geometry.dispose(); // the glow material is shared, so it stays
        lit.remove(old);
      }
      const mid = dropRay(state.beam, COLOURS[1].n),
        entry = at(mid.entry),
        toBounce = state.dropStage === 'to_bounce',
        beams = light();
      // The white beam takes the first quarter of the time, the journey through the drop the rest.
      const inU = Math.min(1, u * 4),
        restU = Math.max(0, (u - 0.25) / 0.75);
      // Sunlight arrives from far off the left of the picture: a bright core in a soft glow.
      const arriving = partial([new THREE.Vector3(camera.position.x - view.width / view.perUnit, entry.y, 0), entry], inU);
      beams.path(arriving, { colour: WHITE_LIGHT, width: 0.05, strength: 1.5 }).path(arriving, { colour: glow, width: 0.34 });
      // Time is shared out by distance: the path inside the drop, then the light leaving it.
      const insideU = toBounce ? restU : Math.min(1, restU / 0.55),
        outU = toBounce ? 0 : Math.max(0, (restU - 0.55) / 0.45),
        midAngle = Math.atan2(mid.out[1], mid.out[0]),
        length = 3.4 * outU;
      const journey = (r) => (toBounce ? [at(r.entry), at(r.back)] : [at(r.entry), at(r.back), at(r.exit)]);
      if (insideU > 0) beams.path(partial(journey(mid), insideU), { colour: glow, width: 0.3 });
      let before = null;
      shades.forEach((colour, i) => {
        const r = dropRay(state.beam, N_RED + ((N_VIOLET - N_RED) * i) / (SHADES - 1));
        // Every colour takes its own path. Inside the drop they lie almost on
        // top of each other, which is why the beam there still looks white.
        if (insideU > 0) beams.path(partial(journey(r), insideU), { colour, width: 0.05 });
        if (outU <= 0) return;
        const shown = midAngle + (Math.atan2(r.out[1], r.out[0]) - midAngle) * FAN,
          from = at(r.exit),
          to = from.clone().add(new THREE.Vector3(Math.cos(shown) * length, Math.sin(shown) * length, 0)),
          bright = colour.clone().multiplyScalar(SHADES / 2.4);
        // Leaving the drop the colours spread into a fan: a continuous sheet from red to violet.
        if (before) beams.sheet(before.from, before.to, from, to, before.bright, bright, { strength: 0.9, fade: 0.12 });
        before = { from, to, bright };
      });
      // Light that is not reflected leaves through the back: a faint dotted line.
      if (!toBounce && u >= 0.55) {
        const back = at(mid.back),
          way = new THREE.Vector3(mid.through[0], mid.through[1], 0);
        for (let i = 0; i < 7; i++) {
          const a = back.clone().addScaledVector(way, 0.12 + i * 0.16);
          beams.line(a, a.clone().addScaledVector(way, 0.08), { colour: faint, width: 0.035 });
        }
      }
      lit.add(beams.build());
      knob.visible = state.canAim;
      knob.position.set(view.handleX, entry.y, 0);
      hidden.visible = toBounce && u >= 1;
      hidden.position.copy(at(mid.back)).add(new THREE.Vector3(0.38, -0.18, 0));
    },
  };
}
