// World is viewed from above Earth's north pole. Distances are illustrative.
export const R = 1.52, ORBIT = 5.15, SUN_X = -6.3;
export function facts(theta, phi) {
  const n = [Math.cos(theta), Math.sin(theta)];
  const observer = n.map(v => v * R);
  const moon = [ORBIT * Math.cos(phi), ORBIT * Math.sin(phi)];
  const delta = moon.map((v, i) => v - observer[i]);
  const distance = Math.hypot(...delta);
  const sunDelta = [SUN_X - observer[0], -observer[1]];
  const sunAltitude = Math.asin((n[0] * sunDelta[0] + n[1] * sunDelta[1]) / Math.hypot(...sunDelta));
  const moonAltitude = Math.asin((n[0] * delta[0] + n[1] * delta[1]) / distance);
  return { observer, moon, day: sunAltitude > 0, visible: moonAltitude > 0, sunAltitude, moonAltitude };
}
export function makeTasks(random = Math.random, exclude = []) {
  // Clear of horizon, new/full Moon and tiny crescents; two above, two below.
  const tasks = [];
  for (const visible of [true, false, true, false]) {
    for (let tries = 0; tries < 10000; tries++) {
      const phi = (random() < .5 ? 1 : -1) * (1.45 + random() * .65);
      const theta = 1.95 + random() * 2.38;
      const f = facts(theta, phi);
      if (f.day && f.visible === visible && Math.abs(f.moonAltitude) > .3 &&
          f.sunAltitude > .28 && (!visible || f.moonAltitude < .65) && ![...exclude, ...tasks].some(t => Math.abs(t.theta-theta) < .15 && Math.abs(t.phi-phi) < .15)) {
        tasks.push({theta, phi}); break;
      }
    }
  }
  if (tasks.length !== 4) throw new Error('Could not generate unambiguous sky tasks.');
  for (let i = tasks.length - 1; i > 0; i--) { const j = Math.floor(random() * (i+1)); [tasks[i], tasks[j]] = [tasks[j], tasks[i]]; }
  return tasks;
}
export function scorePath(path) { return path.length === 3 && path.join(',') === 'sun,moon,observer'; }
