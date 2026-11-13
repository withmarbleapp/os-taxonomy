import * as THREE from '../vendor/three.module.min.js';
import {createSunVisual} from './space-visuals.mjs';
import {SUN_X} from '../model/geometry.mjs';
import {createLandscape} from './ground-landscape.mjs';
const DEG = Math.PI / 180, DISTANCE = 1800, EYE_HEIGHT = 1.6;
// A local metre-scale rendering of the same observer's sky. Only display sizes
// are exaggerated. Celestial directions and illumination come from the model.
export function createGroundView({moonMap}) {
 const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(72,1,.1,7000);
 camera.position.set(0,EYE_HEIGHT,0);camera.up.set(0,1,0);
 let yaw=0,pitch=12*DEG, width=1440,height=900, day=true, target=null;
 let bodies={};
 const landscape=createLandscape(),terrain=landscape.root,land=landscape.land,path=landscape.path;scene.add(terrain,landscape.clouds);
 function add(geo,mat,parent=scene){const m=new THREE.Mesh(geo,mat);parent.add(m);return m;}
 let seed=271;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{isDay:{value:1}},vertexShader:'varying vec3 direction; void main(){direction=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 direction;uniform float isDay;
 vec3 atmosphere(float h){return mix(vec3(.84,.92,.88),vec3(.26,.59,.79),pow(clamp(h,0.,1.),.42));}
 void main(){float h=normalize(direction).y;vec3 daytime=atmosphere(h);vec3 night=mix(vec3(.075,.12,.19),vec3(.016,.033,.075),pow(max(h,0.),.5));gl_FragColor=vec4(mix(night,daytime,isDay),1.);}`});
 const dome=add(new THREE.SphereGeometry(5500,48,24),skyMat,scene);dome.renderOrder=-2;
 const solar=createSunVisual(DISTANCE*Math.tan(1.5*DEG),{daylight:true});const sun=solar.root;scene.add(sun);
 const moonMat=new THREE.ShaderMaterial({uniforms:{map:{value:moonMap},lightDirection:{value:new THREE.Vector3(-1,0,0)},background:{value:new THREE.Color()},isDay:{value:1}},vertexShader:'varying vec3 worldNormal;varying vec2 texCoord;void main(){worldNormal=normalize(mat3(modelMatrix)*normal);texCoord=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D map;uniform vec3 lightDirection;uniform vec3 background;uniform float isDay;varying vec3 worldNormal;varying vec2 texCoord;
 void main(){float incidence=dot(normalize(worldNormal),normalize(lightDirection));float lit=smoothstep(-.012,.025,incidence);vec3 textureColour=texture2D(map,texCoord).rgb;vec3 pale=vec3(.92,.94,.93)*mix(.70,1.,textureColour.r);vec3 dark=mix(vec3(.015,.025,.045),background,isDay);gl_FragColor=vec4(mix(dark,pale,lit*.96),1.);}`});
 const moon=add(new THREE.SphereGeometry(DISTANCE*Math.tan(1.9*DEG),64,40),moonMat,scene);
 const starPositions=[];for(let i=0;i<200;i++){const a=random()*Math.PI*2,alt=random()*Math.PI/2;starPositions.push(Math.sin(a)*Math.cos(alt)*3000,Math.sin(alt)*3000,Math.cos(a)*Math.cos(alt)*3000);}
 const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#e6efff',size:3,fog:false}));scene.add(stars);
 function orient(){camera.lookAt(camera.position.clone().add(new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch))));camera.updateMatrixWorld();}
 function local(v,theta){const c=Math.cos(theta),s=Math.sin(theta);return new THREE.Vector3(-s*v.x+c*v.y,c*v.x+s*v.y,-v.z);}
 function update(f,theta){
  const p=new THREE.Vector3(...f.observer,0),sunWorld=new THREE.Vector3(SUN_X,0,0),moonWorld=new THREE.Vector3(...f.moon,0);
  const sunDirection=local(sunWorld.clone().sub(p).normalize(),theta),moonDirection=local(moonWorld.clone().sub(p).normalize(),theta);
  bodies={sun:{direction:sunDirection,altitude:f.sunAltitude},moon:{direction:moonDirection,altitude:f.moonAltitude}};
  sun.position.copy(sunDirection).multiplyScalar(DISTANCE).add(camera.position);moon.position.copy(moonDirection).multiplyScalar(DISTANCE).add(camera.position);
  sun.visible=f.day;moon.visible=f.visible;day=f.day;
  landscape.update(sunDirection,day,0);landscape.updateClouds([sunDirection,moonDirection]);
  skyMat.uniforms.isDay.value=day?1:0;moonMat.uniforms.isDay.value=day?1:0;
  const h=Math.max(0,Math.min(1,moonDirection.y)),blend=Math.pow(h,.42);moonMat.uniforms.background.value.setRGB(.84*(1-blend)+.26*blend,.92*(1-blend)+.59*blend,.88*(1-blend)+.79*blend);
  moonMat.uniforms.lightDirection.value.copy(local(sunWorld.clone().sub(moonWorld).normalize(),theta));
  stars.visible=!day;
 }
 function desired(body,locateHidden=false){const b=bodies[body],d=b.direction;const aim=locateHidden&&b.altitude<=0?THREE.MathUtils.clamp(b.altitude+14*DEG,-76*DEG,16*DEG):Math.max(8*DEG,Math.min(75*DEG,b.altitude-(width/height<.8?12:14)*DEG));return {yaw:Math.atan2(d.x,-d.z),pitch:aim};}
 function lookAtBody(body,animated=true,locateHidden=false){const d=desired(body,locateHidden);if(!animated){yaw=d.yaw;pitch=d.pitch;target=null;orient();}else{let delta=d.yaw-yaw;while(delta>Math.PI)delta-=Math.PI*2;while(delta< -Math.PI)delta+=Math.PI*2;target={yaw:yaw+delta,pitch:d.pitch};}}
 function enter(){lookAtBody('moon',false);terrain.rotation.y=-yaw;}
 function look(dx,dy){target=null;yaw+=dx;pitch=THREE.MathUtils.clamp(pitch+dy,-80*DEG,80*DEG);orient();}
 function tick(seconds=0){solar.tick(seconds);landscape.uniforms.time.value=seconds;if(target){yaw+=(target.yaw-yaw)*.11;pitch+=(target.pitch-pitch)*.11;if(Math.abs(target.yaw-yaw)+Math.abs(target.pitch-pitch)<.001)target=null;orient();}}
 function resize(w,h){width=w;height=h;landscape.resize(w,h);camera.aspect=w/h;camera.fov=72;camera.updateProjectionMatrix();}
 function screenPosition(body){const object=body==='moon'?moon:sun;const local=object.position.clone().applyMatrix4(camera.matrixWorldInverse),q=object.position.clone().project(camera);const x=(q.x+1)*width/2,y=(1-q.y)*height/2;return {x,y,inView:local.z<0&&q.z<1&&x>36&&x<width-36&&y>36&&y<height-36,altitude:bodies[body].altitude};}
 function snapshot(){return {yaw,pitch,fov:camera.fov,day,moonVisible:moon.visible,sunVisible:sun.visible,eyeHeight:camera.position.y};}
 orient();return {scene,camera,update,enter,look,lookAtBody,tick,resize,snapshot,screenPosition,moon,sun,land,path,landscape};
}
