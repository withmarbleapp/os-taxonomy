import { THREE, createStage, SKY, unlined } from '/sdk/stage.mjs';
import { countryside, sun as kitSun, moon as kitMoon } from '/sdk/props.mjs';
import { SUN_X } from '../model/geometry.mjs';
const DEG = Math.PI / 180,
  DISTANCE = 1800,
  EYE_HEIGHT = 1.6;
const NIGHT = { top: '#040813', mid: '#0a1322', horizon: '#131f30' },
  NIGHT_SHADE = [0.1, 0.14, 0.24],
  DAY_FOG = new THREE.Color('#9abdc2'),
  NIGHT_FOG = new THREE.Color('#111c2c');
// The explorer's own sky, standing in the kit's countryside. This is a first-person
// view, so the Sun is in it as the soft disc someone on the ground sees. Only
// display sizes are exaggerated: where the Sun and Moon are, and how much of the
// Moon is lit, come from the model.
export function createGroundView(canvas, share) {
  const stage = createStage(canvas, { setting: 'daylight', share }),
    scene = stage.scene,
    camera = new THREE.PerspectiveCamera(72, 1, 0.1, 7000);
  camera.position.set(0, EYE_HEIGHT, 0);
  let yaw = 0,
    pitch = 12 * DEG,
    width = 1440,
    height = 900,
    day = true,
    target = null,
    bodies = {};
  const land = countryside();
  scene.add(land);
  const sun = kitSun({ radius: DISTANCE * Math.tan(1.5 * DEG) });
  scene.add(sun);
  // The Moon in the sky shows only its sunlit part: by day the rest is lost in
  // the blue, so it is drawn clear; by night it is a faint dark disc.
  const moonMap = kitMoon().getObjectByProperty('isMesh', true).material.map;
  const moonMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { map: { value: moonMap }, lightDirection: { value: new THREE.Vector3(-1, 0, 0) }, isDay: { value: 1 } },
    vertexShader:
      'varying vec3 worldNormal; varying vec2 texCoord; void main(){ worldNormal = normalize(mat3(modelMatrix) * normal); texCoord = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D map; uniform vec3 lightDirection; uniform float isDay; varying vec3 worldNormal; varying vec2 texCoord;
      void main(){
        float lit = smoothstep(-0.012, 0.025, dot(normalize(worldNormal), normalize(lightDirection)));
        vec3 pale = vec3(0.92, 0.94, 0.93) * mix(0.72, 1.0, texture2D(map, texCoord).r);
        vec3 colour = mix(vec3(0.015, 0.025, 0.045), pale, lit * 0.96);
        gl_FragColor = vec4(pow(colour, vec3(2.2)), mix(mix(0.5, 1.0, lit), lit * 0.96, isDay)); }`,
  });
  const moon = unlined(new THREE.Mesh(new THREE.SphereGeometry(DISTANCE * Math.tan(1.9 * DEG), 64, 40), moonMat));
  scene.add(moon);
  let seed = 271;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
  const starPositions = [];
  for (let i = 0; i < 200; i++) {
    const a = random() * Math.PI * 2,
      alt = (random() * Math.PI) / 2;
    starPositions.push(Math.sin(a) * Math.cos(alt) * 3000, Math.sin(alt) * 3000, Math.cos(a) * Math.cos(alt) * 3000);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const stars = unlined(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: '#e6efff', size: 3, sizeAttenuation: false, fog: false })));
  scene.add(stars);
  function orient() {
    camera.lookAt(camera.position.clone().add(new THREE.Vector3(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch))));
    camera.updateMatrixWorld();
  }
  function local(v, theta) {
    const c = Math.cos(theta),
      s = Math.sin(theta);
    return new THREE.Vector3(-s * v.x + c * v.y, c * v.x + s * v.y, -v.z);
  }
  // Clouds keep clear of the Sun and Moon, wherever those are this time.
  const cloudAt = new THREE.Vector3();
  function clearSky() {
    land.updateMatrixWorld(true);
    for (const cloud of land.userData.clouds.children) {
      const d = cloud.getWorldPosition(cloudAt).normalize();
      cloud.visible = Object.values(bodies).every((b) => d.angleTo(b.direction) > 0.3);
    }
  }
  function update(f, theta) {
    const p = new THREE.Vector3(...f.observer, 0),
      sunWorld = new THREE.Vector3(SUN_X, 0, 0),
      moonWorld = new THREE.Vector3(...f.moon, 0);
    const sunDirection = local(sunWorld.clone().sub(p).normalize(), theta),
      moonDirection = local(moonWorld.clone().sub(p).normalize(), theta);
    bodies = { sun: { direction: sunDirection, altitude: f.sunAltitude }, moon: { direction: moonDirection, altitude: f.moonAltitude } };
    sun.position.copy(sunDirection).multiplyScalar(DISTANCE).add(camera.position);
    moon.position.copy(moonDirection).multiplyScalar(DISTANCE).add(camera.position);
    sun.visible = f.day;
    moon.visible = f.visible;
    day = f.day;
    // Daylight comes from where the Sun is; at night a little comes from the Moon.
    const moonlit = !day && f.visible;
    stage.setSun(day ? sunDirection : moonlit ? moonDirection : new THREE.Vector3(0.3, 0.8, 0.4), { reach: 90 });
    stage.setLight(day ? {} : { sunlight: moonlit ? 0.3 : 0, shade: NIGHT_SHADE });
    stage.setSky(day ? SKY.clear : NIGHT);
    scene.fog.color.copy(day ? DAY_FOG : NIGHT_FOG);
    land.userData.turf.userData.light.setRGB(...(day ? [1, 1, 1] : NIGHT_SHADE.map((v) => v * 1.3)));
    land.userData.clouds.visible = day;
    clearSky();
    moonMat.uniforms.isDay.value = day ? 1 : 0;
    moonMat.uniforms.lightDirection.value.copy(local(sunWorld.clone().sub(moonWorld).normalize(), theta));
    stars.visible = !day;
  }
  function desired(body, locateHidden = false) {
    const b = bodies[body],
      d = b.direction;
    const aim =
      locateHidden && b.altitude <= 0
        ? THREE.MathUtils.clamp(b.altitude + 14 * DEG, -76 * DEG, 16 * DEG)
        : Math.max(8 * DEG, Math.min(75 * DEG, b.altitude - (width / height < 0.8 ? 12 : 14) * DEG));
    return { yaw: Math.atan2(d.x, -d.z), pitch: aim };
  }
  function lookAtBody(body, animated = true, locateHidden = false) {
    const d = desired(body, locateHidden);
    if (!animated) {
      yaw = d.yaw;
      pitch = d.pitch;
      target = null;
      orient();
    } else {
      let delta = d.yaw - yaw;
      while (delta > Math.PI) delta -= Math.PI * 2;
      while (delta < -Math.PI) delta += Math.PI * 2;
      target = { yaw: yaw + delta, pitch: d.pitch };
    }
  }
  // The lane and village lie the way the explorer first looks.
  function enter() {
    lookAtBody('moon', false);
    land.rotation.y = -yaw;
    clearSky();
  }
  function look(dx, dy) {
    target = null;
    yaw += dx;
    pitch = THREE.MathUtils.clamp(pitch + dy, -80 * DEG, 80 * DEG);
    orient();
  }
  function tick(seconds = 0) {
    land.userData.tick(seconds);
    if (target) {
      yaw += (target.yaw - yaw) * 0.11;
      pitch += (target.pitch - pitch) * 0.11;
      if (Math.abs(target.yaw - yaw) + Math.abs(target.pitch - pitch) < 0.001) target = null;
      orient();
    }
  }
  function resize(w, h) {
    width = w;
    height = h;
    stage.resize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  function screenPosition(body) {
    const object = body === 'moon' ? moon : sun;
    const inCamera = object.position.clone().applyMatrix4(camera.matrixWorldInverse),
      q = object.position.clone().project(camera);
    const x = ((q.x + 1) * width) / 2,
      y = ((1 - q.y) * height) / 2;
    return { x, y, inView: inCamera.z < 0 && q.z < 1 && x > 36 && x < width - 36 && y > 36 && y < height - 36, altitude: bodies[body].altitude };
  }
  function snapshot() {
    return { yaw, pitch, fov: camera.fov, day, moonVisible: moon.visible, sunVisible: sun.visible, eyeHeight: camera.position.y };
  }
  orient();
  return { camera, update, enter, look, lookAtBody, tick, resize, snapshot, screenPosition, render: () => stage.render(camera), moon, sun, land };
}
