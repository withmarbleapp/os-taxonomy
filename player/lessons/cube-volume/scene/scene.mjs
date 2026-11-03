import * as THREE from '../vendor/three.module.min.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';
// Visual geometry adapted from the approved Hidden Cubes standalone lesson.
// This renderer consumes snapshots and sends gestures; it never scores a plan.
export function createCubeScene({canvas,onPlace,onRotate,onOpen}){
 const world=canvas,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-8,8,6,-6,.1,100);camera.position.set(9,13,12);camera.lookAt(0,1,0);
scene.add(new THREE.HemisphereLight(0xffffff,0xb9a689,.95));const light=new THREE.DirectionalLight(0xffffff,1.6);light.position.set(-3,9,5);scene.add(light);
const gradient=new THREE.DataTexture(new Uint8Array([85,160,235]),3,1,THREE.RedFormat);gradient.needsUpdate=true;gradient.minFilter=gradient.magFilter=THREE.NearestFilter;
const materials=[0x79c6c2,0xffcc69,0xe79778,0x9db8d6].map(c=>new THREE.MeshToonMaterial({color:c,gradientMap:gradient}));
const outline=new THREE.LineBasicMaterial({color:0x242722});
const edgeParts=[];for(let axis=0;axis<3;axis++)for(const a of [-.485,.485])for(const b of [-.485,.485]){const geo=new THREE.CylinderGeometry(.009,.009,.985,5);if(axis===0)geo.rotateZ(Math.PI/2);if(axis===2)geo.rotateX(Math.PI/2);geo.translate(axis===0?0:a,axis===1?0:axis===0?a:b,axis===2?0:b);edgeParts.push(geo);}const thickEdges=mergeGeometries(edgeParts);edgeParts.forEach(g=>g.dispose());const edgeMat=new THREE.MeshBasicMaterial({color:0x242722});
const cubeGeo=new THREE.BoxGeometry(.97,.97,.97),edgeGeo=new THREE.EdgesGeometry(cubeGeo);const ghostMat=new THREE.MeshBasicMaterial({color:0xb9b5a5,transparent:true,opacity:.21,depthWrite:false});
const root=new THREE.Group();scene.add(root);const cubes=new THREE.Group();root.add(cubes);const container=new THREE.Group();root.add(container);
const rims=[];const floor=new THREE.Mesh(new THREE.CylinderGeometry(5.0,5.1,.24,96),new THREE.MeshToonMaterial({color:0xece1c8,gradientMap:gradient}));floor.position.y=-.25;root.add(floor);
for(const y of [-.13,-.37]){const rim=new THREE.Mesh(new THREE.TorusGeometry(5.04,.013,6,96),edgeMat);rim.rotation.x=Math.PI/2;rim.position.y=y;root.add(rim);rims.push(rim);}
// An understated ground shadow is a local procedural texture, embedded by construction.
const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d'),gr=cx.createRadialGradient(64,64,15,64,64,64);gr.addColorStop(0,'rgba(62,52,34,.22)');gr.addColorStop(1,'rgba(62,52,34,0)');cx.fillStyle=gr;cx.fillRect(0,0,128,128);const shadow=new THREE.Mesh(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.39;root.add(shadow);
let state,parts=[],angle=0,targetAngle=0,spread=0,targetSpread=0,drag=null;
function clearGroup(g){while(g.children.length){const o=g.children[0];g.remove(o);if(o.userData.disposable)o.geometry.dispose();}}
function makeCube(x,y,z,ghost=false){const g=new THREE.Group(),m=new THREE.Mesh(cubeGeo,ghost?ghostMat:materials[y%materials.length]);g.add(m);const e=ghost?new THREE.LineSegments(edgeGeo,new THREE.LineBasicMaterial({color:0x777365,transparent:true,opacity:.65})):new THREE.Mesh(thickEdges,edgeMat);g.add(e);g.userData={x,y,z,ghost};m.userData.owner=g;return g;}
function rebuild(){clearGroup(cubes);clearGroup(container);parts=[];const [w,d,h]=state.dims;const radius=Math.max(w,d)*.65+.55;floor.scale.set(radius/5,1,radius/5);rims.forEach(r=>r.scale.set(radius/5,radius/5,1));
for(let y=0;y<h;y++)for(let z=0;z<d;z++)for(let x=0;x<w;x++){
 let ghost=state.mode==='fill'&&!state.filled.has(`${x},${z}`);if(state.mode==='fill'&&y>0)continue;
 const g=makeCube(x,y,z,ghost);g.position.set(x-(w-1)/2,y+.5,z-(d-1)/2);cubes.add(g);parts.push(g);
}
const frame=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w+.16,h+.14,d+.16)),new THREE.LineBasicMaterial({color:0x5d5a4c,transparent:true,opacity:.45}));frame.position.y=h/2;frame.userData.disposable=true;container.add(frame);
world.setAttribute('aria-label',`A ${state.mode==='fill'?'partly filled':'completely filled'} rectangular box of equal unit cubes. It has ${w} cubes across, ${d} rows back and ${h} layers high.`);
resize();}

 let cover=true,lastKey='',previousDepth=3,grow=1;
 function update(snapshot,isCover=false){
  const s=snapshot.state;cover=isCover;
  const key=JSON.stringify([s.sceneId,s.dims,s.filled,cover]);
  state={...s,dims:cover?[3,3,3]:s.dims,mode:s.task==='fill'&&!s.layerComplete?'fill':'explore',filled:new Set(s.filled)};
  targetAngle=cover?-.25:s.rotation;targetSpread=cover?.22:s.layersOpen?1:0;
  if(key!==lastKey){grow=s.dims[1]>previousDepth&&s.sceneId===lastScene?0:1;previousDepth=s.dims[1];lastScene=s.sceneId;rebuild();lastKey=key;}
 }
 let lastScene='';
 function frameScene(){
  const w=innerWidth,h=innerHeight,narrow=w<=800;
  const instruction=(document.getElementById('explanation')?.getBoundingClientRect()??{bottom:170});
  const plan=document.getElementById('plan-controls'),actions=document.getElementById('actions');
  const top=cover?(narrow?h*.38:65):(narrow?instruction.bottom+18:90);
  const bottom=cover?h*.87:Math.min(h-(narrow?150:140),!plan.hidden&&narrow?plan.getBoundingClientRect().top-15:h,!actions.hidden&&narrow?actions.getBoundingClientRect().top-15:h);
  const left=cover?(narrow?15:w*.47):(narrow?15:w*.43),right=w-(narrow?15:40);
  camera.clearViewOffset();camera.top=6.25;camera.bottom=-6.25;camera.right=6.25*w/h;camera.left=-camera.right;camera.updateProjectionMatrix();camera.updateMatrixWorld();
  root.scale.setScalar(1);root.updateMatrixWorld(true);
  const [bw,bd,bh]=state.dims,r=Math.max(bw,bd)*.65+.55,points=[];
  for(const x of [-bw/2,bw/2])for(const z of [-bd/2,bd/2])for(const y of [0,bh+spread*(bh-1)*2])points.push(new THREE.Vector3(x,y,z));
  for(let i=0;i<8;i++)points.push(new THREE.Vector3(r*Math.cos(i*Math.PI/4),-.4,r*Math.sin(i*Math.PI/4)));
  const bounds=()=>{const ps=points.map(v=>root.localToWorld(v.clone()).project(camera));return{x0:Math.min(...ps.map(v=>(v.x+1)*w/2)),x1:Math.max(...ps.map(v=>(v.x+1)*w/2)),y0:Math.min(...ps.map(v=>(1-v.y)*h/2)),y1:Math.max(...ps.map(v=>(1-v.y)*h/2))};};
  let b=bounds();root.scale.setScalar(Math.max(.15,Math.min(1.25,(right-left)/(b.x1-b.x0),Math.max(100,bottom-top)/(b.y1-b.y0))));root.updateMatrixWorld(true);b=bounds();
  camera.setViewOffset(w,h,(b.x0+b.x1)/2-(left+right)/2,(b.y0+b.y1)/2-(top+bottom)/2,w,h);camera.updateProjectionMatrix();
 }
 function resize(){renderer.setSize(innerWidth,innerHeight,false);if(state)frameScene();}
 const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();
 function hit(e){const r=canvas.getBoundingClientRect();mouse.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(mouse,camera);return ray.intersectObjects(cubes.children,true).find(h=>h.object.userData.owner)?.object.userData.owner;}
 canvas.addEventListener('pointerdown',e=>{if(cover)return;drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,g:hit(e),opened:state.layersOpen};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||state.mode==='fill')return;const dx=e.clientX-drag.x,dy=e.clientY-drag.startY;if(Math.abs(dy)>35&&Math.abs(dy)>Math.abs(e.clientX-drag.startX)){const opened=dy<0;if(opened!==drag.opened){onOpen(opened);drag.opened=opened;}}else onRotate(dx*.008);drag.x=e.clientX;drag.y=e.clientY;});
 canvas.addEventListener('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<12&&drag.g&&state.mode==='fill')onPlace(drag.g.userData.x,drag.g.userData.z);drag=null;});canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('keydown',e=>{if(cover)return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(e.key==='ArrowUp'||e.key==='ArrowDown')onOpen(e.key==='ArrowUp');else onRotate(e.key==='ArrowRight'?.2:-.2);}});
 function animate(){requestAnimationFrame(animate);if(!state)return;const t=reduce?1:.13;grow=Math.min(1,grow+(reduce?1:.075));angle+=(targetAngle-angle)*t;spread+=(targetSpread-spread)*t;root.rotation.y=angle;root.position.y=-spread*(state.dims[2]-1);
  const seconds=performance.now()/1000;
  for(const g of parts){const {x,y,z}=g.userData;g.position.y=y+.5+y*spread*2;
   const inside=state.teachingFocus==='inside'&&spread>.3&&x>0&&z>0&&y>0&&x<state.dims[0]-1&&z<state.dims[1]-1&&y<state.dims[2]-1;
   const unit=state.teachingFocus==='unit'&&x===state.dims[0]-1&&z===state.dims[1]-1&&y===0;
   const layer=state.teachingFocus==='layers'&&y===0;
   g.children[0].material=g.userData.ghost?ghostMat:inside||unit?materials[2]:materials[y%materials.length];
   const pulse=!reduce&&(inside||unit||layer)?1+Math.sin(seconds*2.2)*.018:1;
   g.scale.setScalar(grow<1&&z===state.dims[1]-1?Math.max(.01,grow):pulse);
  }
  frameScene();renderer.render(scene,camera);
 }
 addEventListener('resize',resize);resize();animate();
 return{update,presentation:()=>({view:'block',layersVisible:spread>.9,rotation:angle,cubeCount:parts.filter(g=>!g.userData.ghost).length,fullyBuriedCubes:state?.interiorCount??0,highlightedUnit:state?.teachingFocus==='unit',highlightedLayer:state?.teachingFocus==='layers',highlightedInterior:state?.teachingFocus==='inside'&&(state?.interiorCount??0)>0,landscape:false}),stats:()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles}),project:(x,y,z)=>{const p=root.localToWorld(new THREE.Vector3(x,y,z)).project(camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};}};
}
