// The block of unit cubes on a table, drawn on the shared stage.
//
// This file draws snapshots and reports gestures. It never scores a plan: the
// model (model/cubes.mjs) owns every count.
import { THREE, createStage, toon, flat, solid, unlined, PALETTE } from '/sdk/stage.mjs';
import { table } from '/sdk/props.mjs';
import { box } from '/sdk/shapes.mjs';

// One colour per layer, so a layer reads as one thing; the accent marks the
// cube or cubes the tutor is talking about.
const LAYERS = [PALETTE.ten, PALETTE.unit, PALETTE.hundred];
const ACCENT = PALETTE.part;
const VIEW = new THREE.Vector3(9, 13, 12).normalize();

export function createCubeScene({ canvas, onPlace, onRotate, onOpen }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = createStage(canvas, { setting: 'tabletop' });
  stage.setSun(new THREE.Vector3(-3, 9, 5), { reach: 14 });
  const camera = new THREE.PerspectiveCamera(20, 1, 1, 300);
  stage.scene.add(table());

  // Everything that turns with the block.
  const root = new THREE.Group();
  stage.scene.add(root);
  const board = solid(new THREE.CylinderGeometry(5, 5.12, 0.24, 72), toon(PALETTE.paper), root);
  // Clear of the table: two surfaces at one height flicker.
  board.position.y = 0.13;
  const cubes = new THREE.Group(),
    guide = new THREE.Group();
  cubes.position.y = guide.position.y = 0.24;
  root.add(cubes, guide);

  const cubeShape = box(0.94, 0.94, 0.94, 0.1),
    layerPaint = LAYERS.map((c) => toon(c)),
    accentPaint = toon(ACCENT),
    // A place still to be filled: a faint, unoutlined cube.
    ghostShape = new THREE.BoxGeometry(0.9, 0.9, 0.9).translate(0, 0.45, 0),
    ghostPaint = flat('#8d8672', { transparent: true, opacity: 0.16, depthWrite: false }),
    ghostEdges = new THREE.EdgesGeometry(ghostShape),
    ghostLine = new THREE.LineBasicMaterial({ color: '#6f6a5b', transparent: true, opacity: 0.6 }),
    guideLine = new THREE.LineBasicMaterial({ color: '#5d5a4c', transparent: true, opacity: 0.4 });

  let state,
    parts = [],
    angle = 0,
    targetAngle = 0,
    spread = 0,
    targetSpread = 0,
    drag = null,
    cover = true,
    lastKey = '',
    lastScene = '',
    previousDepth = 3,
    grow = 1;

  const empty = (group) => {
    for (const o of [...group.children]) {
      group.remove(o);
      if (o.userData.own) o.geometry.dispose();
    }
  };
  function makeCube(x, y, z, ghost) {
    let cube;
    if (ghost) {
      cube = new THREE.Mesh(ghostShape, ghostPaint);
      cube.add(new THREE.LineSegments(ghostEdges, ghostLine));
      unlined(cube);
    } else cube = solid(cubeShape, layerPaint[y % layerPaint.length]);
    cube.userData = { x, y, z, ghost };
    return cube;
  }
  function rebuild() {
    empty(cubes);
    empty(guide);
    parts = [];
    const [w, d, h] = state.dims,
      radius = Math.max(w, d) * 0.65 + 0.55;
    board.scale.set(radius / 5, 1, radius / 5);
    for (let y = 0; y < h; y++)
      for (let z = 0; z < d; z++)
        for (let x = 0; x < w; x++) {
          if (state.mode === 'fill' && y > 0) continue;
          const cube = makeCube(x, y, z, state.mode === 'fill' && !state.filled.has(`${x},${z}`));
          cube.position.set(x - (w - 1) / 2, y, z - (d - 1) / 2);
          cubes.add(cube);
          parts.push(cube);
        }
    canvas.setAttribute(
      'aria-label',
      `A ${state.mode === 'fill' ? 'partly filled' : 'completely filled'} rectangular box of equal unit cubes. It has ${w} cubes across, ${d} rows back and ${h} layers high.`,
    );
    // While building, the space still to fill is drawn as a faint box.
    if (state.building) {
      const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(w + 0.14, h + 0.1, d + 0.14)),
        guideLine,
      );
      frame.position.y = h / 2;
      frame.userData.own = true;
      guide.add(unlined(frame));
    }
    resize();
  }

  function update(snapshot, isCover = false) {
    const s = snapshot.state;
    cover = isCover;
    const key = JSON.stringify([s.sceneId, s.dims, s.filled, cover]);
    state = {
      ...s,
      dims: cover ? [3, 3, 3] : s.dims,
      mode: s.building && !s.layerComplete ? 'fill' : 'explore',
      filled: new Set(s.filled),
    };
    targetAngle = cover ? -0.25 : s.rotation;
    targetSpread = cover ? 0.22 : s.layersOpen ? 1 : 0;
    if (key !== lastKey) {
      // Back rows added to the same block grow in; anything else just appears.
      grow = s.dims[1] > previousDepth && s.sceneId === lastScene ? 0 : 1;
      previousDepth = s.dims[1];
      lastScene = s.sceneId;
      rebuild();
      lastKey = key;
    }
  }

  // Places the camera so the block, opened or closed, fills the part of the
  // screen the words and buttons leave free.
  function frameScene() {
    const w = innerWidth,
      h = innerHeight,
      narrow = w <= 800;
    const words = document.getElementById('explanation')?.getBoundingClientRect() ?? { bottom: 170 },
      plan = document.getElementById('plan-controls'),
      actions = document.getElementById('actions');
    const top = cover ? (narrow ? h * 0.38 : 65) : narrow ? words.bottom + 18 : 90;
    const bottom = cover
      ? h * 0.87
      : Math.min(
          h - (narrow ? 150 : 140),
          !plan.hidden && narrow ? plan.getBoundingClientRect().top - 15 : h,
          !actions.hidden && narrow ? actions.getBoundingClientRect().top - 15 : h,
        );
    const left = cover ? (narrow ? 15 : w * 0.47) : narrow ? 15 : w * 0.43,
      right = w - (narrow ? 15 : 40),
      room = { width: Math.max(80, right - left), height: Math.max(100, bottom - top) };

    const [bw, bd, bh] = state.dims,
      r = Math.max(bw, bd) * 0.65 + 0.55,
      lift = 0.24 + bh + spread * (bh - 1) * 2,
      points = [];
    for (const x of [-bw / 2, bw / 2])
      for (const z of [-bd / 2, bd / 2]) for (const y of [0.24, lift]) points.push(new THREE.Vector3(x, y, z));
    for (let i = 0; i < 8; i++)
      points.push(new THREE.Vector3(r * Math.cos((i * Math.PI) / 4), 0, r * Math.sin((i * Math.PI) / 4)));
    root.updateMatrixWorld(true);
    const world = points.map((p) => root.localToWorld(p)),
      centre = new THREE.Vector3(0, root.position.y + lift / 2, 0);
    const bounds = () => {
      const ps = world.map((p) => p.clone().project(camera));
      return {
        x0: Math.min(...ps.map((p) => ((p.x + 1) * w) / 2)),
        x1: Math.max(...ps.map((p) => ((p.x + 1) * w) / 2)),
        y0: Math.min(...ps.map((p) => ((1 - p.y) * h) / 2)),
        y1: Math.max(...ps.map((p) => ((1 - p.y) * h) / 2)),
      };
    };
    camera.clearViewOffset();
    camera.aspect = w / h;
    let distance = 40,
      b;
    for (let i = 0; i < 4; i++) {
      camera.position.copy(centre).addScaledVector(VIEW, distance);
      camera.lookAt(centre);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld();
      b = bounds();
      // Never closer than a small block needs: a 2 by 2 by 2 should not fill the screen.
      distance = Math.max(26, distance * Math.max((b.x1 - b.x0) / room.width, (b.y1 - b.y0) / room.height));
    }
    camera.position.copy(centre).addScaledVector(VIEW, distance);
    camera.updateMatrixWorld();
    b = bounds();
    camera.setViewOffset(w, h, (b.x0 + b.x1) / 2 - (left + right) / 2, (b.y0 + b.y1) / 2 - (top + bottom) / 2, w, h);
    camera.updateProjectionMatrix();
  }
  function resize() {
    stage.resize(innerWidth, innerHeight);
    if (state) frameScene();
  }

  const ray = new THREE.Raycaster(),
    pointer = new THREE.Vector2();
  ray.layers.enableAll();
  function hit(e) {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, (-(e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    return ray.intersectObjects(cubes.children, false)[0]?.object;
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (cover) return;
    drag = { x: e.clientX, startX: e.clientX, startY: e.clientY, cube: hit(e), opened: state.layersOpen };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag || state.mode === 'fill') return;
    const dx = e.clientX - drag.x,
      dy = e.clientY - drag.startY;
    // A drag mostly up or down opens or closes the layers; sideways turns the block.
    if (Math.abs(dy) > 35 && Math.abs(dy) > Math.abs(e.clientX - drag.startX)) {
      const opened = dy < 0;
      if (opened !== drag.opened) {
        onOpen(opened);
        drag.opened = opened;
      }
    } else onRotate(dx * 0.008);
    drag.x = e.clientX;
  });
  canvas.addEventListener('pointerup', (e) => {
    const tapped = drag && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 12;
    if (tapped && drag.cube && state.mode === 'fill') onPlace(drag.cube.userData.x, drag.cube.userData.z);
    drag = null;
  });
  canvas.addEventListener('pointercancel', () => (drag = null));
  canvas.addEventListener('keydown', (e) => {
    if (cover || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') onOpen(e.key === 'ArrowUp');
    else onRotate(e.key === 'ArrowRight' ? 0.2 : -0.2);
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!state) return;
    const ease = reduce ? 1 : 0.13;
    grow = Math.min(1, grow + (reduce ? 1 : 0.075));
    angle += (targetAngle - angle) * ease;
    spread += (targetSpread - spread) * ease;
    root.rotation.y = angle;
    const [w, d, h] = state.dims,
      seconds = performance.now() / 1000;
    for (const cube of parts) {
      const { x, y, z, ghost } = cube.userData;
      cube.position.y = y + y * spread * 2;
      if (ghost) continue;
      const inside =
        state.focus === 'inside' && spread > 0.3 && x > 0 && z > 0 && y > 0 && x < w - 1 && z < d - 1 && y < h - 1;
      const unit = state.focus === 'unit' && x === w - 1 && z === d - 1 && y === 0;
      const layer = state.focus === 'layers' && y === 0;
      cube.material = inside || unit ? accentPaint : layerPaint[y % layerPaint.length];
      const pulse = !reduce && (inside || unit || layer) ? 1 + Math.sin(seconds * 2.2) * 0.018 : 1;
      cube.scale.setScalar(grow < 1 && z === d - 1 ? Math.max(0.01, grow) : pulse);
    }
    frameScene();
    stage.render(camera);
  }
  addEventListener('resize', resize);
  resize();
  animate();

  return {
    update,
    presentation: () => ({
      view: 'block',
      layersVisible: spread > 0.9,
      rotation: angle,
      cubeCount: parts.filter((c) => !c.userData.ghost).length,
      fullyBuriedCubes: state?.interiorCount ?? 0,
      highlightedUnit: state?.focus === 'unit',
      highlightedLayer: state?.focus === 'layers',
      highlightedInterior: state?.focus === 'inside' && (state?.interiorCount ?? 0) > 0,
      landscape: false,
    }),
    stats: () => ({ calls: stage.renderer.info.render.calls, triangles: stage.renderer.info.render.triangles }),
    // Where a point of the block is on screen, in CSS pixels.
    project: (x, y, z) => {
      const p = root.localToWorld(new THREE.Vector3(x, y + 0.24, z)).project(camera);
      return { x: ((p.x + 1) * innerWidth) / 2, y: ((1 - p.y) * innerHeight) / 2 };
    },
  };
}
