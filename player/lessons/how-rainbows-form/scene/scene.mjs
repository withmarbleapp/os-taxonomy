import { THREE, createStage, flat, SKY } from '/sdk/stage.mjs';
import { meadow, terrain, grass, flowers, mountains, skyClouds, scatter, cloud, sun as sunSymbol, character, fountain as fountainProp, arrow as arrowProp, ray, clear } from '/sdk/props.mjs';
import { tutorView, questionFor } from '../model/rainbow.mjs';
import { bindMoments } from '/sdk/moments-ui.mjs';
import { DEG, FOV, EYE_HEIGHT, WATER, rainbow, bowDirections, sunDirection, explorerPosition, wrap } from '../model/optics.mjs';
import { createDropView, STORM } from './drop.mjs';

// Display-only widening of the bow so its colours can be told apart in a small window.
const BOW_RINGS = [
  [38.6, '#b98cff', 0],
  [39.2, '#8f5bff', 1],
  [39.8, '#3f6bff', 1],
  [40.4, '#2fc5e8', 1],
  [41.0, '#52d85a', 1],
  [41.6, '#ffe345', 1],
  [42.0, '#ff9a2e', 1],
  [42.4, '#ff3b30', 1],
  [43.0, '#ff3b30', 0],
];
const SEGMENTS = 90;

export function createScene(getModel, onVisualChange = () => {}) {
  const $ = (id) => document.getElementById(id),
    canvas = $('world');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // toggleAttribute, because SVG elements have no `hidden` property.
  const show = (id, on) => $(id).toggleAttribute('hidden', !on);
  let stage;
  try {
    stage = createStage(canvas);
  } catch {
    $('lesson-ui').hidden = false;
    $('instruction').textContent = 'This device needs WebGL to show the rainbow model.';
    throw new Error('WebGL unavailable');
  }
  const scene = stage.scene,
    stageOwn = new Set(scene.children);
  // Light, mist and teaching marks: flat colour, no outline, no shadow.
  const mark = (geo, mat, parent = scene) => {
    const m = new THREE.Mesh(geo, mat);
    m.layers.set(1);
    parent.add(m);
    return m;
  };
  const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  let seed = 7;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);

  // --- Landscape: shared props ---
  const heightAt = terrain({ flat: 34 });
  const turf = grass({ heightAt, radius: 80, count: 16000 });
  scene.add(
    meadow({ heightAt }),
    turf,
    flowers({ heightAt, from: 16, to: 34 }),
    scatter({ heightAt, trees: 44, from: 36, to: 240 }),
    mountains(),
    skyClouds({ count: 10 }),
  );
  const walkRing = mark(new THREE.RingGeometry(1, 1.03, 96), flat('#fdfcfa', { transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
  walkRing.rotation.x = -Math.PI / 2;
  walkRing.position.y = 0.05;

  // --- Sun and its cloud ---
  // The Sun is far away. From above it is off the picture, so the page shows a
  // marker at the screen's edge; these two are only for Mia's own view.
  const sun = sunSymbol({ radius: 11 });
  const sunCloud = cloud();
  sunCloud.scale.setScalar(13);
  sun.visible = sunCloud.visible = false;
  scene.add(sun, sunCloud);

  // --- Rain shower ---
  const rain = new THREE.Group();
  scene.add(rain);
  const RAIN = WATER.rain;
  const rainCloud = cloud({
    colour: '#8f99a8',
    parts: Array.from({ length: 13 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2,
        d = i === 12 ? 0 : 4.6;
      return [Math.cos(a) * d, rand() * 0.8, Math.sin(a) * d, i === 12 ? 4 : 2.6 + rand()];
    }),
  });
  rainCloud.position.y = RAIN.height + 2.2;
  rain.add(rainCloud);
  const wet = mark(new THREE.CircleGeometry(RAIN.radius, 48), flat('#447f52'), rain);
  wet.rotation.x = -Math.PI / 2;
  wet.position.y = 0.03;
  const STREAKS = 520,
    streakBase = [];
  for (let i = 0; i < STREAKS; i++) {
    const a = rand() * Math.PI * 2,
      d = Math.sqrt(rand()) * RAIN.radius;
    streakBase.push([Math.cos(a) * d, rand(), Math.sin(a) * d]);
  }
  const streakGeo = new THREE.BufferGeometry();
  streakGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(STREAKS * 6), 3));
  const streaks = new THREE.LineSegments(streakGeo, new THREE.LineBasicMaterial({ color: '#eef7ff', transparent: true, opacity: 0.9 }));
  streaks.frustumCulled = false;
  streaks.layers.set(1);
  rain.add(streaks);
  const rainVolume = mark(
    new THREE.CylinderGeometry(RAIN.radius, RAIN.radius, RAIN.height, 40, 1, true),
    flat('#dcecf8', { transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
    rain,
  );
  rainVolume.position.y = RAIN.height / 2;

  // --- Fountain ---
  const FOUNT = WATER.fountain;
  const fountain = fountainProp({ radius: FOUNT.radius });
  scene.add(fountain);
  const SPRAY = 420,
    sprayBase = Array.from({ length: SPRAY }, () => [rand() * Math.PI * 2, rand(), 0.35 + rand() * 0.65]);
  const sprayGeo = new THREE.BufferGeometry();
  sprayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPRAY * 3), 3));
  const spray = new THREE.Points(sprayGeo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.12, transparent: true, opacity: 0.95 }));
  spray.frustumCulled = false;
  spray.layers.set(1);
  fountain.add(spray);
  const sprayVolume = mark(
    new THREE.CylinderGeometry(FOUNT.radius, FOUNT.radius, FOUNT.height, 32, 1, true),
    flat('#e6f4ff', { transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }),
    fountain,
  );
  sprayVolume.position.y = FOUNT.height / 2;

  // --- Mia (her front is +x) ---
  const mia = new THREE.Group();
  scene.add(mia);
  const miaBody = character('mia', { height: 3.6 }); // drawn large so she can be found and dragged
  miaBody.rotation.y = Math.PI / 2; // the character faces +z
  mia.add(miaBody);
  const wedge = mark(
    new THREE.CircleGeometry(5.2, 28, -FOV / 2, FOV),
    flat('#fff7c2', { transparent: true, opacity: 0.26, side: THREE.DoubleSide, depthWrite: false }),
    mia,
  );
  wedge.rotation.x = -Math.PI / 2;
  wedge.position.y = 0.07;
  const gazeArrow = new THREE.Group().add(arrowProp({ at: [1.3, 0.5, 0], length: 3.45 }));
  mia.add(gazeArrow);

  // --- Supports: light drawn as thin rods so it stays visible at any size ---
  const supports = new THREE.Group();
  scene.add(supports);
  const add = mark,
    basic = flat;
  const rod = (a, b, colour, radius = 0.09, opacity = 1) => supports.add(ray(a, b, { colour, radius, opacity }));
  const arrow = (a, b, colour, radius = 0.09) => supports.add(ray(a, b, { colour, radius, head: true }));
  const clearSupports = () => clear(supports);

  // --- The bow: drawn only for cameras at Mia's eye, never in the meadow ---
  const bowGeo = new THREE.BufferGeometry();
  const rings = BOW_RINGS.length;
  bowGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(rings * (SEGMENTS + 1) * 3), 3));
  bowGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(rings * (SEGMENTS + 1) * 4), 4));
  const index = [];
  for (let r = 0; r < rings - 1; r++)
    for (let i = 0; i < SEGMENTS; i++) {
      const a = r * (SEGMENTS + 1) + i,
        b = a + SEGMENTS + 1;
      index.push(a, b, a + 1, a + 1, b, b + 1);
    }
  bowGeo.setIndex(index);
  const bow = new THREE.Mesh(bowGeo, basic('#ffffff', { vertexColors: true, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
  bow.frustumCulled = false;
  bow.renderOrder = 10;
  bow.visible = false;
  bow.layers.set(1);
  scene.add(bow);

  const overview = new THREE.PerspectiveCamera(40, 1, 0.5, 600);
  const eyeCam = new THREE.PerspectiveCamera(70, 1.5, 0.2, 4000);
  const coverCam = new THREE.PerspectiveCamera(55, 1, 0.2, 4000);
  // Everything built so far is the outdoor world; the close-up replaces it.
  const outdoor = new THREE.Group();
  for (const child of [...scene.children]) if (!stageOwn.has(child)) outdoor.add(child);
  scene.add(outdoor);
  const dropView = createDropView(stage);

  let state,
    coverOpen = true,
    dims = { w: innerWidth, h: innerHeight },
    cloudAt = null,
    sceneKey = '',
    dropStart = performance.now(),
    dropKey = '',
    daylight = 1,
    shown = 1,
    wasClose = false;
  const extent = () => (state?.source === 'fountain' ? 12.5 : 19);
  const sunPos = () => v3(sunDirection(state.sunAz, state.sunHeight)).multiplyScalar(extent() * 0.8);
  const eyePos = () => v3(explorerPosition(state.spot, state.source));
  const facts = () => rainbow(state);

  function resize() {
    dims = { w: innerWidth, h: innerHeight };
    stage.resize(dims.w, dims.h);
    frameCamera();
  }
  function frameCamera() {
    const aspect = dims.w / dims.h,
      e = extent(),
      narrow = dims.w <= 800;
    overview.aspect = aspect;
    const t = Math.tan((overview.fov / 2) * DEG);
    // Far enough back to fit the whole arrangement across and upwards.
    const dist = Math.max(e / (t * aspect), (e * 0.86) / t);
    const elev = 24 * DEG;
    // Shift the picture down (wide) so the top strip is free for the text and Mia's window.
    const lift = narrow ? e * 0.5 : e * 0.42;
    overview.position.set(0, lift + Math.sin(elev) * dist, Math.cos(elev) * dist);
    overview.lookAt(0, lift, 0);
    overview.updateProjectionMatrix();
    overview.updateMatrixWorld();
    coverCam.aspect = aspect;
    coverCam.fov = aspect < 1 ? 80 : 58;
    coverCam.updateProjectionMatrix();
  }
  function project(p) {
    const q = p.clone().project(overview);
    return { x: ((q.x + 1) * dims.w) / 2, y: ((1 - q.y) * dims.h) / 2 };
  }
  function place(id, p, size = 64) {
    const q = project(p),
      el = $(id);
    el.style.left = q.x + 'px';
    el.style.top = q.y + 'px';
    el.style.width = el.style.height = size + 'px';
  }
  function groundPoint(e) {
    const ndc = new THREE.Vector2((e.clientX / dims.w) * 2 - 1, 1 - (e.clientY / dims.h) * 2);
    const ray = new THREE.Raycaster();
    ray.setFromCamera(ndc, overview);
    const hit = new THREE.Vector3();
    return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit) ? hit : null;
  }

  function buildSupports() {
    clearSupports();
    if (!state || state.view !== 'outdoor') return;
    const f = facts(),
      s = v3(sunDirection(state.sunAz, state.sunHeight)),
      eye = eyePos(),
      water = WATER[state.source],
      sp = sunPos();
    if (state.rays !== 'none') {
      // Parallel sunlight heading for the water, at several heights and widths.
      const side = new THREE.Vector3(-Math.sin(state.sunAz), 0, Math.cos(state.sunAz));
      const targets = [-0.55, 0, 0.55].flatMap((k, i) => [new THREE.Vector3(0, water.height * (0.35 + 0.2 * i), 0).addScaledVector(side, k * water.radius)]);
      for (const target of targets) {
        const from = target.clone().addScaledVector(s, extent() * 1.5); // arrives from off the picture
        if (!state.sunShining) continue; // the cloud stops the light
        else arrow(from, state.raining ? target : target.clone().addScaledVector(s, -target.y / Math.max(0.2, s.y)), '#ffcf33');
      }
      void sp;
    }
    if (state.rays === 'full' && f.litShare > 0) {
      // Order the lit part of the bow from one end, over the top, to the other end.
      const lit = f.samples
        .map((x, i) => (x.lit ? i : -1))
        .filter((i) => i >= 0)
        .sort((a, b) => (a > SEGMENTS / 2 ? a - SEGMENTS : a) - (b > SEGMENTS / 2 ? b - SEGMENTS : b));
      const dirs = bowDirections(state.sunAz, state.sunHeight, SEGMENTS);
      const picks = [lit[0], lit[Math.floor(lit.length / 2)], lit.at(-1)];
      ['#ff3b30', '#35c94a', '#8f5bff'].forEach((color, i) => {
        const from = eye.clone().addScaledVector(v3(dirs[picks[i]]), water.ring * 0.95);
        const drop = add(new THREE.SphereGeometry(0.28, 12, 10), basic('#ffffff'), supports);
        drop.position.copy(from);
        arrow(from, eye.clone().addScaledVector(v3(dirs[picks[i]]), 0.7), color, 0.1);
      });
    }
    if (state.cone) {
      const dirs = bowDirections(state.sunAz, state.sunHeight, 72),
        L = water.ring * 0.95;
      // Dotted line: Sun, through her head, to her shadow on the ground.
      const shadow = eye.clone().addScaledVector(s, -eye.y / s.y),
        far = eye.clone().addScaledVector(s, extent() * 0.75);
      for (let i = 0; i < 26; i += 2) rod(far.clone().lerp(shadow, i / 26), far.clone().lerp(shadow, (i + 1) / 26), '#ffffff', 0.08);
      const shadowDot = add(new THREE.CircleGeometry(0.6, 20), basic('#33475b', { transparent: true, opacity: 0.6 }), supports);
      shadowDot.rotation.x = -Math.PI / 2;
      shadowDot.position.copy(shadow).setY(0.08);
      const pts = dirs.map((d) => eye.clone().addScaledVector(v3(d), L));
      pts.forEach((p, i) => rod(p, pts[(i + 1) % pts.length], '#ffffff', 0.12));
      for (let i = 0; i < pts.length; i += 6) if (pts[i].y > 0) rod(eye, pts[i], '#ffffff', 0.035, 0.7);
    }
    if (state.colourDrops) {
      const far = water.ring + water.radius * 0.7;
      [
        [42.4, '#ff3b30'],
        [38.8, '#8f5bff'],
      ].forEach(([deg, color]) => {
        const d = v3(bowDirections(state.sunAz, state.sunHeight, 4, deg * DEG)[0]),
          p = eye.clone().addScaledVector(d, far);
        const drop = add(new THREE.SphereGeometry(0.42, 16, 12), basic(color), supports);
        drop.position.copy(p);
        arrow(p.clone().addScaledVector(s, 7), p.clone().addScaledVector(s, 0.6), '#ffcf33', 0.08);
        arrow(p, eye.clone().addScaledVector(d, 0.8), color, 0.1);
      });
    }
  }
  function buildBow() {
    const f = facts(),
      eye = eyePos(),
      pos = bowGeo.attributes.position,
      col = bowGeo.attributes.color,
      c = new THREE.Color();
    // Soften the ends of the arc.
    const alpha = f.samples.map((x, i, all) => (x.lit ? ((all.at(i - 1).lit ? 1 : 0) + 2 + (all[(i + 1) % all.length].lit ? 1 : 0)) / 4 : 0));
    BOW_RINGS.forEach(([deg, hex, on], r) => {
      const dirs = bowDirections(state.sunAz, state.sunHeight, SEGMENTS, deg * DEG);
      c.set(hex);
      for (let i = 0; i <= SEGMENTS; i++) {
        const d = dirs[i % SEGMENTS],
          k = r * (SEGMENTS + 1) + i;
        pos.setXYZ(k, eye.x + d[0] * 60, eye.y + d[1] * 60, eye.z + d[2] * 60);
        col.setXYZW(k, c.r, c.g, c.b, on * alpha[i % SEGMENTS] * 0.82);
      }
    });
    pos.needsUpdate = col.needsUpdate = true;
  }

  function update(snapshot, cover) {
    state = snapshot.state;
    coverOpen = !!cover;
    const onDrop = state.view === 'drop' && !coverOpen;
    show('lesson-ui', !coverOpen);
    document.body.classList.toggle('drop', onDrop);
    document.body.classList.toggle('day-sky', !onDrop);
    outdoor.visible = !onDrop;
    dropView.root.visible = onDrop;
    $('instruction').textContent = state.instruction;
    const out = !onDrop && !coverOpen;
    show('window', out);
    show('window-cover', state.windowCovered);
    show('sun-badge', out || onDrop);
    show('sun-veil', out && (state.canToggleSun || !state.sunShining));
    show('sun', out && state.canMoveSun);
    show('sun-cloud', out && state.canToggleSun);
    show('water', out && state.canToggleWater);
    show('mia', out && state.canWalk);
    show('gaze', out && state.canTurn);
    show('beam', onDrop && state.canAim);
    $('sun-cloud-label').textContent = state.sunShining ? 'Cover the Sun' : 'Uncover the Sun';
    $('sun-cloud').setAttribute('aria-label', $('sun-cloud-label').textContent);
    $('water-label').textContent =
      state.source === 'rain' ? (state.raining ? 'Stop the rain' : 'Start the rain') : state.raining ? 'Turn off the fountain' : 'Turn on the fountain';
    $('water').setAttribute('aria-label', $('water-label').textContent);
    // Answer buttons, the hint and "try it" are the standard controls.
    controls(snapshot, coverOpen);

    // World
    const rainy = state.source === 'rain';
    rain.visible = rainy;
    fountain.visible = !rainy;
    streaks.visible = rainVolume.visible = rainy && state.raining;
    wet.visible = rainy && state.raining;
    rainCloud.userData.material.color.set(state.raining ? '#8794a6' : '#e9eef3');
    spray.visible = sprayVolume.visible = !rainy && state.raining;
    const sp = sunPos();
    stage.setSun(sp, { reach: extent() * 1.6 });
    daylight = state.sunShining ? 1 : 0;
    const eye = eyePos();
    mia.position.set(eye.x, 0, eye.z);
    mia.rotation.y = -state.heading;
    gazeArrow.visible = state.canTurn;
    const reach = state.source === 'fountain' ? 0.62 : 1; // keep her arrow and view clear of the small fountain
    gazeArrow.scale.setScalar(reach);
    wedge.scale.setScalar(reach === 1 ? 1 : 0.72);
    $('sun').querySelector('span').textContent = state.sunHeight === 'high' ? 'Lower the Sun' : 'Lift the Sun';
    walkRing.visible = state.canWalk;
    walkRing.scale.setScalar(WATER[state.source].ring);
    const key = [state.sceneId, state.source].join();
    if (key !== sceneKey) {
      sceneKey = key;
      cloudAt = null; // new arrangement: the cloud starts in place
      frameCamera();
    }
    const dk = [state.sceneId, state.moment, state.dropStage, state.mode].join();
    if (onDrop && dk !== dropKey) {
      dropKey = dk;
      dropStart = performance.now();
    }
    buildSupports();
    buildBow();
    layout();
    onVisualChange();
  }

  const SUN_FAR = 420;
  function cloudTarget() {
    const s = v3(sunDirection(state.sunAz, state.sunHeight)),
      at = eyePos().addScaledVector(s, SUN_FAR * 0.93);
    return state.sunShining ? at.add(new THREE.Vector3(-s.z * 95, 34, s.x * 95)) : at;
  }
  const put = (id, x, y, size) => {
    const el = $(id);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (size) el.style.width = el.style.height = size + 'px';
  };
  function layout() {
    if (!state || coverOpen) return;
    if (state.view === 'drop') {
      dropView.frame(dims.w, dims.h);
      const h = dropView.handle(state.beam, dims.w, dims.h);
      put('beam', h.x, h.y);
      // Sunlight comes in from the left, from a Sun far outside the picture.
      put('sun-badge', 52, h.y);
      $('sun-badge').style.setProperty('--toward', '270deg');
      $('sun-badge').dataset.covered = false;
      return;
    }
    // Where the sunlight comes from: a sign near the edge of the picture whose
    // corner points at the Sun, which is far outside it.
    const edge = stage.edgePoint(overview, v3(sunDirection(state.sunAz, state.sunHeight)), {
      centre: new THREE.Vector3(0, extent() * 0.3, 0),
      inset: 52,
    });
    edge.y = Math.min(Math.max(edge.y, 200), dims.h - 230);
    const inX = -Math.cos(edge.angle),
      inY = -Math.sin(edge.angle),
      along = (d, lift = 0) => ({ x: edge.x + inX * d, y: edge.y + inY * d - lift });
    put('sun-badge', edge.x, edge.y);
    $('sun-badge').style.setProperty('--toward', (edge.angle * 180) / Math.PI + 90 + 'deg');
    // The cloud is the control for covering the Sun: beside the sign while the
    // Sun shines, over it when covered.
    const veil = state.sunShining ? along(92, 34) : along(6, 4);
    put('sun-veil', veil.x, veil.y);
    put('sun', edge.x, edge.y, 84);
    put('sun-cloud', Math.min(Math.max(veil.x, 70), dims.w - 70), veil.y, 84);
    $('sun-badge').dataset.covered = !state.sunShining;
    const w = WATER[state.source];
    place('water', new THREE.Vector3(0, state.source === 'rain' ? w.height + 2.2 : 1.6, 0), state.source === 'rain' ? 120 : 96);
    place('mia', mia.position.clone().setY(1.3), 72);
    const fwd = new THREE.Vector3(Math.cos(state.heading), 0, Math.sin(state.heading));
    place('gaze', mia.position.clone().addScaledVector(fwd, state.source === 'fountain' ? 2.6 : 4.0).setY(0.5), 60);
    // Keep the two chips apart: the one that is lower on screen hangs below its object.
    const gazeBelow = parseFloat($('gaze').style.top) > parseFloat($('mia').style.top);
    $('gaze').dataset.chip = gazeBelow ? 'below' : 'above';
    $('mia').dataset.chip = gazeBelow ? 'above' : 'below';
  }

  // --- Input ---
  function dragObject(id, onMove, onKey) {
    const el = $(id);
    let active = false;
    el.addEventListener('pointerdown', (e) => {
      active = true;
      el.dataset.dragging = 'true';
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => active && onMove(e));
    const end = () => {
      active = false;
      el.dataset.dragging = 'false';
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', (e) => {
      const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
      if (step) {
        e.preventDefault();
        onKey(step);
      }
    });
  }
  dragObject(
    'mia',
    (e) => {
      const g = groundPoint(e);
      if (!g || Math.hypot(g.x, g.z) < 1) return;
      const spot = wrap(Math.atan2(g.z, g.x));
      if (Math.abs(spot - state.spot) > 0.01) getModel().gesture('walk', spot);
    },
    (step) => getModel().gesture('walk', state.spot + step * 0.14),
  );
  dragObject(
    'gaze',
    (e) => {
      const g = groundPoint(e);
      if (!g) return;
      const dx = g.x - mia.position.x,
        dz = g.z - mia.position.z;
      if (Math.hypot(dx, dz) < 0.8) return;
      const heading = wrap(Math.atan2(dz, dx));
      if (Math.abs(heading - state.heading) > 0.01) getModel().gesture('turn', heading);
    },
    (step) => getModel().gesture('turn', state.heading + step * 0.16),
  );
  dragObject(
    'beam',
    (e) => {
      const b = dropView.beamAt(e.clientY, dims.w, dims.h);
      if (b !== null && Math.abs(b - state.beam) > 0.004) getModel().gesture('aim', b);
    },
    (step) => getModel().gesture('aim', state.beam + step * 0.04),
  );
  $('sun-cloud').onclick = () => getModel().gesture('toggle_sun');
  $('water').onclick = () => getModel().gesture('toggle_water');
  $('sun').onclick = () => getModel().gesture('move_sun');
  const controls = bindMoments({ model: getModel, questionFor, retryLabel: '↻ Try again' });

  // --- Frames ---
  function animateWater(t) {
    if (streaks.visible) {
      const p = streakGeo.attributes.position,
        H = RAIN.height + 1.5;
      for (let i = 0; i < STREAKS; i++) {
        const [x, ph, z] = streakBase[i],
          y = H - ((t * 0.9 + ph) % 1) * H;
        p.setXYZ(i * 2, x, y, z);
        p.setXYZ(i * 2 + 1, x, Math.max(0, y - 0.7), z);
      }
      p.needsUpdate = true;
    }
    if (spray.visible) {
      const p = sprayGeo.attributes.position;
      for (let i = 0; i < SPRAY; i++) {
        const [a, ph, reach] = sprayBase[i],
          u = (t * 0.55 + ph) % 1,
          r = u * (FOUNT.radius - 0.3) * reach;
        p.setXYZ(i, Math.cos(a) * r, 1.9 + (FOUNT.height - 2.1) * 4 * u * (1 - u) * reach - u * 1.2, Math.sin(a) * r);
      }
      p.needsUpdate = true;
    }
  }
  function aimEye(cam, pitch) {
    const eye = eyePos(),
      h = cam === coverCam ? wrap(state.sunAz + Math.PI) : state.heading;
    cam.position.copy(eye);
    cam.lookAt(eye.x + Math.cos(h) * Math.cos(pitch), eye.y + Math.sin(pitch), eye.z + Math.sin(h) * Math.cos(pitch));
  }
  function renderEye(cam, rect) {
    miaBody.visible = wedge.visible = false;
    const arrowWas = gazeArrow.visible,
      ringWas = walkRing.visible;
    gazeArrow.visible = walkRing.visible = supports.visible = false;
    bow.visible = sun.visible = sunCloud.visible = true;
    sun.position.copy(eyePos()).addScaledVector(v3(sunDirection(state.sunAz, state.sunHeight)), SUN_FAR);
    stage.render(cam, rect);
    bow.visible = sun.visible = sunCloud.visible = false;
    miaBody.visible = wedge.visible = supports.visible = true;
    gazeArrow.visible = arrowWas;
    walkRing.visible = ringWas;
  }
  let last = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    if (now - last < 1000 / 30 || !state) return;
    last = now;
    const t = reduced ? 0.3 : now / 1000;
    animateWater(t);
    turf.userData.tick(t);
    miaBody.userData.tick(t);
    const target = cloudTarget();
    if (!cloudAt || reduced) cloudAt = target.clone();
    else cloudAt.lerp(target, 0.18);
    sunCloud.position.copy(cloudAt);
    // The light and sky follow the cloud across the Sun.
    shown = reduced ? daylight : shown + (daylight - shown) * 0.18;
    const close = state.view === 'drop' && !coverOpen;
    stage.setLight({ sunlight: close ? 1 : 0.12 + 0.88 * shown });
    stage.setSky(close ? STORM : daylight ? SKY.clear : SKY.overcast, reduced || close !== wasClose ? 1 : 0.18);
    wasClose = close;
    if (coverOpen) {
      aimEye(coverCam, 14 * DEG);
      renderEye(coverCam);
      return;
    }
    if (state.view === 'drop') {
      dropView.draw(state, reduced || state.mode === 'activity' ? 1 : Math.min(1, (now - dropStart) / 5200));
      dropView.tick(t);
      dropView.frame(dims.w, dims.h);
      stage.setSun(new THREE.Vector3(-0.6, 0.55, 0.6), { reach: 8 });
      stage.render(dropView.camera);
      layout();
      return;
    }
    stage.render(overview);
    if (!state.windowCovered) {
      const r = $('window').getBoundingClientRect(),
        b = 4; // inside the frame's border
      const x = r.left + b,
        y = r.top + b,
        w = r.width - 2 * b,
        h = r.height - 2 * b;
      if (w > 10 && h > 10) {
        eyeCam.aspect = w / h;
        eyeCam.fov = (2 * Math.atan(Math.tan(FOV / 2) / eyeCam.aspect)) / DEG;
        eyeCam.updateProjectionMatrix();
        aimEye(eyeCam, 13 * DEG);
        renderEye(eyeCam, { x, y, width: w, height: h });
      }
    }
    layout();
  }
  window.addEventListener('resize', () => {
    resize();
    layout();
  });
  resize();
  requestAnimationFrame(frame);
  void EYE_HEIGHT;
  return {
    update,
    presentation: () => ({
      ...(state ? tutorView(state) : {}),
      mode: state?.mode,
      moment: state?.moment,
      coverOpen,
      instruction: $('instruction').textContent,
      modelLimits: 'Illustrative sizes and distances. The bow in Mia’s window and the colour fan in the drop are drawn wider than in nature.',
    }),
  };
}
