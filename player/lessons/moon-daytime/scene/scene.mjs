import { questionFor, tutorView } from '../model/moon.mjs';
import * as THREE from '../vendor/three.module.min.js';
import { createSunVisual, createSpaceBackground } from './space-visuals.mjs';
import { createEarthVisual, createExplorerVisual } from './world-visuals.mjs';
import { createGroundView } from './ground-view.mjs';
import { R, ORBIT, facts } from '../model/geometry.mjs';
export function createScene(getModel, onVisualChange = () => {}) {
  const $ = (id) => document.getElementById(id),
    canvas = $('world');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const show = (id, on) => ($(id).hidden = !on);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch {
    $('instruction').textContent = 'This device needs WebGL to show the Moon model.';
    for (const id of ['earth', 'sun', 'moon', 'observer']) show(id, false);
    throw new Error('WebGL unavailable');
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b1726');
  const overview = new THREE.OrthographicCamera();
  overview.position.set(0, 0, 24);
  overview.lookAt(0, 0, 0);
  scene.add(new THREE.AmbientLight(0x8cabcb, 0.09));
  const sunlight = new THREE.PointLight(0xfff3d7, 3.2, 0, 0);
  sunlight.position.set(-6.3, 0, 0);
  scene.add(sunlight);
  function mesh(geo, mat, parent = scene) {
    const m = new THREE.Mesh(geo, mat);
    parent.add(m);
    return m;
  }
  function standard(color, extra = {}) {
    return new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...extra });
  }
  const globe = createEarthVisual(R);
  const earthGroup = globe.root;
  scene.add(earthGroup);
  const earth = globe.surface;
  // Kept as a visibility hook for existing presentation states; the globe has a clean ink silhouette.
  const atmosphere = new THREE.Group();
  scene.add(atmosphere);
  const moonGroup = new THREE.Group();
  scene.add(moonGroup);
  function moonTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#c4c7c9';
    ctx.fillRect(0, 0, 512, 256);
    let seed = 43;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 180; i++) {
      const x = rand() * 512,
        y = rand() * 256,
        r = 2 + rand() * 12;
      ctx.fillStyle = i % 7 === 0 ? '#939a9f' : '#a9afb3';
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e3e4df';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(x, y, r, 0.3, 2.9);
      ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  const moon = mesh(
    new THREE.SphereGeometry(0.49, 64, 48),
    standard('#ffffff', { map: moonTexture() }),
    moonGroup,
  );
  const solar = createSunVisual(0.84);
  const sun = solar.root;
  sun.position.set(-6.3, 0, 0);
  scene.add(sun);
  const explorer = createExplorerVisual();
  const observerGroup = explorer.root;
  scene.add(observerGroup);
  // Rings and rays are scaffolds, never answer cues before an independent commitment.
  function ring(radius, color, opacity = 1) {
    const m = mesh(
      new THREE.TorusGeometry(radius, 0.012, 8, 128),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity }),
    );
    return m;
  }
  const turnRing = ring(R + 0.26, '#76a6be', 0.7);
  const orbitRing = ring(ORBIT, '#688497', 0.16);
  const focusSun = ring(1.03, '#ffe4a5');
  focusSun.position.copy(sun.position);
  const focusMoon = ring(0.67, '#ffe4a5');
  const focusObserver = ring(0.27, '#ffe4a5');
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
  const skyArc = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: '#9edbf6', transparent: true, opacity: 0.28 }),
  );
  scene.add(skyArc);
  const spaceBackground = createSpaceBackground();
  const stars = spaceBackground.root;
  scene.add(stars);
  const rayGroup = new THREE.Group();
  scene.add(rayGroup);
  const packets = [];
  function clearRays() {
    while (rayGroup.children.length) {
      const child = rayGroup.children[0];
      child.geometry?.dispose();
      child.material?.dispose();
      rayGroup.remove(child);
    }
    packets.length = 0;
  }
  function addRay(from, to, color) {
    const a = from.clone(),
      b = to.clone();
    a.z = 0.2;
    b.z = 0.2;
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([a, b]),
      new THREE.LineDashedMaterial({
        color,
        dashSize: 0.12,
        gapSize: 0.08,
        transparent: true,
        opacity: 0.75,
      }),
    );
    line.computeLineDistances();
    rayGroup.add(line);
    const ball = mesh(
      new THREE.SphereGeometry(0.055, 12, 8),
      new THREE.MeshBasicMaterial({ color }),
      rayGroup,
    );
    packets.push({ a, b, ball });
  }
  const ground = createGroundView({ moonMap: moon.material.map });
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
    renderer.setSize(dims.w, dims.h);
    spaceBackground.resize(Math.min(devicePixelRatio, 2));
    const aspect = dims.w / dims.h,
      portrait = aspect < 0.8;
    const half = portrait ? 7.5 / aspect : Math.max(6.15, 8 / aspect);
    overview.left = -half * aspect;
    overview.right = half * aspect;
    overview.top = half;
    overview.bottom = -half;
    overview.near = 0.1;
    overview.far = 150;
    overview.position.set(portrait ? -2.7 : 0, portrait ? 0 : 0.45, 24);
    overview.up.set(portrait ? 1 : 0, portrait ? 0 : 1, 0);
    overview.lookAt(portrait ? -2.7 : 0, portrait ? 0 : 0.45, 0);
    overview.updateProjectionMatrix();
    overview.updateMatrixWorld();
    ground.resize(dims.w, dims.h);
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
  const openingScene = new THREE.Scene();
  openingScene.background = new THREE.Color('#07101f');
  openingScene.add(stars.clone(true), new THREE.AmbientLight(0x8cabcb, 0.09));
  const openingLight = sunlight.clone();
  openingScene.add(openingLight);
  const openingEarth = earthGroup.clone(true);
  openingEarth.rotation.z = 0.45;
  openingScene.add(openingEarth);
  const openingMoon = moonGroup.clone(true);
  openingMoon.position.set(0.107, 5.149, 0);
  openingScene.add(openingMoon);
  const openingExplorer = observerGroup.clone(true);
  openingExplorer.position.set(-1.068, 1.081, 0.02);
  openingExplorer.rotation.z = 2.35 - Math.PI / 2;
  openingScene.add(openingExplorer);
  const openingArt = new THREE.Group();
  openingArt.add(openingEarth, openingMoon, openingExplorer);
  openingScene.add(openingArt);
  const openingCamera = new THREE.OrthographicCamera();
  function renderOpening() {
    const aspect = dims.w / dims.h,
      narrow = dims.w <= 800,
      width = narrow ? 7.8 : Math.max(14, 8.6 * aspect),
      height = width / aspect;
    openingArt.scale.setScalar(narrow ? 1.55 : 1);
    openingMoon.position.set(narrow ? 1.2 : 0.107, narrow ? 2.1 : 5.149, 0);
    openingCamera.left = -width / 2;
    openingCamera.right = width / 2;
    openingCamera.top = height / 2;
    openingCamera.bottom = -height / 2;
    openingCamera.near = 0.1;
    openingCamera.far = 150;
    openingCamera.position.set(narrow ? -0.3 : -3.1, 1.8, 24);
    openingCamera.lookAt(narrow ? -0.3 : -3.1, 1.8, 0);
    openingCamera.updateProjectionMatrix();
    renderer.render(openingScene, openingCamera);
  }
  let animationStart = 0,
    animationPhase = 'none';
  function update(snapshot, cover) {
    const previous = state;
    state = snapshot.state;
    coverOpen = cover;
    const wasSky = inSky;
    inSky = state.view === 'sky';
    $('lesson-ui').hidden = cover;
    const f = facts(state.theta, state.phi);
    earthGroup.rotation.z = state.theta - state.originTheta;
    moonGroup.position.set(...f.moon, 0);
    observerGroup.position.set(...f.observer, 0.02);
    observerGroup.rotation.z = state.theta - Math.PI / 2;
    const n = normal();
    skyArc.visible = false;
    turnRing.visible = state.canTurn;
    orbitRing.visible = state.canMoveMoon || state.task === 'prediction';
    focusSun.visible = focusMoon.visible = focusObserver.visible = false;
    focusMoon.position.copy(moonGroup.position);
    focusObserver.position.copy(observerGroup.position).addScaledVector(n, 0.25);
    for (const id of state.path) {
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
    show('resume', !cover && state.mode === 'demonstration' && state.task !== 'demonstration');
    show('replay', !cover && state.mode === 'demonstration' && state.rays && !inSky);
    show('earth', !cover && !inSky && state.canTurn);
    show('sun', !cover && !inSky && state.task === 'path' && state.mode === 'activity');
    show(
      'moon',
      !cover &&
        !inSky &&
        (state.canMoveMoon || (state.task === 'path' && state.mode === 'activity')),
    );
    show('observer', !cover && !inSky && state.task === 'path' && state.mode === 'activity');
    $('moon-label').textContent = state.canMoveMoon ? 'Move Moon' : 'Moon';
    $('eye').textContent = inSky ? '↗ Back to space' : '↘ See the sky';
    // A prediction can still request help via the tutor; the normal reveal follows commitment.
    show('eye', !cover && (state.task !== 'prediction' || state.revealed || state.assisted));
    show('lookTools', !cover && inSky);
    show('choices', !cover && ['prediction', 'daylight'].includes(state.task) && state.canAnswer);
    const check = questionFor(state);
    $('yes').textContent = check?.choices[0] ?? 'Yes';
    $('no').textContent = check?.choices[1] ?? 'No';
    show('pathTools', !cover && state.task === 'path' && state.canAnswer);
    show('hint', !cover && state.task !== 'explore' && state.canAnswer);
    $('check-path').disabled = state.path.length !== 3;
    $('path-order').textContent =
      state.path.map((x) => ({ sun: 'Sun', moon: 'Moon', observer: 'Explorer' })[x]).join(' → ') ||
      'Choose the first object';
    canvas.tabIndex = inSky ? 0 : -1;
    canvas.setAttribute(
      'aria-label',
      inSky
        ? 'The explorer’s sky. Drag or use arrow keys to look around.'
        : 'An illustrative model of Earth, Sun, Moon and an explorer.',
    );
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
    positionButton('observer', observerGroup.position.clone().addScaledVector(normal(), 0.3), 0.3);
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
          if (id === 'earth') getModel().learnerTurn(delta);
          else getModel().learnerMoon(delta);
        }
        drag.x = e.clientX;
        drag.y = e.clientY;
      }
    });
    $(id).addEventListener('pointerup', () => {
      if (drag && !drag.moved) {
        if (id === 'earth') getModel().learnerTurn(0.2);
        else if (state.task === 'path') getModel().learnerTap('moon');
        else getModel().learnerMoon(0.2);
      }
      drag = null;
    });
    $(id).addEventListener('pointercancel', () => (drag = null));
    $(id).addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        getModel()[id === 'earth' ? 'learnerTurn' : 'learnerMoon'](
          e.key === 'ArrowLeft' ? -0.15 : 0.15,
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (id === 'earth') getModel().learnerTurn(0.2);
        else if (state.task === 'path') getModel().learnerTap('moon');
        else getModel().learnerMoon(0.2);
      }
    });
  }
  for (const id of ['sun', 'observer']) $(id).onclick = () => getModel().learnerTap(id);
  $('resume').onclick = () => getModel().learnerResume();
  $('replay').onclick = () => {
    animationStart = performance.now();
  };
  $('eye').onclick = () => getModel().learnerView(inSky ? 'space' : 'sky');
  $('yes').onclick = () => getModel().learnerPredict(true);
  $('no').onclick = () => getModel().learnerPredict(false);
  $('hint').onclick = () => getModel().learnerHint();
  $('clear-path').onclick = () => getModel().learnerClear();
  $('check-path').onclick = () => getModel().learnerCheckPath();
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
    } else if (e.key === 'Escape') getModel().learnerView('space');
  });
  let last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (t - last < 1000 / 30) return;
    last = t;
    if (coverOpen) {
      renderOpening();
      return;
    }
    if (!state) return;
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
      p.ball.scale.setScalar(dims.w <= 800 ? 3 : 1.6);
      p.ball.visible = reduced || (elapsed >= i * 2.5 && elapsed < (i + 1) * 2.5);
      p.ball.position.lerpVectors(p.a, p.b, u);
      // Reveal the second leg only after the first reaches the Moon.
      rayGroup.children[i * 2].visible = reduced || elapsed >= i * 2.5;
    }
    if (state.mode === 'demonstration' && state.rays && !inSky) {
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
    solar.tick(reduced ? 0 : t * 0.001);
    if (inSky) {
      ground.tick(reduced ? 0 : t * 0.001);
      renderer.render(ground.scene, ground.camera);
    } else renderer.render(scene, overview);
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
      learnerCanDo: !state
        ? []
        : state.mode === 'demonstration'
          ? [
              'Look and describe what is shown',
              ...(state.task !== 'demonstration'
                ? ['Try it: return to the same supported activity']
                : []),
            ]
          : state.task === 'explore'
            ? ['Drag Turn Earth (or use arrow keys)', 'See the sky to check the observer’s view']
            : state.task === 'daylight'
              ? ['Choose Day or Night for the explorer']
            : state.task === 'prediction'
              ? ['Answer the displayed question with Yes or No, by voice or button']
              : ['Tap Sun, Moon and Explorer in chosen order', 'Clear draft', 'Check the journey'],
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
