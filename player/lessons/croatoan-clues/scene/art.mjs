// Original illustrations extracted from the supplied Croatoan clues experience.
const INK = '#24292b';
const ICONS = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  again: '<path d="M4 9a8 8 0 1 1 0 7M4 3v6h6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 0 1 5 .8c0 1.8-2.5 2-2.5 4M12 17v.5"/>',
  speaker: '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>',
  journal: '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z"/><path d="M12 6v14"/>',
  book: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/>',
  shovel: '<path d="M14 10 20 4M18 2l4 4"/><path d="M14 10l-2-2-6 6c-2 2-2 5 0 7l1 1c2 2 5 2 7 0l6-6-2-2"/>',
  letter: '<path d="M4 6h16v12H4z"/><path d="m4 7 8 6 8-6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  ear: '<path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0"/><path d="M10 10a2 2 0 0 1 4 0c0 1.5-2 2-2 3"/>',
  post: '<path d="M9 3h6v18H9z"/><path d="M11 7h2M11 10h2M11 13h2"/>',
  house: '<path d="M4 20V10l8-6 8 6v10"/><path d="M4 20h16" stroke-dasharray="2 3"/>',
  chest: '<path d="M3 10h18v10H3z"/><path d="M3 10c0-4 4-6 9-6s9 2 9 6"/><path d="M11 13h2v3h-2z"/>',
  scroll: '<path d="M6 4h12v14a2 2 0 0 1-2 2H6"/><path d="M6 4a2 2 0 0 0 0 4h2M6 20a2 2 0 0 1 0-4h10"/>',
  map: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  canoe: '<path d="M2 13c4 4 16 4 20 0"/><path d="M2 13h20"/><path d="M14 5l-3 10"/>',
  tree: '<path d="M12 3 6 12h3l-4 6h14l-4-6h3z"/><path d="M12 18v3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="m13 7-3 5h4l-3 5"/>',
  village: '<path d="M3 18v-5a5 5 0 0 1 10 0v5z"/><path d="M13 18v-3a4 4 0 0 1 8 0v3"/><path d="M2 18h20"/>',
  ship: '<path d="M3 15h18l-3 5H6z"/><path d="M12 3v12M12 4l6 8h-6M12 5l-5 7h5"/>',
  swords: '<path d="m4 4 12 12M20 4 8 16"/><path d="m14 18 4 4M10 18l-4 4M16 14l4 0M8 14H4"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 9c0 6-8 11-8 11z"/>',
  people: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 20c0-4 2-6 5-6s5 2 5 6M11 20c0-4 2-6 5-6s5 2 5 6"/>',
  empty: '<path d="M4 20V10l8-6 8 6v10z" stroke-dasharray="3 3"/>',
  brush: '<path d="M14 4l6 6-6 6-6-6z"/><path d="M8 10 3 21l11-5"/>',
  claim: '<path d="M5 4h14v12H9l-4 4z"/><path d="m9 10 2 2 4-4"/>',
  star: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  dig: '<path d="M3 20h18"/><path d="M6 20c0-4 3-6 6-6s6 2 6 6"/><path d="M15 3v8M12 8l3 3 3-3"/>',
  wave: '<path d="M2 9c3 0 3-2 5-2s2 2 5 2 3-2 5-2 2 2 5 2M2 16c3 0 3-2 5-2s2 2 5 2 3-2 5-2 2 2 5 2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  further: '<path d="M4 20 10 4l4 10 3-5 3 11z"/>',
  question: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 0 1 5 .8c0 1.8-2.5 2-2.5 4M12 17v.5"/>'
};
const icon = (k, extra = '') => `<svg viewBox="0 0 24 24" aria-hidden="true" ${extra}>${ICONS[k] || ICONS.arrow}</svg>`;
const iconG = (k, x, y, s = 1, stroke = INK, sw = 2) =>
  `<g transform="translate(${x - 12 * s} ${y - 12 * s}) scale(${s})" fill="none" stroke="${stroke}" stroke-width="${sw / s}" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</g>`;

// Deterministic pseudo-random for scattered details.
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Rounded cel tree: dark lower band + light crown + ink outline.
function tree(x, y, s = 1, light = '#7f9c58', dark = '#5d7a40') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-2 0v10h4V0z" fill="#7a5a3a" stroke="${INK}" stroke-width="2"/>
    <path d="M0-30c11 0 18 8 18 17 0 9-8 14-18 14s-18-5-18-14c0-9 7-17 18-17z" fill="${light}" stroke="${INK}" stroke-width="2.4"/>
    <path d="M-17-8c4 6 10 8 17 8s13-2 17-8c0 6-7 9-17 9s-17-3-17-9z" fill="${dark}"/>
    <path d="M-8-22c3-3 7-4 11-3" fill="none" stroke="#c4d48f" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}
function pine(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-2 0v8h4V0z" fill="#6b4e33" stroke="${INK}" stroke-width="2"/>
    <path d="M0-36 13-12H7L16 2h-32l9-14h-6z" fill="#5f7f4a" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M0-36 13-12H7L16 2H2z" fill="#4c6a3a"/>
  </g>`;
}
// Algonquian longhouse (barrel roof of bark/mats), after the general form in period drawings.
function longhouse(x, y, s = 1, smoke = true) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-26 0v-12c0-11 10-16 26-16s26 5 26 16V0z" fill="#c9a46a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M-26-4h52V0h-52z" fill="#a8834f"/>
    <path d="M-16-21v19M-5-26v24M6-26v24M17-21v19" stroke="#9b7746" stroke-width="2"/>
    <path d="M-5 0v-10h9V0" fill="#5a3f28" stroke="${INK}" stroke-width="2"/>
    ${smoke ? `<path class="smoke" d="M12-30c-4-5 4-8 0-13s4-8 1-12" fill="none" stroke="#f5f1e6" stroke-width="4" stroke-linecap="round" opacity=".8"/>` : ''}
  </g>`;
}
function englishHouse(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-14 0v-14h28V0z" fill="#e8dcc0" stroke="${INK}" stroke-width="2"/>
    <path d="M-17-13 0-26l17 13z" fill="#a0683e" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-3 0v-8h6V0" fill="#6b4a30"/>
  </g>`;
}
function ship(x, y, s = 1, id = '') {
  return `<g ${id ? `id="${id}"` : ''} class="sail" transform="translate(${x} ${y}) scale(${s})">
    <path d="M-40 4c10 14 70 14 80 0" fill="#33536a" opacity=".25"/>
    <path d="M-42-6h84l-10 16h-64z" fill="#8a5a36" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M-36 2h72l-5 8h-62z" fill="#6c4428"/>
    <path d="M-36-10h20v4h-20z" fill="#8a5a36" stroke="${INK}" stroke-width="2"/>
    <path d="M0-58V-6M-22-46V-6M22-40V-6" stroke="${INK}" stroke-width="2.6"/>
    <path d="M-16-52h32c3 10 3 22 0 32h-32c-3-10-3-22 0-32z" fill="#fbf4e2" stroke="${INK}" stroke-width="2.2"/>
    <path d="M0-52v32M-16-37h32" stroke="#d6362f" stroke-width="3"/>
    <path d="M-34-40h24c2 8 2 16 0 26h-24c-2-10-2-18 0-26z" fill="#f1e7cf" stroke="${INK}" stroke-width="2"/>
    <path d="M12-34h20c2 7 2 14 0 22H12c-2-8-2-15 0-22z" fill="#f1e7cf" stroke="${INK}" stroke-width="2"/>
    <path d="M0-58l12 4-12 4z" fill="#d6362f" stroke="${INK}" stroke-width="1.6"/>
  </g>`;
}
function canoe(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M-34-4c8 10 60 10 68 0l-4 7c-10 7-50 7-60 0z" fill="#7a5233" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M-30-1c10 5 50 5 60 0" fill="none" stroke="#a37446" stroke-width="2"/>
  </g>`;
}
function waves(seed, n, x0, y0, x1, y1, color = '#e8f3ee', op = .55) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), w = 10 + r() * 12;
    s += `<path d="M${x} ${y}q${w / 2}-6 ${w} 0q${w / 2} 6 ${w} 0" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" opacity="${op}"/>`;
  }
  return s;
}

// ---------- Map (hub, story) ----------
const MAP = {
  fort: [474, 214], roanoke: [470, 255], croatoan: [756, 548], inland: [150, 235],
  dasa: [322, 300], shipSea: [880, 190], shipFar: [1120, 120], attack: [400, 100]
};
function mapArt({settled=false}={}) {
  const ocean = 'M700-300 700-20 722 120 748 260 772 390 790 480 806 548 800 580 744 606 652 636 560 664 470 720 440 1000H1020V-300Z';
  const barrier = 'M676-300 676-20 700 120 724 260 748 390 764 470 772 520 760 556 742 568 650 604 556 634 450 690 470 720 560 664 652 636 744 606 800 580 806 548 790 480 772 390 748 260 722 120 700-20 700-300Z';
  const buxton = 'M738 470c20-10 46 4 56 30 10 26 8 52-12 66-18 12-48 10-62-4-12-14-8-40 0-60 4-14 8-26 18-32z';
  const roanoke = 'M452 168c26-10 46 18 52 56 6 46-6 96-32 120-24 2-40-36-40-86 0-46 4-82 20-90z';
  const mainland = 'M-900-300H330V-20c-10 60 30 100 10 160-20 60 40 100 20 160-20 60-60 90-40 150 20 60-20 120 10 270V1000H-900Z';
  const r = rng(7); let trees = '';
  for (let i = 0; i < 46; i++) {
    const x = 10 + r() * 290, y = 20 + r() * 660;
    if (Math.hypot(x - MAP.inland[0], y - MAP.inland[1]) < 70) continue;
    trees += (i % 3 ? tree(x, y, .55 + r() * .25) : pine(x, y, .6 + r() * .2));
  }
  let bux = '';
  for (let i = 0; i < 9; i++) { bux += pine(740 + r() * 50, 488 + r() * 60, .45 + r() * .15); }
  return `
  <defs>
    <pattern id="paperDots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#24292b" opacity=".05"/></pattern>
  </defs>
  <rect x="-900" y="-300" width="2800" height="1300" fill="#a3c8bc"/>
  ${waves(3, 26, 360, 20, 680, 680, '#e6f2ee', .5)}
  <path d="${ocean}" fill="#699da4" stroke="${INK}" stroke-width="0"/>
  <rect x="820" y="-300" width="1400" height="1400" fill="#699da4"/>
  ${waves(11, 40, 790, 0, 1000, 700, '#d9e8d1', .55)}
  <path d="${barrier}" fill="#ecd9a2" stroke="${INK}" stroke-width="3.6" stroke-linejoin="round"/>
  <path d="M700-20 722 120 748 260 772 390 790 480 806 548" fill="none" stroke="#fff6d6" stroke-width="3" opacity=".8"/>
  <g id="buxton"><path d="${buxton}" fill="#b9bf7c" stroke="${INK}" stroke-width="3"/>
    <path d="M730 540c16 18 46 22 64 0-4 16-12 22-22 26-14 4-34 0-42-26z" fill="#9aa463"/>${bux}</g>
  <path id="croGlow" d="${buxton}" fill="none" stroke="#fdae1c" stroke-width="10" opacity="0"/>
  <g id="mainland"><path d="${mainland}" fill="#afbc85" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M-900 640c880-20 1000 0 1210 0l10 400H-900z" fill="#8c9e70"/>
    <path d="M300 60c20 40 0 70 30 120M310 380c-14 30 6 60-6 90" fill="none" stroke="#c8d394" stroke-width="4" stroke-linecap="round"/>
    ${trees}</g>
  <rect x="-900" y="-300" width="2800" height="1300" fill="url(#paperDots)" pointer-events="none"/>
  <g id="roanokeIsland"><path d="${roanoke}" fill="#c1cc94" stroke="${INK}" stroke-width="3"/>
    <path d="M440 250c6 50 18 84 32 94-20 0-34-30-38-64z" fill="#9aa463"/>
    ${tree(490, 300, .5)}${tree(455, 320, .45)}${pine(492, 182, .45)}</g>
  <g id="villages">
    ${longhouse(322, 300, .8)}${longhouse(292, 330, .7, false)}
    ${longhouse(756, 548, .8)}${longhouse(782, 532, .65, false)}${longhouse(736, 570, .65, false)}
    ${longhouse(230, 470, .7)}${longhouse(640, 70, .6, false)}
    ${canoe(380, 380, .6)}${canoe(690, 470, .6)}
  </g>
  <g id="fort" opacity="1">
    <circle cx="${MAP.fort[0]}" cy="${MAP.fort[1]}" r="26" fill="#cbb98a" stroke="${INK}" stroke-width="2.4"/>
    ${Array.from({ length: 22 }, (_, i) => { const a = i / 22 * Math.PI * 2; return `<circle cx="${(MAP.fort[0] + Math.cos(a) * 26).toFixed(1)}" cy="${(MAP.fort[1] + Math.sin(a) * 26).toFixed(1)}" r="3.2" fill="#8a6440" stroke="${INK}" stroke-width="1.2"/>`; }).join('')}
    <g id="fortHouses" opacity="${settled?1:0}">${englishHouse(466, 214, .55)}${englishHouse(484, 224, .5)}</g>
    <g id="colonists" opacity="${settled?1:0}">${[[458, 230], [470, 234], [482, 206], [492, 232], [462, 204]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#f4efe4" stroke="${INK}" stroke-width="1.5"/>`).join('')}</g>
  </g>
  ${!settled?'<path d="M457 212h15v8h-15zM479 223h14v7h-14z" fill="#8b7448" stroke="#24292b" stroke-width="1.2"/>':''}
  <g fill="#24292b" font-family="Baloo 2" font-weight="500" font-size="19" paint-order="stroke" stroke="#f7f0d6" stroke-width="5" stroke-linejoin="round">
    <text x="506" y="260">Roanoke</text><text x="635" y="590">Croatoan</text><text x="90" y="390" font-size="22">Mainland</text><text x="842" y="380" font-size="21" fill="#355e67" stroke="#9ec2c2">Atlantic</text>
  </g>
  <g id="theories"></g>
  <g id="mapShip" opacity="0">${ship(0, 0, .8)}</g>
  <g id="mapMarks"></g>
  <g id="mapHits"></g>
  <g transform="translate(70 600)" opacity=".85"><circle r="30" fill="#f4efe4" stroke="${INK}" stroke-width="2"/>
    <path d="M0-26 6 0 0 26-6 0z" fill="#d6362f" stroke="${INK}" stroke-width="1.6"/><path d="M0 0 6 0 0 26z" fill="#f4efe4"/>
    <path d="M-26 0H26" stroke="${INK}" stroke-width="1.4"/></g>`;
}

// ---------- Cover ----------
function coverArt() {
  const r = rng(21); let stars = '';
  for (let i = 0; i < 60; i++) {
    const x = r() * 1440, y = r() * 380, s = r() * 1.8 + .6;
    stars += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="#fff4d8" opacity="${(.4 + r() * .6).toFixed(2)}"/>`;
  }
  let logs = '';
  for (let i = 0; i < 15; i++) {
    const x = 820 + i * 44, h = 300 + (i % 3) * 22 + r() * 18, top = 900 - h;
    logs += `<path d="M${x} 900V${top + 22}l18-24 18 24V900z" fill="${i % 2 ? '#7b5636' : '#86603d'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M${x + 22} 900V${top + 26}l14 0V900z" fill="#5f412a" opacity=".55"/>`;
  }
  const letters = 'CROATOAN'.split('').map((c, i) => `<text x="0" y="${i * 50}" text-anchor="middle" font-family="Baloo 2" font-weight="700" font-size="46" fill="#3a2717" stroke="#c99b62" stroke-width="1.2" paint-order="stroke">${c}</text>`).join('');
  return `
  <rect width="1440" height="900" fill="#2b3557"/>
  <rect y="170" width="1440" height="140" fill="#3c3f68"/>
  <rect y="290" width="1440" height="90" fill="#5d4a76"/>
  <rect y="360" width="1440" height="70" fill="#9a5a72"/>
  <rect y="420" width="1440" height="60" fill="#d27a62"/>
  <rect y="470" width="1440" height="40" fill="#f0a65e"/>
  ${stars}
  <circle cx="1180" cy="140" r="44" fill="#fff1cf" stroke="${INK}" stroke-width="3"/>
  <path d="M1166 110a40 40 0 0 0 30 66 44 44 0 0 1-30-66z" fill="#efd9a8"/>
  <rect y="500" width="1440" height="400" fill="#3d6878"/>
  <rect y="500" width="1440" height="16" fill="#e7a564" opacity=".7"/>
  ${waves(5, 50, 0, 530, 1440, 880, '#8fb6bf', .55)}
  <g>
    <path d="M520 504c60-26 160-30 260-24 70 4 120 16 150 24z" fill="#283a48" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${560 + i * 38} ${494 - (i % 3) * 4}l9-20 9 20z" fill="#24343f"/>`).join('')}
    <g transform="translate(700 498) scale(.7)">${longhouse(0, 0, 1, false)}</g>
    <path class="smoke" d="M708 468c-6-8 6-12 0-20s6-12 2-20" fill="none" stroke="#f7e6c9" stroke-width="5" stroke-linecap="round"/>
    <circle cx="684" cy="494" r="5" fill="#ffcf6a"/><circle cx="684" cy="494" r="12" fill="#ffcf6a" opacity=".25"/>
  </g>
  <g transform="translate(470 520) scale(.62)"><g class="float">${ship(0, 0, 1)}</g></g>
  <g>${logs}</g>
  <path d="M760 900c40-70 140-110 280-110s240 30 400 60v50z" fill="#3e5a3b" stroke="${INK}" stroke-width="3"/>
  <path d="M790 900c40-50 120-80 240-80 90 0 200 20 410 50v30z" fill="#4f6f45"/>
  <g transform="translate(1020 0)">
    <path d="M-50 900V300l50-34 50 34V900z" fill="#a27447" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M18 900V290l32 10V900z" fill="#7e5733"/>
    <path d="M-34 330h68v420h-68z" fill="#c79560" stroke="${INK}" stroke-width="2.4"/>
    <g transform="translate(0 378)">${letters}</g>
  </g>
  <g fill="#3e5a3b" stroke="${INK}" stroke-width="2.4">
    <path d="M900 900c-4-40 6-70 20-90-2 30 0 60 4 90z"/><path d="M940 900c0-30 10-50 24-62-4 22-2 42 2 62z"/>
    <path d="M1240 900c-2-40 10-62 22-76-2 26 0 52 4 76z"/>
  </g>`;
}

// ---------- Fort (1590) ----------
const FORT_SPOTS = {
  carvings: [226, 200], houses: [560, 470], chests: [250, 560], sign: [760, 600], fifty: [900, 540]
};
function fortArt() {
  const r = rng(40); let logs = '';
  for (let i = 0; i < 26; i++) {
    const x = -20 + i * 42, h = 150 + (i % 3) * 16 + r() * 10, top = 300 - h;
    if (i === 5 || i === 6) continue; // entrance gap
    logs += `<path d="M${x} 300V${top + 16}l16-18 16 18V300z" fill="${i % 2 ? '#7b5636' : '#86603d'}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/><path d="M${x + 20} 300V${top + 18}h12V300z" fill="#5f412a" opacity=".5"/>`;
  }
  const footprints = [[470, 430], [660, 440], [560, 520]].map(([x, y]) => `
    <g transform="translate(${x} ${y})"><path d="M-60-24h120l14 34h-148z" fill="#8b6a46" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M-52-18h104l8 20h-120z" fill="#76583a"/>
    ${[-56, -20, 20, 56].map(px => `<path d="M${px}-24v-12h6v12z" fill="#a27447" stroke="${INK}" stroke-width="1.8"/>`).join('')}</g>`).join('');
  const letters = 'CROATOAN'.split('').map((c, i) => `<text x="0" y="${i * 21}" text-anchor="middle" font-family="Baloo 2" font-weight="700" font-size="20" fill="#3a2717">${c}</text>`).join('');
  return `
  <rect x="-900" y="-300" width="2800" height="1300" fill="#dfe9d6"/>
  <rect x="-900" y="-300" width="2800" height="460" fill="#cfe4e4"/>
  <path d="M-900 150c400-20 800-10 1400-20s400-20 1300 0V300H-900z" fill="#88a46a"/>
  ${tree(120, 150, 1.4)}${pine(880, 150, 1.5)}${tree(980, 160, 1.2)}
  <rect x="-900" y="300" width="2800" height="700" fill="#a8b974"/>
  <path d="M-900 300h2800v24c-200 10-1200-6-1400 4s-1200 10-1400-4z" fill="#93a663"/>
  ${logs}
  <g id="entrancePosts">
    <path d="M210 300V96l16-14 16 14v204z" fill="#a27447" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M214 112h24v170h-24z" fill="#c79560" stroke="${INK}" stroke-width="1.8"/>
    <g transform="translate(226 130)">${letters}</g>
    <path d="M270 300V100l14-12 14 12v200z" fill="#86603d" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  </g>
  ${footprints}
  <g transform="translate(250 560)">
    <path d="M-90 30c20-30 160-30 180 0-30 24-150 24-180 0z" fill="#6f5232" stroke="${INK}" stroke-width="2.4"/>
    <g transform="rotate(-8)"><path d="M-70-10h56v34h-56z" fill="#8a5a36" stroke="${INK}" stroke-width="2.4"/><path d="M-70-10l-6-26h56l6 26z" fill="#a8703f" stroke="${INK}" stroke-width="2.4"/></g>
    <g transform="rotate(10) translate(30 0)"><path d="M-20-6h52v30h-52z" fill="#7b4f2f" stroke="${INK}" stroke-width="2.4"/><path d="M-20-6l4-22h52l-4 22z" fill="#9b6337" stroke="${INK}" stroke-width="2.4"/></g>
    <path d="M-30 34l30-8 22 10-26 8z" fill="#f4ecd6" stroke="${INK}" stroke-width="1.8"/>
    <path d="M40 30h30v20H40z" fill="#c9b27a" stroke="${INK}" stroke-width="1.8" transform="rotate(14 55 40)"/>
  </g>
  <g transform="translate(760 600)">
    <path d="M-36 6c0-14 72-14 72 0v22h-72z" fill="#8f6b45" stroke="${INK}" stroke-width="2.4"/>
    <ellipse cx="0" cy="6" rx="36" ry="9" fill="#c79560" stroke="${INK}" stroke-width="2.4"/>
    <path d="M-20 0c6-3 18-3 24 0v-4c-6-3-18-3-24 0z" fill="#f4ecd6" stroke="${INK}" stroke-width="1.6"/>
    <path d="M-20-4h24l2 6h-28z" fill="#5a3f28" stroke="${INK}" stroke-width="1.6"/>
  </g>
  <g transform="translate(900 540)">
    <path d="M-40 6c0-14 80-14 80 0v22h-80z" fill="#8f6b45" stroke="${INK}" stroke-width="2.4"/>
    <ellipse cx="0" cy="6" rx="40" ry="9" fill="#c79560" stroke="${INK}" stroke-width="2.4"/>
    <path d="M-28-2h50a6 6 0 0 1 0 10h-50a6 6 0 0 1 0-10z" fill="#efe1bd" stroke="${INK}" stroke-width="1.8"/>
    <circle cx="-28" cy="3" r="5" fill="#e1cd9b" stroke="${INK}" stroke-width="1.6"/>
  </g>
  ${Array.from({ length: 30 }, () => { const x = r() * 1000, y = 330 + r() * 360; return `<path d="M${x} ${y}l3-9 3 9M${x + 5} ${y}l4-7" stroke="#6f8a4e" stroke-width="2" fill="none" stroke-linecap="round"/>`; }).join('')}
  <g id="fortHits"></g>`;
}

// ---------- Croatoan point of view ----------
function croatoanViewArt() {
  const stakes = Array.from({ length: 14 }, (_, i) => `<path d="M${560 + i * 18} ${470 + Math.sin(i / 2) * 18}v-46" stroke="#5f412a" stroke-width="5" stroke-linecap="round"/>`).join('');
  return `
  <rect x="-900" y="-300" width="2800" height="620" fill="#f3d9a8"/>
  <rect x="-900" y="140" width="2800" height="120" fill="#f0c48c"/>
  <circle cx="200" cy="170" r="50" fill="#fff0cc" stroke="${INK}" stroke-width="3"/>
  <rect x="-900" y="300" width="2800" height="700" fill="#7fb4b5"/>
  ${waves(9, 50, 0, 320, 1000, 640, '#e6f2ee', .6)}
  <path d="M400 300c50-8 120-10 200-6 40 2 70 4 80 6z" fill="#7d8d63" stroke="${INK}" stroke-width="2"/>
  <g transform="translate(640 288) scale(.28)" id="farShip">${ship(0, 0, 1)}</g>
  <path d="M520 420c40-10 140-6 190 6 20 10 10 60 0 70" fill="none" stroke="#5f412a" stroke-width="3" stroke-dasharray="2 8"/>
  ${stakes}
  ${canoe(380, 470, 1.4)}
  <path d="M-900 560c1000-40 1180-30 1360-10s340 10 1440-10V1000H-900z" fill="#e3cf94" stroke="${INK}" stroke-width="3"/>
  <path d="M-900 610c1020-30 1200-20 1360-6s360 6 1440-10V1000H-900z" fill="#cdbb7e"/>
  ${longhouse(140, 640, 2.4)}${longhouse(390, 660, 1.9, false)}${longhouse(860, 650, 2.1)}
  <g transform="translate(620 650)"><path d="M-30 0c10-14 50-14 60 0z" fill="#6f5232" stroke="${INK}" stroke-width="2.4"/>
    <path d="M-10-4c4-14 2-24 10-34 2 12 10 18 6 34z" fill="#f3a03c" stroke="${INK}" stroke-width="2"/><path d="M-2-6c0-8 2-12 4-16 2 6 4 10 2 16z" fill="#ffe08a"/></g>
  ${pine(40, 560, 1.6)}${pine(960, 570, 1.5)}${tree(260, 560, 1.2)}`;
}

// ---------- Dig at Buxton ----------
const DIG_SPOTS = { hilt: [320, 300], slate: [470, 490], gun: [660, 500] };
function digArt() {
  const grid = [];
  for (let i = 0; i <= 6; i++) grid.push(`<path d="M${200 + i * 100} 150V610" stroke="#f4ecd6" stroke-width="2" opacity=".7"/>`);
  for (let j = 0; j <= 4; j++) grid.push(`<path d="M200 ${150 + j * 115}H800" stroke="#f4ecd6" stroke-width="2" opacity=".7"/>`);
  const r = rng(77);
  const pebbles = Array.from({ length: 60 }, () => `<ellipse cx="${(210 + r() * 580).toFixed(0)}" cy="${(160 + r() * 440).toFixed(0)}" rx="${(2 + r() * 4).toFixed(1)}" ry="${(1.5 + r() * 3).toFixed(1)}" fill="#6d4e33" opacity=".5"/>`).join('');
  return `
  <rect x="-900" y="-300" width="2800" height="1300" fill="#b9bf7c"/>
  ${pine(80, 120, 1.5)}${pine(950, 140, 1.4)}${tree(60, 650, 1.3)}${pine(940, 660, 1.4)}
  <path d="M180 130h640v500H180z" fill="#7b5a3c" stroke="${INK}" stroke-width="4"/>
  <path d="M200 150h600v460H200z" fill="#a17a52" stroke="${INK}" stroke-width="2"/>
  <path d="M200 150h600v24H200z" fill="#8a6644"/>
  ${pebbles}${grid.join('')}
  ${[[180, 130], [820, 130], [820, 630], [180, 630]].map(([x, y]) => `<path d="M${x} ${y - 20}v24" stroke="#f4ecd6" stroke-width="6" stroke-linecap="round"/><circle cx="${x}" cy="${y}" r="6" fill="#f4ecd6" stroke="${INK}" stroke-width="2"/>`).join('')}
  <g transform="translate(320 300)"><g transform="rotate(-25)">
    <path d="M-50-4h70v8h-70z" fill="#8f8f88" stroke="${INK}" stroke-width="2.2"/>
    <path d="M20-16c8 0 10 6 10 16s-2 16-10 16" fill="none" stroke="#7d6a46" stroke-width="5"/>
    <path d="M20-4h30v8H20z" fill="#5a3f28" stroke="${INK}" stroke-width="2"/><circle cx="54" cy="0" r="6" fill="#a08850" stroke="${INK}" stroke-width="2"/></g></g>
  <g transform="translate(470 490) rotate(8)"><path d="M-40-28h80v56h-80z" fill="#4b5157" stroke="${INK}" stroke-width="2.4"/>
    <path d="M-34-22h68v44h-68z" fill="#5d646b"/><path d="M-20 0c6-10 10 10 18 0" fill="none" stroke="#c9ced2" stroke-width="2"/></g>
  <g transform="translate(660 500) rotate(-10)"><path d="M-36-10h48l10 8-8 12h-50z" fill="#857f74" stroke="${INK}" stroke-width="2.2"/>
    <path d="M-10-10l6-14 8 2-4 12" fill="#857f74" stroke="${INK}" stroke-width="2"/><circle cx="-18" cy="0" r="5" fill="#a39b8c" stroke="${INK}" stroke-width="1.8"/></g>
  <g id="soil"></g>
  <g transform="translate(880 470) rotate(30)"><path d="M-6-60h12v50H-6z" fill="#8a5a36" stroke="${INK}" stroke-width="2"/><path d="M-16-12h32l-16 40z" fill="#b8bcbf" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/></g>
  <g transform="translate(110 380)"><path d="M-26-20h52l-6 50h-40z" fill="#5f8fa0" stroke="${INK}" stroke-width="2.4"/><path d="M-26-20c10-8 42-8 52 0" fill="none" stroke="${INK}" stroke-width="2.4"/></g>
  <g id="digHits"></g>`;
}
function soilPatch(x, y, k) {
  return `<g id="soil-${k}" transform="translate(${x} ${y})" style="transition:opacity .6s,transform .6s">
    <path d="M-76-34c30-18 110-14 140 6 22 18 12 52-20 62-40 12-110 8-128-16-12-18-8-40 8-52z" fill="#8a6644" stroke="${INK}" stroke-width="2.6"/>
    <path d="M-70 10c30 16 90 18 124 4-20 22-100 26-124-4z" fill="#76583a"/>
    <ellipse cx="-20" cy="-10" rx="6" ry="4" fill="#5e432b"/><ellipse cx="30" cy="4" rx="5" ry="3" fill="#5e432b"/></g>`;
}

// ---------- White's map (extension) ----------
function whiteMapArt() {
  return `
  <rect x="-900" y="-300" width="2800" height="1300" fill="#3b4a52"/>
  <path d="M120 70h760v560H120z" fill="#efe1bd" stroke="${INK}" stroke-width="4"/>
  <path d="M140 90h720v520H140z" fill="none" stroke="#b79a5e" stroke-width="2"/>
  <path d="M640 90c-10 120 20 240 40 340 10 60 0 120-30 180H860V90z" fill="#a9c7c4" opacity=".7"/>
  <path d="M640 90c-10 120 20 240 40 340 10 60 0 120-30 180" fill="none" stroke="#5a4a32" stroke-width="3"/>
  <path d="M140 90h300c-20 80 30 120 10 200-20 70 30 110 0 200-10 40-20 80-20 120H140z" fill="#d9c79a"/>
  <path d="M440 90c-20 80 30 120 10 200-20 70 30 110 0 200-10 40-20 80-20 120" fill="none" stroke="#5a4a32" stroke-width="3"/>
  <path d="M200 260c60 10 120-20 180 0s50 30 70 30" fill="none" stroke="#6d8aa0" stroke-width="5"/>
  <path d="M260 180c10 30 0 60 10 90" fill="none" stroke="#6d8aa0" stroke-width="4"/>
  ${[[200, 160], [180, 400], [300, 470], [360, 380], [230, 540]].map(([x, y]) => `<path d="M${x} ${y}l8-16 8 16z" fill="#7d8f5a" stroke="#5a4a32" stroke-width="1.6"/>`).join('')}
  <path d="M520 220c14-10 30-10 40 8-10 20-30 22-40 10z" fill="#d9c79a" stroke="#5a4a32" stroke-width="2"/>
  <g transform="translate(760 330) scale(.45)">${ship(0, 0, 1)}</g>
  <path d="M760 480c20-20 40 10 60-6 10 20-20 40-40 30" fill="none" stroke="#5a4a32" stroke-width="3"/>
  <g transform="translate(266 262)"><path d="M0-20 6-6 20-6 9 4 13 18 0 10-13 18-9 4-20-6-6-6z" fill="#c43a2f" stroke="#5a2a1a" stroke-width="2.2"/></g>
  <g id="patch" style="transition:transform 1s cubic-bezier(.4,.1,.3,1),opacity 1s">
    <path d="M226 222h82l4 80h-86z" fill="#e6d4a6" stroke="#8a744a" stroke-width="2"/>
    <path d="M200 260c26 4 30-4 50 0" fill="none" stroke="#6d8aa0" stroke-width="5" clip-path="none"/>
    <path d="M232 230l70 4M230 290l76 2" stroke="#d2bd8a" stroke-width="2"/>
  </g>
  <g id="whiteMapHits"></g>`;
}


export {mapArt,coverArt,fortArt,croatoanViewArt,digArt,soilPatch,whiteMapArt,icon,MAP,FORT_SPOTS,DIG_SPOTS,ship,tree,pine,longhouse,englishHouse,canoe};
