// The shared 3D stage: Marble's look for any lesson scene.
//
// Flat colour with two cool shade steps, hairline dark outlines found from depth
// and surface-direction edges, cast shadows and a soft gradient sky. A lesson
// builds its own objects with `toon`, `flat` and `solid` and asks the stage to
// draw them, so every lesson shares one look and improves when this file does.
//
// Lessons must take THREE from here, not from a copy of their own: objects made
// by two copies of the library do not work together.
import * as THREE from './three/r180/three.module.min.js';
export { THREE };

// Objects on this layer are drawn but never outlined: sky, glows, mist, light
// rays, a rainbow. Use `unlined(object)`.
export const NO_OUTLINE = 1;

// The palette sampled from the game. Start from these; add a colour only when
// the subject needs one, and keep it as muted as its neighbours.
export const PALETTE = {
  grass: '#83a653',
  grassDark: '#78985b',
  hill: '#89a66a',
  leaf: '#6f9f49',
  leafLight: '#a2bc5b',
  leafDark: '#5a883e',
  leafGold: '#c9a544',
  pine: '#397461',
  pineLight: '#579276',
  willow: '#98b15b',
  trunk: '#70513b',
  birch: '#e4dec2',
  sand: '#dfce8b',
  stone: '#b9b5a3',
  stoneLight: '#d4ceb0',
  paving: '#b9b9a7',
  wall: '#ebd9b2',
  roof: '#bd6441',
  roofSlate: '#718c86',
  mountain: '#8ca7a4',
  mountainNear: '#6b8b81',
  snow: '#e3e6d6',
  wood: '#8b7451',
  terracotta: '#ae5e55',
  water: '#6aa9d6',
  sea: '#4a6fae',
  navy: '#4568a8',
  skin: '#e9c4a4',
  cream: '#ece8df',
  cloud: '#f7fdfd',
  // Sea
  seaSand: '#c5bf98',
  seaRock: '#668d88',
  seaRockLight: '#8fa69a',
  kelp: '#9aab42',
  kelpGold: '#b4a146',
  kelpStem: '#839342',
  seagrass: '#80bd74',
  fur: '#70503c',
  furLight: '#bc9873',
  muzzle: '#f2dab1',
  urchin: '#855999',
  fish: '#ee9850',
  fin: '#e9c678',
  crab: '#d58d59',
  seaStar: '#e4a060',
  mussel: '#374d70',
  // Space
  ocean: '#468fab',
  land: '#b9c888',
  ice: '#e6eee2',
  moon: '#b9b6ae',
  moonDark: '#8d8a86',
  // Tabletop
  paper: '#f4efe4',
  table: '#d9c9a8',
  unit: '#e9b44c',
  ten: '#5fa8a0',
  hundred: '#6f8fc9',
  part: '#e07a5f',
  metal: '#8f99a8',
  ink: '#1d1a26',
};
export const SKY = {
  clear: { top: '#4f9bcb', mid: '#66abd3', horizon: '#b4d8e8' },
  overcast: { top: '#a9b6c4', mid: '#c3ccd6', horizon: '#dfe4ea' },
};

// A setting is the world a scene lives in: its backdrop, air, light and the
// colour of its outlines. Pick one with createStage(canvas, { setting }).
//   shade     what full shade multiplies a surface colour by
//   ink       outline colour: the darkest tone of that world, never pure black
//   fog       [colour, near, far], or none
//   lineFade  distance over which outlines thin out and vanish
//   backdrop  'sky' (a gradient dome), or a screen-filling picture
//   hardLight one sharp edge between lit and unlit, with no half shade
export const SETTINGS = {
  // Open country under a blue sky, with far things paling into the haze.
  daylight: {
    backdrop: 'sky',
    ink: '#16211d',
    shade: [0.62, 0.66, 0.74],
    fog: ['#9abdc2', 180, 3400],
    lineFade: [140, 900],
  },
  // Teal water lit from above right, with slanting shafts of light.
  underwater: {
    backdrop: 'water',
    ink: '#102d30',
    shade: [0.5, 0.66, 0.7],
    fog: ['#207b80', 45, 95],
    lineFade: [45, 90],
  },
  // Near-black space. Sunlight is hard: the unlit side is almost dark.
  space: {
    backdrop: 'space',
    ink: '#0b1626',
    shade: [0.03, 0.04, 0.06],
    hardLight: true,
    lineFade: [200, 600],
    stars: true,
  },
  // A plain surface for maths and bench science, with nothing else to look at.
  tabletop: { backdrop: 'paper', ink: '#2a2622', shade: [0.7, 0.71, 0.78], lineFade: [80, 240] },
};
const BACKDROPS = {
  water: `vec2 c = uv_ - vec2(0.72, 1.2); float r = length(c * vec2(1.0, 0.8));
    vec3 col = mix(vec3(0.635, 0.875, 0.714), vec3(0.212, 0.561, 0.569), smoothstep(0.0, 0.42, r));
    col = mix(col, vec3(0.094, 0.357, 0.42), smoothstep(0.42, 0.88, r));
    col = mix(col, vec3(0.063, 0.239, 0.314), smoothstep(0.88, 1.4, r));
    float d = uv_.x * 0.92 + uv_.y * 0.39;
    float shafts = smoothstep(0.02, 0.0, abs(d - 0.62) - 0.02) * 0.09
      + smoothstep(0.02, 0.0, abs(d - 0.78) - 0.03) * 0.1 + smoothstep(0.02, 0.0, abs(d - 0.98) - 0.02) * 0.06;
    col += vec3(0.86, 1.0, 0.82) * shafts * smoothstep(0.0, 0.5, uv_.y);`,
  space: `vec2 p = uv_ - 0.5;
    float haze = 0.5 + 0.25 * sin(uv_.x * 13.0 + sin(uv_.y * 9.0)) + 0.15 * cos(uv_.y * 17.0 + uv_.x * 3.0);
    float band = exp(-pow((p.y - p.x * 0.45 - 0.05) * 5.0, 2.0));
    vec3 col = vec3(0.012, 0.024, 0.052) + vec3(0.012, 0.019, 0.037) * haze * band
      + vec3(0.004, 0.009, 0.015) * (1.0 - smoothstep(0.15, 0.7, length(p)));`,
  paper: `vec3 col = mix(vec3(0.89, 0.86, 0.79), vec3(0.957, 0.937, 0.894), smoothstep(0.0, 0.9, uv_.y));
    col *= 1.0 - 0.07 * smoothstep(0.35, 0.85, length(uv_ - 0.5));`,
};
const srgbToLinear = 'col = pow(col, vec3(2.2));';

// Lit, half shade, full shade: full shade below the terminator, a narrow half band.
const ramp = new THREE.DataTexture(
  new Uint8Array([0, 0, 0, 0, 128, 255, 255, 255]),
  8,
  1,
  THREE.RedFormat,
);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
ramp.needsUpdate = true;

// A shaded surface, and an unshaded one for things that give off or are light.
export const toon = (color, extra = {}) =>
  new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...extra });
export const flat = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });

// An outlined object that casts and receives shadow.
export function solid(geometry, material, parent) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = mesh.receiveShadow = true;
  parent?.add(mesh);
  return mesh;
}
// Takes an object and everything inside it out of the outline pass.
export function unlined(object) {
  object.traverse((o) => o.layers.set(NO_OUTLINE));
  return object;
}

// The shading steps belong to whichever stage is drawing: a lesson with two
// settings (space and the ground, say) has two stages, and each sets the ramp
// to its own before it draws.
function useRamp(hard) {
  if (ramp.userData.hard === hard) return;
  ramp.userData.hard = hard;
  ramp.image.data.set(hard ? [0, 0, 0, 0, 255, 255, 255, 255] : [0, 0, 0, 0, 128, 255, 255, 255]);
  ramp.needsUpdate = true;
}

// `share` is another stage on the same canvas: the new stage draws with that
// stage's renderer instead of making its own, so a lesson can keep a second
// scene in a different setting and draw whichever one is on show.
export function createStage(canvas, { setting = 'daylight', share } = {}) {
  const world = typeof setting === 'string' ? SETTINGS[setting] : setting;
  if (!world) throw Error('Unknown setting: ' + setting);
  const SHADE = world.shade;
  useRamp(!!world.hardLight);
  const renderer = share?.renderer ?? new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.autoClear = false;
  const scene = new THREE.Scene();
  if (world.fog) scene.fog = new THREE.Fog(world.fog[0], world.fog[1], world.fog[2]);

  // Shade is the surface colour times a cool tint; sunlight adds the rest.
  const ambient = new THREE.AmbientLight('#ffffff', Math.PI);
  const sun = new THREE.DirectionalLight('#ffffff', Math.PI);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.05;
  scene.add(ambient, sun, sun.target);
  // `sunlight` 1 is full sun; 0 leaves everything in even shade, as under cloud.
  function setLight({ sunlight = 1, shade = SHADE } = {}) {
    ambient.color.setRGB(...shade);
    sun.color.setRGB(...shade.map((s) => (1 - s) * sunlight));
  }
  setLight();
  // `direction` points from the scene towards the Sun. Shadows are computed for
  // `reach` units around `centre`.
  function setSun(direction, { centre = new THREE.Vector3(), reach = 40 } = {}) {
    sun.position.copy(centre).addScaledVector(direction.clone().normalize(), 120);
    sun.target.position.copy(centre);
    Object.assign(sun.shadow.camera, {
      left: -reach,
      right: reach,
      top: reach,
      bottom: -reach,
      near: 1,
      far: 300,
    });
    // A wider reach spreads the shadow map thinner; keep surfaces from shading themselves.
    sun.shadow.normalBias = Math.max(0.05, (reach / 1024) * 3);
    sun.shadow.camera.updateProjectionMatrix();
  }
  setSun(new THREE.Vector3(0.35, 0.6, 0.7));

  const skyColours = {
    top: { value: new THREE.Color() },
    mid: { value: new THREE.Color() },
    horizon: { value: new THREE.Color() },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      uniforms: skyColours,
      vertexShader:
        'varying vec3 d; void main(){ d = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: `uniform vec3 top, mid, horizon; varying vec3 d;
        void main(){
          float h = clamp(normalize(d).y, 0.0, 1.0);
          vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h));
          c = mix(c, top, smoothstep(0.18, 0.75, h));
          gl_FragColor = vec4(c, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.renderOrder = -1000;
  sky.frustumCulled = false;
  sky.layers.set(NO_OUTLINE);
  if (world.backdrop === 'sky') scene.add(sky);
  else {
    const picture = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        depthWrite: false,
        depthTest: false,
        vertexShader:
          'varying vec2 uv_; void main(){ uv_ = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }',
        fragmentShader: `varying vec2 uv_; void main(){ ${BACKDROPS[world.backdrop]} ${srgbToLinear} gl_FragColor = vec4(col, 1.0); }`,
      }),
    );
    picture.renderOrder = -1000;
    picture.frustumCulled = false;
    picture.layers.set(NO_OUTLINE);
    scene.add(picture);
  }
  let stars = null;
  if (world.stars) {
    let seed = 219;
    const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
    const position = [],
      size = [],
      colour = [];
    for (let i = 0; i < 2600; i++) {
      const z = random() * 2 - 1,
        a = random() * Math.PI * 2,
        r = Math.sqrt(1 - z * z);
      position.push(Math.cos(a) * r, z, Math.sin(a) * r);
      const bright = random();
      size.push(bright > 0.985 ? 4.2 : bright > 0.86 ? 2.6 : 1.5);
      const dim = bright > 0.86 ? 0.95 : 0.45 + random() * 0.3,
        warm = random() < 0.16;
      colour.push(dim, dim * (warm ? 0.86 : 0.95), dim * (warm ? 0.68 : 1));
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
    geometry.setAttribute('starSize', new THREE.Float32BufferAttribute(size, 1));
    geometry.setAttribute('starColour', new THREE.Float32BufferAttribute(colour, 3));
    stars = new THREE.Points(
      geometry,
      new THREE.ShaderMaterial({
        uniforms: { ratio: { value: 1 } },
        transparent: true,
        depthWrite: false,
        vertexShader:
          'attribute float starSize; attribute vec3 starColour; uniform float ratio; varying vec3 c; void main(){ c = starColour; gl_PointSize = starSize * ratio; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader:
          'varying vec3 c; void main(){ float r = length(gl_PointCoord * 2.0 - 1.0); if (r > 1.0) discard; gl_FragColor = vec4(c, 1.0 - smoothstep(0.1, 1.0, r)); }',
      }),
    );
    stars.renderOrder = -999;
    stars.frustumCulled = false;
    stars.layers.set(NO_OUTLINE);
    scene.add(stars);
  }
  // Colours as { top, mid, horizon }; `blend` moves part of the way there.
  function setSky(colours = SKY.clear, blend = 1) {
    for (const key of ['top', 'mid', 'horizon'])
      skyColours[key].value.lerp(new THREE.Color(colours[key]), blend);
  }
  setSky();

  // A colour pass, a pass holding the surface direction and depth of the
  // outlined objects, then ink drawn where either jumps.
  // One pair of targets per drawing size, so a main view and an inset view do
  // not reallocate each other's every frame.
  const targets = new Map();
  function targetsFor(w, h) {
    const key = w + 'x' + h;
    let t = targets.get(key);
    if (!t) {
      if (targets.size >= 4) {
        const [oldest, old] = targets.entries().next().value;
        old.colour.depthTexture.dispose();
        old.colour.dispose();
        old.normals.depthTexture.dispose();
        old.normals.dispose();
        targets.delete(oldest);
      }
      const colour = new THREE.WebGLRenderTarget(w, h, { samples: 4, type: THREE.HalfFloatType });
      colour.depthTexture = new THREE.DepthTexture(w, h);
      const normals = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      });
      normals.depthTexture = new THREE.DepthTexture(w, h);
      targets.set(key, (t = { colour, normals }));
    }
    return t;
  }
  const normalMaterial = new THREE.MeshNormalMaterial();
  const ink = new THREE.ShaderMaterial({
    uniforms: {
      tColour: { value: null },
      tNormal: { value: null },
      tDepth: { value: null },
      tFront: { value: null },
      texel: { value: new THREE.Vector2() },
      thickness: { value: 1 },
      near: { value: 0.5 },
      far: { value: 600 },
      inkColour: { value: new THREE.Color(world.ink) },
      fade: { value: new THREE.Vector2(world.lineFade[0], world.lineFade[1]) },
    },
    vertexShader:
      'varying vec2 uv_; void main(){ uv_ = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D tColour, tNormal, tDepth, tFront; uniform vec2 texel, fade;
      uniform float thickness, near, far; uniform vec3 inkColour;
      varying vec2 uv_;
      float toEye(float d){ float z = d * 2.0 - 1.0; return 2.0 * near * far / (far + near - z * (far - near)); }
      float eyeDepth(vec2 uv){ return toEye(texture2D(tDepth, uv).x); }
      vec3 normalAt(vec2 uv){ return texture2D(tNormal, uv).xyz * 2.0 - 1.0; }
      void main(){
        vec2 o = texel * thickness * 0.5;
        vec2 a = uv_ + o, b = uv_ - o, c = uv_ + vec2(o.x, -o.y), d = uv_ + vec2(-o.x, o.y);
        float da = eyeDepth(a), db = eyeDepth(b), dc = eyeDepth(c), dd = eyeDepth(d);
        float nearest = min(min(da, db), min(dc, dd));
        // A surface seen edge-on changes depth quickly without being an edge.
        float slope = 1.0 / max(abs(normalAt(uv_).z), 0.12);
        float depthEdge = (abs(da - db) + abs(dc - dd)) / nearest;
        depthEdge = smoothstep(0.035 * slope, 0.06 * slope, depthEdge);
        float normalEdge = smoothstep(0.6, 1.0,
          length(normalAt(a) - normalAt(b)) + length(normalAt(c) - normalAt(d)));
        float edge = max(depthEdge, normalEdge) * (1.0 - smoothstep(fade.x, fade.y, nearest));
        // Something drawn without an outline (a cloud, a light ray) is in front.
        if (toEye(texture2D(tFront, uv_).x) < nearest * 0.97) edge = 0.0;
        gl_FragColor = vec4(mix(texture2D(tColour, uv_).rgb, inkColour, edge * 0.8), 1.0);
        #include <colorspace_fragment>
      }`,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ink);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene().add(quad);
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const outlineLayers = new THREE.Layers();
  const size = { width: 1, height: 1, ratio: 1 };

  // Sizes in CSS pixels. Ordinary screens are drawn at one and a half times
  // their size and scaled down, which is what keeps the hairlines smooth there.
  function resize(width, height, ratio = Math.min(Math.max(devicePixelRatio, 1.5), 2)) {
    Object.assign(size, { width, height, ratio });
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    ink.uniforms.thickness.value = Math.max(1, 0.6 * ratio);
    if (stars) stars.material.uniforms.ratio.value = ratio;
  }

  // Draws the scene from `camera`. With `rect` ({ x, y, width, height } in CSS
  // pixels from the top left) it draws into that part of the canvas, for an
  // inset view; otherwise it fills the canvas. The camera's aspect is set here.
  function render(camera, rect) {
    const r = rect ?? { x: 0, y: 0, width: size.width, height: size.height };
    const w = Math.max(1, Math.round(r.width * size.ratio)),
      h = Math.max(1, Math.round(r.height * size.ratio));
    const { colour, normals } = targetsFor(w, h);
    ink.uniforms.tColour.value = colour.texture;
    ink.uniforms.tNormal.value = normals.texture;
    ink.uniforms.tDepth.value = normals.depthTexture;
    ink.uniforms.tFront.value = colour.depthTexture;
    ink.uniforms.texel.value.set(1 / w, 1 / h);
    ink.uniforms.near.value = camera.near;
    ink.uniforms.far.value = camera.far;
    useRamp(!!world.hardLight);
    camera.aspect = r.width / r.height;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    sky.position.setFromMatrixPosition(camera.matrixWorld);
    sky.scale.setScalar(camera.far * 0.9);
    if (stars) {
      stars.position.copy(sky.position);
      stars.scale.setScalar(camera.far * 0.8);
    }
    // Drawn symbols such as the Sun turn to face whoever is looking.
    scene.traverse((o) => o.userData.faceCamera && o.quaternion.copy(camera.quaternion));

    const layers = camera.layers.mask;
    camera.layers.enable(NO_OUTLINE);
    renderer.setRenderTarget(colour);
    renderer.clear();
    renderer.render(scene, camera);

    camera.layers.mask = layers & outlineLayers.mask;
    scene.overrideMaterial = normalMaterial;
    const shadows = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(normals);
    renderer.setClearColor('#8080ff');
    renderer.clear();
    renderer.render(scene, camera);
    renderer.shadowMap.autoUpdate = shadows;
    scene.overrideMaterial = null;
    camera.layers.mask = layers;

    renderer.setRenderTarget(null);
    const y = size.height - r.y - r.height;
    renderer.setViewport(r.x, y, r.width, r.height);
    renderer.setScissor(r.x, y, r.width, r.height);
    renderer.setScissorTest(!!rect);
    renderer.render(quadScene, quadCamera);
    renderer.setScissorTest(false);
  }

  // Where on the screen's edge a far-off thing in `direction` lies, as seen by
  // `camera`: for a marker that says "the Sun is that way" when the Sun itself
  // is outside the picture. Returns { x, y } in CSS pixels, `inset` in from the
  // edge (0 puts it on the edge itself), measured along the line from `centre`
  // (a point in the scene). `angle` is the screen direction towards the source.
  function edgePoint(camera, direction, { centre = new THREE.Vector3(), inset = 0 } = {}) {
    camera.updateMatrixWorld();
    const toScreen = (p) => {
      const q = p.clone().project(camera);
      return { x: ((q.x + 1) / 2) * size.width, y: ((1 - q.y) / 2) * size.height };
    };
    const a = toScreen(centre),
      b = toScreen(centre.clone().addScaledVector(direction.clone().normalize(), 5)),
      dx = b.x - a.x,
      dy = b.y - a.y,
      length = Math.hypot(dx, dy) || 1;
    let reach = Infinity;
    if (dx > 0) reach = Math.min(reach, (size.width - inset - a.x) / dx);
    if (dx < 0) reach = Math.min(reach, (inset - a.x) / dx);
    if (dy > 0) reach = Math.min(reach, (size.height - inset - a.y) / dy);
    if (dy < 0) reach = Math.min(reach, (inset - a.y) / dy);
    if (!isFinite(reach)) reach = 0;
    return { x: a.x + dx * reach, y: a.y + dy * reach, angle: Math.atan2(dy / length, dx / length) };
  }

  return { renderer, scene, sun, setting: world, setSun, setLight, setSky, resize, render, edgePoint };
}
