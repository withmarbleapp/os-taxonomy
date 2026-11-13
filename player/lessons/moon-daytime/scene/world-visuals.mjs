import * as THREE from '../vendor/three.module.min.js';
// Original illustrative atlas and model. No remote images or geometry assets.
const INK='#172a32';
function outline(mesh,amount=.012){
 const material=new THREE.MeshBasicMaterial({color:INK,side:THREE.BackSide,toneMapped:false});
 const shell=new THREE.Mesh(mesh.geometry,material);shell.scale.setScalar(1+amount);mesh.add(shell);return mesh;
}
function atlas(){
 const c=document.createElement('canvas');c.width=2048;c.height=1024;const g=c.getContext('2d');
 g.fillStyle='#468fab';g.fillRect(0,0,c.width,c.height);
 const xy=([lon,lat])=>[(lon+180)/360*c.width,(90-lat)/180*c.height];
 // Simplified recognizable continental silhouettes, not a navigation map.
 const continents=[
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
 const draw=(points)=>{g.beginPath();points.map(xy).forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();};
 g.lineJoin='round';g.lineCap='round';
 for(const p of continents){draw(p);g.strokeStyle='#76b9bd';g.lineWidth=13;g.stroke();g.fillStyle='#b9c888';g.fill();g.strokeStyle='#294c45';g.lineWidth=2.3;g.stroke();}
 // Small polar cap; no rectangular ice band wrapping the globe.
 const ice=[[-180,85],[-150,83],[-125,84],[-100,82],[-70,84],[-40,83],[0,85],[35,83],[70,84],[105,82],[140,84],[180,85],[180,90],[-180,90]];
 draw(ice);g.fillStyle='#e6eee2';g.fill();
 const south=[[-180,-72],[-140,-70],[-110,-74],[-80,-76],[-62,-64],[-52,-66],[-55,-73],[-15,-70],[30,-69],[75,-67],[115,-65],[150,-70],[180,-72],[180,-90],[-180,-90]];
 draw(south);g.fillStyle='#e6eee2';g.fill();g.strokeStyle='#294c45';g.lineWidth=2;g.stroke();
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;return tex;
}
export function createEarthVisual(radius){
 const root=new THREE.Group();root.name='Illustrated north-pole Earth';
 // Match the Moon's matte material and shared scene lights: curvature, not a binary mask, forms the terminator.
 const material=new THREE.MeshStandardMaterial({color:'#ffffff',map:atlas(),roughness:.9,metalness:0});
 const surface=new THREE.Mesh(new THREE.SphereGeometry(radius,112,80),material);surface.rotation.x=Math.PI/2;root.add(surface);
 outline(surface,.009);
 return {root,surface};
}
function suitMaterial(color){
 // Graphic fill light preserves the small explorer's legibility as an observer marker.
 return new THREE.ShaderMaterial({uniforms:{colour:{value:new THREE.Color(color)}},toneMapped:false,
 vertexShader:'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 colour;varying vec3 n;void main(){float l=dot(normalize(n),normalize(vec3(-.6,.8,1.)));float shade=l<-.15?.52:l<.45?.78:1.;gl_FragColor=vec4(colour*shade,1.);\n#include <colorspace_fragment>\n}'});
}
export function createExplorerVisual(){
 const root=new THREE.Group();root.name='Field explorer';
 const ivory=suitMaterial('#f2e7ca'),red=suitMaterial('#dc6e47'),teal=suitMaterial('#527c80'),dark=suitMaterial('#263c46');
 const glass=new THREE.MeshBasicMaterial({color:'#254c5c',toneMapped:false});
 const ink=new THREE.MeshBasicMaterial({color:INK,toneMapped:false});
 function part(geo,mat,xyz,scale=[1,1,1],weight=.035){const m=new THREE.Mesh(geo,mat);m.position.set(...xyz);m.scale.set(...scale);root.add(m);if(weight)outline(m,weight);return m;}
 const capsule=(r,len)=>new THREE.CapsuleGeometry(r,len,5,12);
 // Grounded, articulated silhouette: two soles, trouser legs and an asymmetric arm gesture.
 for(const s of [-1,1]){
  part(new THREE.SphereGeometry(1,16,12),dark,[s*.064,.029,.025],[.055,.027,.078],.035);
  part(capsule(.039,.105),ivory,[s*.058,.103,0]);
  part(capsule(.043,.022),red,[s*.058,.073,.006]);
 }
 part(capsule(.099,.10),ivory,[0,.245,0],[1,1,.76],.025);
 part(new THREE.BoxGeometry(.15,.041,.15),teal,[0,.211,0],[1,1,1],.03);
 // Compact daypack sits behind the torso, not between the boots and ground.
 part(new THREE.BoxGeometry(.16,.19,.09),teal,[0,.255,-.088],[1,1,1],.025);
 part(new THREE.BoxGeometry(.072,.085,.025),red,[0,.269,.078],[1,1,1],.04);
 part(new THREE.BoxGeometry(.038,.009,.005),ivory,[0,.281,.093],[1,1,1],0);
 const left=part(capsule(.035,.105),ivory,[-.133,.259,.002]);left.rotation.z=-.34;
 part(new THREE.SphereGeometry(.039,12,10),red,[-.159,.193,.012],[1,1,.9]);
 const right=part(capsule(.035,.084),ivory,[.129,.29,.01]);right.rotation.z=.64;
 const forearm=part(capsule(.034,.060),ivory,[.15,.357,.035]);forearm.rotation.z=-.54;
 part(new THREE.SphereGeometry(.038,12,10),red,[.126,.398,.058],[1,1,.9]);
 // Structured helmet: dark neck gasket, cream shell, inset visor, restrained reflection.
 part(new THREE.CylinderGeometry(.085,.085,.035,24),dark,[0,.352,0],[1,1,.85],.02);
 part(new THREE.SphereGeometry(.128,32,24),ivory,[0,.462,0],[1,.96,.94],.025);
 part(new THREE.SphereGeometry(.105,32,20),ink,[0,.465,.067],[1,.64,.66],0);
 part(new THREE.SphereGeometry(.095,32,20),glass,[0,.469,.079],[1,.59,.62],0);
 const shine=part(new THREE.SphereGeometry(1,16,12),new THREE.MeshBasicMaterial({color:'#9fc8c7',toneMapped:false}),[-.036,.49,.132],[.027,.009,.004],0);shine.rotation.z=.3;
 for(const s of [-1,1])part(new THREE.CylinderGeometry(.033,.033,.017,16),red,[s*.126,.454,0],[1,1,1],.03).rotation.z=Math.PI/2;
 return {root};
}
