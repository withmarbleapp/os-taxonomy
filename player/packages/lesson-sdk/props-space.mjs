// Bodies in space, from the Moon lesson. Use with the 'space' setting, where
// sunlight is hard and the far side of a body is nearly dark. Point the stage's
// light away from the star: stage.setSun(starPosition).
import { THREE, toon, flat, solid, unlined, PALETTE } from './stage.mjs';

const placed = (group, at) => {
  if (at) group.position.set(at[0], at[1], at[2]);
  return group;
};

const noiseGLSL = `
float hash31(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise3(p);p=p*2.03+vec3(13.1,7.3,5.4);a*=.5;}return v;}
`;
const solarVertex = `varying vec3 localPoint;varying vec3 viewNormal;void main(){localPoint=normalize(position);viewNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const solarFragment = `precision highp float;uniform float time;uniform float daylight;varying vec3 localPoint;varying vec3 viewNormal;${noiseGLSL}
void main(){
 vec3 p=normalize(localPoint);vec3 drift=vec3(time*.007,-time*.011,time*.004);
 float flowing=fbm(p*7.+drift);
 vec3 warp=vec3(fbm(p*5.+drift),fbm(p*5.+4.7+drift),fbm(p*5.+9.1+drift));
 float cells=noise3(p*64.+warp*2.8+drift),fine=noise3(p*127.+warp+drift);
 float veins=pow(1.-abs(cells*2.-1.),2.);
 float detail=clamp(.23+flowing*.76+cells*.22+fine*.10,0.,1.);
 vec3 plasma=mix(vec3(.82,.20,.018),vec3(1.,.86,.39),smoothstep(.20,.88,detail));
 plasma+=vec3(.13,.065,.012)*veins;
 float limb=.57+.43*pow(max(viewNormal.z,0.),.38);
 plasma*=limb;
 // White glare in the normal daytime sky; detailed treatment in the space model.
 vec3 colour=mix(plasma,vec3(1.,.968,.82),daylight*.94);
 gl_FragColor=vec4(clamp(colour,0.,1.),1.);
}`;
const coronaVertex = `varying vec2 texCoord;void main(){texCoord=uv;vec4 centre=modelViewMatrix*vec4(0.,0.,0.,1.);centre.xy+=position.xy;gl_Position=projectionMatrix*centre;}`;
const coronaFragment = `precision highp float;uniform float time;uniform float daylight;varying vec2 texCoord;${noiseGLSL}
void main(){vec2 p=(texCoord-.5)*8.;float r=length(p);if(r<.995||r>3.95)discard;
 vec2 angle=p/max(r,.001);float d=max(r-1.,0.);
 float coarse=fbm(vec3(angle*4.5,time*.009));
 float threads=noise3(vec3(angle*33.,r*.8-time*.018));
 float streamer=pow(clamp(coarse*1.50-.30,0.,1.),3.);
 float fine=pow(threads,5.);
 float halo=.18*exp(-d*1.9)+.055*exp(-d*.9);
 float crown=(.34+streamer*.8+fine*.40)*exp(-d*(4.5-streamer*2.9));
 float rim=.42*exp(-d*19.);
 float alpha=(halo+crown+rim)*(1.-smoothstep(2.8,3.95,r));
 // Suppress diagnostic corona streamers in the unaided daytime view.
 alpha=mix(alpha,.20*exp(-d*2.3),daylight);
 vec3 colour=mix(vec3(1.,.82,.43),vec3(1.,.38,.10),smoothstep(.03,1.7,d));
 gl_FragColor=vec4(colour,clamp(alpha,0.,.90));
}`;

// A star seen from space: a mottled glowing surface inside a streaming corona.
// It is light, so it has no shading or outline. Call `group.userData.tick(seconds)`
// each frame to let the surface drift.
export function star({ at, radius = 2 } = {}) {
  const g = new THREE.Group();
  const surface = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, daylight: { value: 0 } },
    vertexShader: solarVertex,
    fragmentShader: solarFragment.replace('gl_FragColor=vec4(clamp(colour,0.,1.),1.);', 'gl_FragColor=vec4(pow(clamp(colour,0.,1.),vec3(2.2)),1.);'),
  });
  g.add(new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 44), surface));
  const corona = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, daylight: { value: 0 } },
    vertexShader: coronaVertex,
    fragmentShader: coronaFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(radius * 8, radius * 8), corona);
  halo.renderOrder = 1;
  halo.frustumCulled = false;
  g.add(halo);
  g.userData.tick = (seconds) => (surface.uniforms.time.value = corona.uniforms.time.value = seconds);
  return placed(unlined(g), at);
}

const CONTINENTS = [
 [[-168,71],[-155,71],[-145,69],[-136,69],[-129,71],[-118,73],[-111,69],[-101,72],[-94,72],[-87,69],[-78,73],[-68,65],[-60,60],[-54,53],[-60,47],[-67,45],[-72,42],[-77,35],[-81,25],[-85,29],[-90,29],[-97,22],[-101,18],[-96,16],[-88,16],[-84,11],[-79,9],[-77,7],[-80,7],[-86,10],[-91,14],[-99,16],[-106,23],[-112,29],[-117,32],[-123,41],[-128,51],[-134,57],[-142,60],[-151,59],[-161,58],[-168,61],[-164,65]],
 [[-81,11],[-74,12],[-66,9],[-60,8],[-51,3],[-48,-2],[-35,-6],[-38,-15],[-42,-23],[-50,-29],[-55,-35],[-62,-41],[-67,-53],[-72,-55],[-75,-48],[-74,-38],[-72,-29],[-71,-18],[-77,-6],[-81,0]],
 [[-53,60],[-44,60],[-39,66],[-25,70],[-20,77],[-30,83],[-46,83],[-60,78],[-66,70]],
 [[-11,36],[-9,44],[-2,44],[-5,49],[2,51],[8,55],[5,58],[9,62],[16,69],[25,71],[31,69],[27,61],[34,59],[43,65],[53,69],[63,69],[72,73],[89,74],[99,78],[110,76],[121,73],[135,72],[147,71],[159,69],[172,66],[178,62],[170,58],[160,61],[151,58],[145,51],[137,48],[132,42],[129,35],[122,31],[121,24],[113,22],[108,17],[106,10],[102,2],[98,6],[98,14],[91,22],[86,21],[79,8],[75,13],[72,22],[65,25],[57,25],[51,16],[44,13],[42,20],[35,29],[31,31],[26,36],[21,40],[15,38],[12,44],[8,44],[3,42],[-1,36]],
 [[-17,35],[-7,36],[6,37],[12,33],[23,32],[32,31],[35,24],[43,12],[51,11],[46,2],[42,-4],[39,-14],[34,-24],[28,-33],[19,-35],[12,-24],[9,-10],[9,4],[2,5],[-5,5],[-12,10],[-17,15]],
 [[113,-22],[119,-19],[122,-14],[129,-15],[132,-11],[138,-12],[141,-18],[146,-19],[153,-27],[150,-35],[143,-39],[137,-35],[131,-32],[122,-34],[115,-31]],
 [[46,-13],[50,-16],[49,-24],[45,-26],[43,-22]],
 [[130,32],[134,34],[138,37],[141,42],[145,44],[143,39],[140,35],[135,33]],
 [[-10,50],[-6,50],[-3,54],[-3,58],[-6,59],[-8,55]],
 [[-24,64],[-16,63],[-13,66],[-20,67]],
 [[95,5],[104,-2],[106,-6],[101,-4]],[[108,-1],[116,-4],[119,2],[113,7]],[[130,-3],[141,-3],[150,-7],[146,-10],[137,-8]],
 [[166,-35],[174,-40],[177,-42],[173,-44],[169,-41]],[[166,-45],[170,-43],[172,-41],[173,-44],[168,-47]]
 ];

function earthAtlas() {
  const c = document.createElement('canvas');
  c.width = 2048;
  c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = PALETTE.ocean;
  g.fillRect(0, 0, c.width, c.height);
  const xy = ([lon, lat]) => [((lon + 180) / 360) * c.width, ((90 - lat) / 180) * c.height];
  const draw = (points) => {
    g.beginPath();
    points.map(xy).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
  };
  g.lineJoin = g.lineCap = 'round';
  for (const p of CONTINENTS) {
    draw(p);
    g.strokeStyle = '#76b9bd';
    g.lineWidth = 13;
    g.stroke();
    g.fillStyle = PALETTE.land;
    g.fill();
    g.strokeStyle = '#294c45';
    g.lineWidth = 2.3;
    g.stroke();
  }
  g.fillStyle = PALETTE.ice;
  draw([[-180, 85], [-150, 83], [-125, 84], [-100, 82], [-70, 84], [-40, 83], [0, 85], [35, 83], [70, 84], [105, 82], [140, 84], [180, 85], [180, 90], [-180, 90]]);
  g.fill();
  draw([[-180, -72], [-140, -70], [-110, -74], [-80, -76], [-62, -64], [-52, -66], [-55, -73], [-15, -70], [30, -69], [75, -67], [115, -65], [150, -70], [180, -72], [180, -90], [-180, -90]]);
  g.fill();
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Earth with simplified continents, its north pole up (+y). Turn
// `group.userData.globe` about y for the time of day.
export function earth({ at, radius = 2 } = {}) {
  const g = new THREE.Group();
  const globe = solid(new THREE.SphereGeometry(radius, 96, 64), toon('#ffffff', { map: earthAtlas() }), g);
  g.userData.globe = globe;
  return placed(g, at);
}

function moonAtlas() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = PALETTE.moon;
  g.fillRect(0, 0, c.width, c.height);
  let seed = 31;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0), seed / 4294967296);
  g.fillStyle = PALETTE.moonDark;
  for (let i = 0; i < 9; i++) {
    g.beginPath();
    g.ellipse(rand() * c.width, 110 + rand() * 290, 50 + rand() * 80, 30 + rand() * 50, rand() * 3, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < 46; i++) {
    const x = rand() * c.width,
      y = 40 + rand() * 430,
      r = 5 + rand() * 16;
    g.fillStyle = '#a19e98';
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#cfccc4';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, y, r, 0.6, 3.4);
    g.stroke();
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// The Moon: grey, with dark seas and craters.
export function moon({ at, radius = 0.55 } = {}) {
  const g = new THREE.Group();
  solid(new THREE.SphereGeometry(radius, 64, 44), toon('#ffffff', { map: moonAtlas() }), g);
  return placed(g, at);
}

// A thin circle in the horizontal plane showing a path round the origin.
export function orbit({ radius = 10, colour = '#8fb4c9', opacity = 0.35 } = {}) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.03, radius + 0.03, 160),
    flat(colour, { transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  return unlined(ring);
}
