// Children, from the game's player avatar: one animated figure with a small
// wardrobe, offered as a few fixed characters.
//
//   const mia = character('mia', { at: [0, 0, 2] });
//   scene.add(mia);                       // appears as soon as it has loaded
//   mia.userData.play('walk');            // 'stand' (the default), 'idle' or 'walk'
//   each frame: mia.userData.tick(seconds);
//
// A character faces +z and stands about 1.5 tall. `await mia.userData.ready`
// if something must wait for it (a first screenshot, a measurement).
import { THREE, toon, unlined } from './stage.mjs';

const body = 'BodyRound_GEO',
  face = ['FacePlane_Eyes', 'FacePlane_Mouth'],
  pair = (name) => ['l_' + name, 'r_' + name];
// Who they are: the pieces each one wears, their skin, and the colour of any
// plain top. Add a character here; the wardrobe is listed in build-avatars.py.
export const CHARACTERS = {
  mia: { wears: ['Bangs_ROUND_GEO', 'Hoodie_GEO', 'Jeans_GEO', ...pair('Sneaker')], skin: '#e9c4a4', top: '#ae5e55' },
  sam: { wears: ['Spiky_ROUND_GEO', 'SpikyBASE_ROUND_GEO', 'StripedTshirt_GEO', 'CargoShorts_GEO', 'l_HighTops', 'R_HighTops'], skin: '#c58c65', top: '#e9b44c' },
  noor: { wears: ['CornRows2_ROUND_GEO', 'Puffer_GEO', 'Joggers_GEO', ...pair('Sneaker')], skin: '#8d5a3c', top: '#5fa8a0' },
  leo: { wears: ['Buzz_ROUND_GEO', 'Tshirt_GEO', 'Shorts_GEO', ...pair('Crocs_GEO')], skin: '#f1d3b8', top: '#6f8fc9' },
};
const backpack = 'AdventureBackpack_TORSO_OUTER_GEO';

let shared;
function load() {
  return (shared ??= (async () => {
    const [{ GLTFLoader }, { clone }, art] = await Promise.all([
      import('./three/r180/GLTFLoader.js'),
      import('./three/r180/SkeletonUtils.js'),
      import('./people/avatars.mjs'),
    ]);
    const bytes = Uint8Array.from(atob(art.model), (c) => c.charCodeAt(0));
    const picture = (uri) =>
      new Promise((done, fail) => {
        const image = new Image();
        image.onload = () => {
          const texture = new THREE.Texture(image);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.flipY = false;
          texture.needsUpdate = true;
          done(texture);
        };
        image.onerror = fail;
        image.src = uri;
      });
    const [gltf, swatches, faces] = await Promise.all([
      new GLTFLoader().parseAsync(bytes.buffer, ''),
      picture(art.swatches),
      picture(art.face),
    ]);
    swatches.magFilter = swatches.minFilter = THREE.NearestFilter;
    return { gltf, clone, swatches, faces };
  })());
}

export function character(name = 'mia', { at, height = 1.5, pack = false } = {}) {
  const who = CHARACTERS[name];
  if (!who) throw Error(`Unknown character "${name}". Known: ${Object.keys(CHARACTERS).join(', ')}`);
  const g = new THREE.Group();
  if (at) g.position.set(at[0], at[1], at[2]);
  let mixer,
    actions = {},
    current = '',
    wanted = 'stand';
  g.userData.tick = (seconds) => mixer?.setTime(seconds);
  // 'stand' holds the upright start of the idle clip: the game's idle shifts
  // and leans, which reads as walking when a figure is small or seen side-on.
  g.userData.play = (clip) => {
    wanted = clip;
    const source = clip === 'stand' ? 'idle' : clip;
    if (!mixer || clip === current || !actions[source]) return;
    mixer.stopAllAction();
    const action = actions[source];
    action.paused = clip === 'stand';
    action.play();
    current = clip;
  };
  g.userData.ready = load().then(({ gltf, clone, swatches, faces }) => {
    const model = clone(gltf.scene),
      shown = new Set([body, ...face, ...who.wears, ...(pack ? [backpack] : [])]),
      plain = toon(who.top),
      skin = toon(who.skin),
      cloth = toon('#ffffff', { map: swatches }),
      box = new THREE.Box3();
    model.updateMatrixWorld(true); // the rig carries the file's own scale
    model.traverse((o) => {
      if (!o.isMesh) return;
      o.visible = shown.has(o.name);
      o.frustumCulled = false;
      if (face.includes(o.name)) {
        o.material = new THREE.MeshBasicMaterial({ map: faces, transparent: true, depthWrite: false });
        unlined(o);
        return;
      }
      o.castShadow = o.receiveShadow = true;
      // Pieces drawn from the swatch sheet keep its colours; the body and plain
      // tops take the character's own.
      const drawn = /Swatches/.test(o.material.name);
      o.material = o.name === body ? skin : drawn ? cloth : plain;
      if (o.name === body) box.setFromObject(o);
    });
    const tall = box.max.y - box.min.y || 1;
    model.scale.setScalar(height / tall);
    model.position.y = (-box.min.y * height) / tall;
    mixer = new THREE.AnimationMixer(model);
    for (const clip of gltf.animations) actions[clip.name] = mixer.clipAction(clip);
    g.add(model);
    g.userData.play(wanted);
    mixer.setTime(0);
    return g;
  });
  return g;
}
