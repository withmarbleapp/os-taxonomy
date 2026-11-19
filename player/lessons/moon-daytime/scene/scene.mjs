import { questionFor, tutorView } from '../model/moon.mjs';
import { bindMoments } from '/sdk/moments-ui.mjs';
import { THREE, createStage, flat, unlined } from '/sdk/stage.mjs';
import { star, earth as kitEarth, moon as kitMoon, orbit, character, light, clear } from '/sdk/props.mjs';
import { createGroundView } from './ground-view.mjs';
import { R, ORBIT, SUN_X, facts } from '../model/geometry.mjs';
// Two scenes on the shared stage: the space model, seen from above Earth's north
// pole in the kit's space setting, and the explorer's own sky in daylight
// (ground-view.mjs). Both draw through one renderer.
export function createScene(getModel, onVisualChange = () => {}) {
  const $ = (id) => document.getElementById(id),
    canvas = $('world');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = (id, on) => ($(id).hidden = !on);
  let stage;
  try {
    stage = createStage(canvas, { setting: 'space' });
  } catch {
    $('instruction').textContent = 'This device needs WebGL to show the Moon model.';
    for (const id of ['earth', 'sun', 'moon', 'observer']) show(id, false);
    throw new Error('WebGL unavailable');
  }
  const scene = stage.scene;
  // Everything lies in the x-y plane and is seen from +z. The view is narrow and
  // far off, so the bodies stay round wherever they sit in the picture.
  const VIEW = 24,
    overview = new THREE.PerspectiveCamera(VIEW, 1, 1, 200);
  // Sunlight spreads from the Sun itself, so each body's lit half faces it. The
  // stage's own parallel light is left out: it would also throw Earth's shadow
  // across the Moon, which this model does not show.
  stage.setLight({ sunlight: 0 });
  stage.sun.castShadow = false;
  const sunlight = new THREE.PointLight('#ffffff', Math.PI, 0, 0);
  sunlight.color.setRGB(...stage.setting.shade.map((s) => 1 - s));
  sunlight.position.set(SUN_X, 0, 0);
  scene.add(sunlight);
  const mark = (geometry, colour, opacity = 1) =>
    unlined(new THREE.Mesh(geometry, flat(colour, { transparent: opacity < 1, opacity, depthWrite: false })));
  // The kit's bodies stand with north up; here north points at the viewer.
  const northUp = (object) => {
    const g = new THREE.Group().add(object);
    g.rotation.x = Math.PI / 2;
    return g;
  };
  const art = new THREE.Group();
  scene.add(art);
  const globe = kitEarth({ radius: R }),
    earthGroup = northUp(globe);
  const moonGroup = new THREE.Group().add(northUp(kitMoon({ radius: 0.49 })));
  // The explorer is a marker as much as a figure: drawn in plain colour so the
  // child stays readable on Earth's night side.
  const observerGroup = new THREE.Group(),
    explorer = character('sam', { height: 0.8 });
  explorer.userData.ready.then(() =>
    explorer.traverse((o) => {
      if (o.isMesh && o.material.gradientMap) o.material = flat(o.material.color, { map: o.material.map });
    }),
  );
  observerGroup.add(explorer);
  art.add(earthGroup, moonGroup, observerGroup);
  const sun = star({ at: [SUN_X, 0, 0], radius: 0.84 });
  scene.add(sun);
  // Rings and rays are scaffolds, never answer cues before an independent commitment.
  function ring(radius, colour, opacity = 1) {
    const m = mark(new THREE.RingGeometry(radius - 0.014, radius + 0.014, 128), colour, opacity);
    scene.add(m);
    return m;
  }
  const turnRing = ring(R + 0.26, '#76a6be', 0.7);
  const orbitRing = orbit({ radius: ORBIT, colour: '#688497', opacity: 0.3 });
  orbitRing.rotation.x = 0;
  scene.add(orbitRing);
  const focusSun = ring(1.03, '#ffe4a5');
  focusSun.position.copy(sun.position);
  const focusMoon = ring(0.67, '#ffe4a5');
  const focusObserver = ring(0.5, '#ffe4a5');
  for (const r of [focusSun, focusMoon, focusObserver]) r.position.z = 0.3;
  // Screen-space strokes remain legible at every viewport size.
  const horizonOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  horizonOverlay.id = 'horizon-overlay';
  horizonOverlay.setAttribute('aria-hidden', 'true');
  horizonOverlay.innerHTML = '<path class="horizon-outline"/><path class="horizon-line"/>';
  $('lesson-ui').prepend(horizonOverlay);
  const horizonLabel = document.createElement('div');
  horizonLabel.id = 'horizon-label';
  horizonLabel.textContent = 'Horizon';
  $('lesson-ui').append(horizonLabel);
  // Each leg of the light's journey is a glowing line with a bright packet
  // travelling along it.
  const rayGroup = new THREE.Group();
  scene.add(rayGroup);
  const packets = [];
  function clearRays() {
    clear(rayGroup);
    packets.length = 0;
  }
  function addRay(from, to, colour) {
    const a = from.clone().setZ(0.5),
      b = to.clone().setZ(0.5),
      tint = new THREE.Color(colour);
    const beam = light().line(a, b, { colour: tint, width: 0.075, strength: 0.85 }).build();
    const ball = mark(new THREE.SphereGeometry(0.075, 16, 12), colour);
    rayGroup.add(beam, ball);
    packets.push({ a, b, ball, beam });
  }
  const ground = createGroundView(canvas, stage);
  const sky = ground.camera;

  let state,
    coverOpen = true,
    inSky = false,
    dims = { w: innerWidth, h: innerHeight };
  function normal() {
    return new THREE.Vector3(Math.cos(state.theta), Math.sin(state.theta), 0);
  }
  function resize() {
    dims = { w: innerWidth, h: innerHeight };
    observerGroup.scale.setScalar(dims.w <= 600 ? 1.35 : 1);
    stage.resize(dims.w, dims.h);
    ground.resize(dims.w, dims.h);
    if (coverOpen && state) poseCover();
    frameView();
  }
  // Fits the camera to the model, or to the cover picture while the cover is up.
  function frameView() {
    const aspect = dims.w / dims.h,
      portrait = aspect < 0.8,
      narrow = dims.w <= 800;
    let half,
      x = 0,
      y = 0.45;
    overview.up.set(0, 1, 0);
    if (coverOpen) {
      // Earth, the explorer and the Moon, clear of the cover's words.
      half = (narrow ? 7.8 : Math.max(14, 8.6 * aspect)) / aspect / 2;
      x = narrow ? -0.3 : -3.1;
      y = 1.8;
    } else if (portrait) {
      // On a tall screen the Sun-Earth line runs up the picture.
      half = 7.5 / aspect;
      x = -2.7;
      y = 0;
      overview.up.set(1, 0, 0);
    } else half = Math.max(6.15, 8 / aspect);
    const distance = half / Math.tan(THREE.MathUtils.degToRad(VIEW / 2));
    overview.near = Math.max(1, distance - 12);
    overview.far = distance + 40;
    overview.aspect = aspect;
    overview.position.set(x, y, distance);
    overview.lookAt(x, y, 0);
    overview.updateProjectionMatrix();
    overview.updateMatrixWorld();
  }
  // The cover picture: the same model, posed.
  function poseCover() {
    const narrow = dims.w <= 800;
    art.scale.setScalar(narrow ? 1.55 : 1);
    globe.userData.globe.rotation.y = 0.45;
    moonGroup.position.set(narrow ? 1.2 : 0.107, narrow ? 2.1 : 5.149, 0);
    observerGroup.position.set(-1.068, 1.081, 0.02);
    observerGroup.rotation.z = 2.35 - Math.PI / 2;
    sun.visible = turnRing.visible = orbitRing.visible = false;
    focusSun.visible = focusMoon.visible = focusObserver.visible = false;
    rayGroup.visible = false;
  }

  function project(p, cam = overview) {
    const q = p.clone().project(cam);
    return { x: ((q.x + 1) * dims.w) / 2, y: ((1 - q.y) * dims.h) / 2 };
  }
  function positionButton(id, p, radius) {
    const q = project(p),
      el = $(id);
    el.style.left = q.x + 'px';
    el.style.top = q.y + 'px';
    if (radius) {
      const q2 = project(p.clone().add(new THREE.Vector3(radius, 0, 0)));
      const q3 = project(p.clone().add(new THREE.Vector3(0, radius, 0)));
      const px = Math.max(Math.hypot(q2.x - q.x, q2.y - q.y), Math.hypot(q3.x - q.x, q3.y - q.y));
      el.style.width = el.style.height = Math.max(id === 'earth' ? 48 : 80, px * 2) + 'px';
    }
  }
  let animationStart = 0,
    animationPhase = 'none';
  const controls = bindMoments({ model: getModel, questionFor });
  function update(snapshot, cover) {
    const previous = state;
    state = snapshot.state;
    coverOpen = cover;
    const wasSky = inSky;
    inSky = state.view === 'sky';
    $('lesson-ui').hidden = cover;
    const f = facts(state.theta, state.phi);
    art.scale.setScalar(1);
    sun.visible = rayGroup.visible = true;
    globe.userData.globe.rotation.y = state.theta - state.originTheta;
    moonGroup.position.set(...f.moon, 0);
    observerGroup.position.set(...f.observer, 0.02);
    observerGroup.rotation.z = state.theta - Math.PI / 2;
    const n = normal();
    const { ordering } = controls(snapshot, cover);
    turnRing.visible = state.canTurn;
    // The Moon's orbit is drawn for a fresh prediction, where no light route is.
    orbitRing.visible = state.kind === 'ask' && state.situation === 'fresh';
    focusSun.visible = focusMoon.visible = focusObserver.visible = false;
    focusMoon.position.copy(moonGroup.position).setZ(0.3);
    focusObserver.position.copy(observerGroup.position).addScaledVector(n, 0.4).setZ(0.3);
    for (const id of state.draft) {
      ({ sun: focusSun, moon: focusMoon, observer: focusObserver })[id].visible = true;
    }
    clearRays();
    if (state.rays && state.mode === 'demonstration') animationStart = performance.now();
    if (state.rays) {
      addRay(sun.position, moonGroup.position, '#ffe28e');
      if (f.visible) addRay(moonGroup.position, observerGroup.position, '#b6ebff');
    }
    ground.update(f, state.theta);
    if (inSky && (!wasSky || previous?.sceneId !== state.sceneId)) ground.enter();
    document.body.classList.toggle('sky', inSky);
    document.body.classList.toggle('day', inSky && f.day);
    $('instruction').textContent = state.instruction;
    show('replay', !cover && state.mode === 'demonstration' && state.rays && !inSky);
    show('earth', !cover && !inSky && state.canTurn);
    for (const id of ['sun', 'moon', 'observer']) show(id, !cover && !inSky && ordering);
    $('eye').textContent = inSky ? '↗ Back to space' : '↘ See the sky';
    // The sky would give a fresh prediction away; after an answer or help it is offered.
    const predicting = state.kind === 'ask' && state.item === 'moon_visible' && state.situation === 'fresh';
    show('eye', !cover && (!predicting || state.revealed || state.assisted));
    show('lookTools', !cover && inSky);
    if (ordering && !state.draft.length) $('order-draft').textContent = 'Choose the first object';
    canvas.tabIndex = inSky ? 0 : -1;
    canvas.setAttribute(
      'aria-label',
      inSky
        ? 'The explorer’s sky. Drag or use arrow keys to look around.'
        : 'An illustrative model of Earth, Sun, Moon and an explorer.',
    );
    if (cover) poseCover();
    frameView();
    layout();
  }
  function layout() {
    if (!state) return;
    let a, b;
    if (inSky) {
      const { yaw } = ground.snapshot();
      // Project zero altitude; the marker follows looking up and down.
      const q = project(sky.position.clone().add(new THREE.Vector3(Math.sin(yaw), 0, -Math.cos(yaw)).multiplyScalar(1800)), sky);
      a = { x: 0, y: q.y };
      b = { x: dims.w, y: q.y };
    } else {
      const n = normal(), tangent = new THREE.Vector3(-n.y, n.x, 0);
      a = project(observerGroup.position.clone().addScaledVector(tangent, -2.1));
      b = project(observerGroup.position.clone().addScaledVector(tangent, 2.1));
    }
    const visible = !coverOpen && state.horizon && Math.max(a.y, b.y) > 0 && Math.min(a.y, b.y) < dims.h;
    horizonOverlay.style.display = visible ? '' : 'none';
    horizonLabel.hidden = !visible;
    if (visible) {
      for (const path of horizonOverlay.children) path.setAttribute('d', `M ${a.x} ${a.y} L ${b.x} ${b.y}`);
      const anchor = inSky ? { x: dims.w * 0.22, y: a.y } : (a.y < b.y ? a : b);
      horizonLabel.style.left = `${Math.max(52, Math.min(dims.w - 52, anchor.x))}px`;
      horizonLabel.style.top = `${anchor.y - 12}px`;
    }
    positionButton('earth', new THREE.Vector3(), R + 0.25);
    positionButton('sun', sun.position, 1);
    positionButton('moon', moonGroup.position, 0.7);
    positionButton('observer', observerGroup.position.clone().addScaledVector(normal(), 0.4), 0.42);
  }
  let drag = null;
  for (const id of ['earth', 'moon']) {
    $(id).addEventListener('pointerdown', (e) => {
      if (coverOpen || inSky) return;
      drag = { id, x: e.clientX, y: e.clientY, moved: false };
      $(id).setPointerCapture(e.pointerId);
    });
    $(id).addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== id) return;
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 2) {
        drag.moved = true;
        // Follow the pointer around Earth's projected centre. Screen Y runs
        // downwards, so its signed angular change is the negative world turn.
        // This also works when the overview camera rotates for portrait mode.
        const centre = project(new THREE.Vector3());
        const before = { x: drag.x - centre.x, y: drag.y - centre.y };
        const after = { x: e.clientX - centre.x, y: e.clientY - centre.y };
        if (Math.hypot(before.x, before.y) > 12 && Math.hypot(after.x, after.y) > 12) {
          const delta = -Math.atan2(
            before.x * after.y - before.y * after.x,
            before.x * after.x + before.y * after.y,
          );
          if (id === 'earth') getModel().gesture('turn', delta);
        }
        drag.x = e.clientX;
        drag.y = e.clientY;
      }
    });
    $(id).addEventListener('pointerup', () => {
      if (drag && !drag.moved) {
        if (id === 'earth') getModel().gesture('turn', 0.2);
        else getModel().tap('moon');
      }
      drag = null;
    });
    $(id).addEventListener('pointercancel', () => (drag = null));
    $(id).addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (id === 'earth') getModel().gesture('turn', e.key === 'ArrowLeft' ? -0.15 : 0.15);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (id === 'earth') getModel().gesture('turn', 0.2);
        else getModel().tap('moon');
      }
    });
  }
  for (const id of ['sun', 'observer']) $(id).onclick = () => getModel().tap(id);
  $('replay').onclick = () => {
    animationStart = performance.now();
  };
  $('eye').onclick = () => getModel().control('set_view', { view: inSky ? 'space' : 'sky' });
  $('lookSun').onclick = () => ground.lookAtBody('sun', !reduced);
  $('lookMoon').onclick = () => ground.lookAtBody('moon', !reduced);
  let lookDrag = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (!inSky || coverOpen) return;
    lookDrag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!lookDrag || !inSky) return;
    ground.look(-(e.clientX - lookDrag.x) * 0.004, (e.clientY - lookDrag.y) * 0.003);
    lookDrag = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener('pointerup', () => (lookDrag = null));
  canvas.addEventListener('pointercancel', () => (lookDrag = null));
  canvas.addEventListener('keydown', (e) => {
    if (!inSky) return;
    const moves = {
      ArrowLeft: [-0.12, 0],
      ArrowRight: [0.12, 0],
      ArrowUp: [0, 0.08],
      ArrowDown: [0, -0.08],
    };
    if (moves[e.key]) {
      e.preventDefault();
      ground.look(...moves[e.key]);
    } else if (e.key === 'Escape') getModel().control('set_view', { view: 'space' });
  });
  let last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (t - last < 1000 / 30) return;
    last = t;
    if (!state) return;
    sun.userData.tick(reduced ? 0 : t * 0.001);
    explorer.userData.tick(0);
    if (coverOpen) {
      stage.render(overview);
      return;
    }
    const elapsed = reduced ? 5 : ((t - animationStart) / 1000) % 6;
    const phase =
      !state.rays || inSky
        ? 'none'
        : elapsed < 2.5
          ? 'sun_to_moon'
          : packets.length > 1
            ? 'moon_to_explorer'
            : 'blocked_by_earth';
    for (const [i, p] of packets.entries()) {
      const u = reduced ? 0.5 : Math.max(0, Math.min(1, (elapsed - i * 2.5) / 2.5));
      p.ball.scale.setScalar(dims.w <= 800 ? 2.4 : 1.4);
      p.ball.visible = reduced || (elapsed >= i * 2.5 && elapsed < (i + 1) * 2.5);
      p.ball.position.lerpVectors(p.a, p.b, u);
      // Reveal the second leg only after the first reaches the Moon.
      p.beam.visible = reduced || elapsed >= i * 2.5;
    }
    // Help with the horizon keeps its own instruction; the rays may still be on
    // from an earlier check.
    if (state.mode === 'demonstration' && state.rays && !inSky && state.moment !== 'horizon') {
      $('instruction').textContent = reduced
        ? packets.length > 1
          ? 'Sun → Moon → our eyes.'
          : 'Sun → Moon. Earth blocks the view.'
        : phase === 'sun_to_moon'
          ? 'Sunlight travels to the Moon.'
          : phase === 'moon_to_explorer'
            ? 'The Moon reflects light towards our eyes.'
            : 'Earth blocks the light from reaching our explorer.';
      focusSun.visible = phase === 'sun_to_moon';
      focusMoon.visible = phase === 'moon_to_explorer';
      focusObserver.visible = phase === 'blocked_by_earth';
    }
    if (phase !== animationPhase) {
      animationPhase = phase;
      onVisualChange();
    }
    if (inSky) {
      ground.tick(reduced ? 0 : t * 0.001);
      ground.render();
    } else stage.render(overview);
    layout();
  }
  window.addEventListener('resize', () => {
    resize();
    layout();
  });
  resize();
  requestAnimationFrame(frame);
  return {
    update,
    presentation: () => ({
      ...(state ? tutorView(state) : {}),
      view: inSky ? 'sky' : 'space',
      lightSegments: packets.length,
      animationPhase,
      mode: state?.mode,
      coverOpen,
      horizonMarker: {
        shown: !horizonLabel.hidden && !coverOpen,
        appearance: 'Rose-colored line labeled Horizon, distinct from the light rays',
        meaning: inSky ? 'Zero-altitude boundary between sky above and ground below' : 'Line through the explorer tangent to Earth; the sky is on the side away from Earth',
        designation: 'Refer to the rose-colored line labeled Horizon. If not shown, use show_moment horizon before pointing it out; in sky view it may be outside the camera when looking up or down.',
      },
      sky: ground.snapshot(),
      instruction: $('instruction').textContent,
      modelLimits:
        'Illustrative horizon and reflection model; not a prediction of real sky visibility.',
    }),
  };
}
