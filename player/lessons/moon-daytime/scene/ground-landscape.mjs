import * as THREE from '../vendor/three.module.min.js';
import {mergeGeometries} from '../vendor/BufferGeometryUtils.js';

// Original procedural countryside. Ground-only shaders use a deliberate printed
// palette and hard light bands; the space scene never imports these materials.
const vertex=`varying vec3 vNormal;varying vec3 vWorld;varying vec2 vUv;
void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}`;
const fragment=`uniform vec3 colour;uniform vec3 sunDirection;uniform float daylight;uniform float surface;uniform float time;
varying vec3 vNormal;varying vec3 vWorld;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 base=colour;float nl=dot(normalize(vNormal),normalize(sunDirection));float band=nl>.5?1.:nl>-.05?.84:.62;
 if(surface==1.){float field=sin(vWorld.x*.035+sin(vWorld.z*.032)*1.8)+sin(vWorld.z*.041);base*=field>.65?1.08:field<-.7?.91:1.;}
 if(surface==2.){vec2 p=vec2(vUv.x*5.,vUv.y);float row=floor(p.y);p.x+=mod(row,2.)*.5;vec2 cell=fract(p);float edge=min(min(cell.x,1.-cell.x),min(cell.y,1.-cell.y));float stone=hash(vec2(floor(p.x),row));base*=.85+stone*.24;if(edge<.025)base=vec3(.19,.24,.23);else if(cell.y>.89)base*=.8;else if(cell.y<.08)base*=1.15;}
 if(surface==4.){float r=length(vUv-.5)*2.;float ripple=step(.88,sin(r*42.-time*2.));base=mix(vec3(.27,.61,.60),vec3(.75,.92,.82),ripple*.65);base+=vec3(.04,.07,.06)*step(.65,sin(vUv.x*23.+vUv.y*17.));}
 if(surface==3.){vec2 q=vWorld.xy*3.4+vWorld.z*.7;vec2 tile=floor(q);vec2 leaf=fract(q)-.5;float fleck=abs(leaf.x+leaf.y*.4)+abs(leaf.y)*1.9;if(hash(tile)>.67&&fleck<.25)base*=1.13;}
 vec3 shaded=base*band;shaded=mix(shaded,vec3(.60,.74,.76),smoothstep(180.,1800.,length(vWorld.xz))*.52);
 gl_FragColor=vec4(shaded*mix(vec3(.21,.29,.43),vec3(1.),daylight),1.);}`;
const outlineVertex=`uniform float stroke;uniform vec2 resolution;varying float distanceToEye;
void main(){vec4 view=modelViewMatrix*vec4(position,1.);vec3 n=normalize(normalMatrix*normal);vec4 clip=projectionMatrix*view;vec2 dir=n.xy/max(length(n.xy),.001);clip.xy+=dir*stroke*clamp(100./max(-view.z,1.),.30,1.)*2./resolution*clip.w;gl_Position=clip;distanceToEye=length(view.xyz);}`;
const outlineFragment=`varying float distanceToEye;uniform float daylight;void main(){vec3 ink=mix(vec3(.045,.065,.06),vec3(.32,.42,.40),smoothstep(120.,1400.,distanceToEye)*.7);gl_FragColor=vec4(ink*mix(.4,1.,daylight),1.);}`;
const grassVertex=`uniform float time;varying vec2 vUv;varying vec3 vWorld;
void main(){vUv=uv;vec3 p=position;p.x+=sin(time*1.25+position.x*.45+position.z*.31)*.045*uv.y;vec4 w=modelMatrix*vec4(p,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const grassFragment=`uniform float daylight;varying vec2 vUv;varying vec3 vWorld;
float blade(vec2 p,float root,float lean,float height,float width){float y=p.y/height;float centre=root+lean*y*y;return max(abs(p.x-centre)-width*(1.-y),max(-y,y-1.));}
void main(){float d=min(blade(vUv,.22,-.18,.69,.05),min(blade(vUv,.44,.09,.98,.052),min(blade(vUv,.64,.19,.8,.058),blade(vUv,.79,.14,.50,.05))));if(d>0.)discard;
 vec3 col=mix(vec3(.19,.34,.17),vec3(.57,.71,.29),vUv.y);float variation=sin(vWorld.x*2.1+vWorld.z*1.3);col*=.94+variation*.08;if(d>-.008)col=mix(vec3(.10,.18,.08),col,smoothstep(15.,75.,length(vWorld.xz))*.7);gl_FragColor=vec4(col*mix(vec3(.24,.31,.44),vec3(1.),daylight),1.);}`;
const cloudVertex=`varying vec2 vUv;void main(){vUv=uv;vec4 centre=modelViewMatrix*vec4(0.,0.,0.,1.);centre.xy+=position.xy;gl_Position=projectionMatrix*centre;}`;
const cloudFragment=`uniform float variation;varying vec2 vUv;
void main(){vec2 p=vec2((vUv.x-.5)*2.8,(vUv.y-.5)*1.8);p.x+=sin(p.y*9.+variation)*.025;float d=length((p-vec2(-.75,-.03))/vec2(.45,.24))-1.;d=min(d,length((p-vec2(-.35,.13))/vec2(.45,.36))-1.);d=min(d,length((p-vec2(.09,.24))/vec2(.44,.46))-1.);d=min(d,length((p-vec2(.52,.06))/vec2(.40,.30))-1.);d=min(d,length((p-vec2(.86,-.07))/vec2(.37,.20))-1.);d=max(d,-p.y-.25);if(d>0.)discard;float belly=-.08+.035*sin(p.x*8.+variation);vec3 c=p.y<belly?vec3(.70,.82,.84):vec3(1.,.99,.91);if(p.y<belly+.055&&p.y>belly)c=vec3(.84,.90,.88);if(d>-.035)c=vec3(.13,.23,.25);gl_FragColor=vec4(c,1.);}`;

export function terrainHeight(x,z){
 const r=Math.hypot(x,z),fade=THREE.MathUtils.smoothstep(r,10,75);
 // Ground at the observer remains level; broad low swells preserve the horizon.
 return fade*(2.2+2.0*Math.sin(x*.022+z*.009)+1.6*Math.sin(z*.026-x*.005));
}
export const roadCentre=z=>Math.sin((-z+5)*.017)*5+Math.sin((-z+5)*.005)*11;
const plaza={x:0,z:-7,radius:9};
const insidePlaza=(x,z,margin=0)=>Math.hypot(x-plaza.x,z-plaza.z)<plaza.radius+margin;
export function createLandscape(){
 const root=new THREE.Group();root.name='Cel shaded countryside';
 const uniforms={sunDirection:{value:new THREE.Vector3(-.5,.8,.2)},daylight:{value:1},time:{value:0},resolution:{value:new THREE.Vector2(1440,900)}};
 const batches=new Map(),materials=[];let seed=271;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const palette={bark:'#70513b',birch:'#e4dec2',oak:'#6f9f49',oakLight:'#a2bc5b',pine:'#397461',pineLight:'#579276',willow:'#98b15b',stone:'#b9b5a3',roof:'#bd6441',wall:'#ebd9b2',dark:'#25372e'};
 function mat(hex,surface=0){const c=new THREE.Color(hex);c.convertLinearToSRGB();const m=new THREE.ShaderMaterial({uniforms:{...uniforms,colour:{value:c},surface:{value:surface}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide});materials.push(m);return m;}
 function mesh(geo,material){const o=new THREE.Mesh(geo,material);root.add(o);return o;}
 function shape(geo,colour,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,ink=true){
  const key=colour+'|'+ink;if(!batches.has(key))batches.set(key,[]);
  const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz));
  const g=geo.clone().applyMatrix4(m);if(g.index){const n=g.toNonIndexed();g.dispose();batches.get(key).push(n);}else batches.get(key).push(g);
 }
 const box=new THREE.BoxGeometry(1,1,1),sphere=new THREE.IcosahedronGeometry(1,1),foliage=new THREE.IcosahedronGeometry(1,2),cone=new THREE.ConeGeometry(1,1,7),trunkGeo=new THREE.CylinderGeometry(.65,1,1,7);
 const fp=foliage.attributes.position;for(let i=0;i<fp.count;i++){const x=fp.getX(i),y=fp.getY(i),z=fp.getZ(i),r=1+.06*Math.sin(x*23+y*12)+.045*Math.sin(z*26-x*18);fp.setXYZ(i,x*r,y*r,z*r);}foliage.computeVertexNormals();
 function branch(ax,ay,az,bx,by,bz,r,colour){const a=new THREE.Vector3(ax,ay,az),b=new THREE.Vector3(bx,by,bz),d=b.clone().sub(a),g=trunkGeo.clone();g.scale(r,d.length(),r);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));g.translate(...a.add(b).multiplyScalar(.5).toArray());shape(g,colour,0,0,0,1,1,1,0,0,0,r>=.04);g.dispose();}
 const groundGeo=new THREE.PlaneGeometry(1200,1200,240,240);groundGeo.rotateX(-Math.PI/2);groundGeo.rotateY(.13);const p=groundGeo.attributes.position;
 for(let i=0;i<p.count;i++)p.setY(i,terrainHeight(p.getX(i),p.getZ(i)));groundGeo.computeVertexNormals();
 const farLand=mesh(new THREE.PlaneGeometry(18000,18000).rotateX(-Math.PI/2),mat('#83a653',1));farLand.position.y=-.2;
 const land=mesh(groundGeo,mat('#83a653',1));land.name='Rolling meadow';
 // A winding ribbon of stone paving with individually edged staggered blocks.
 const positions=[],uvs=[],indices=[];
 for(let i=0;i<=360;i++){const z=-13-i*1.1,x=roadCentre(z),w=1.65;for(const side of [-1,1]){const px=x+side*w;positions.push(px,terrainHeight(px,z)+.045,z);uvs.push(side===-1?0:1,i*1.1/.72);}if(i){const a=i*2;indices.push(a-2,a-1,a,a,a-1,a+1);}}
 const roadGeo=new THREE.BufferGeometry();roadGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));roadGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));roadGeo.setIndex(indices);roadGeo.computeVertexNormals();const path=mesh(roadGeo,mat('#b9b9a7',2));path.name='Stone paved lane';
 // Low kerbs give the paving a sharp, hand-inked edge in the foreground.
 for(let z=-13;z> -120;z-=1.2)for(const side of [-1,1]){const x=roadCentre(z)+side*1.78;if(insidePlaza(x,z,.25))continue;shape(box,'#c9c7ad',x,terrainHeight(x,z)+.10,z,.22,.19,1.12,0,0,0,true);}
 // The lane opens into a circular paved gathering place around a fountain.
 // The observer stands on its rear edge; the lane ends inside the paving.
 const plazaGeo=new THREE.RingGeometry(0,plaza.radius,80,12);plazaGeo.rotateX(-Math.PI/2);plazaGeo.translate(plaza.x,0,plaza.z);
 const pp=plazaGeo.attributes.position,pu=plazaGeo.attributes.uv;
 for(let i=0;i<pp.count;i++){const x=pp.getX(i),z=pp.getZ(i);pp.setY(i,terrainHeight(x,z)+.065);pu.setXY(i,(x+1.65)/3.3,(-13-z)/.72);}plazaGeo.computeVertexNormals();
 const plazaMesh=mesh(plazaGeo,mat('#b9b9a7',2));plazaMesh.name='Fountain plaza paving';
 for(let i=0;i<80;i++){const a=i/80*Math.PI*2,x=plaza.x+Math.sin(a)*plaza.radius,z=plaza.z+Math.cos(a)*plaza.radius;if(z<plaza.z&&Math.abs(x-roadCentre(z))<2.1)continue;shape(box,'#c9c7ad',x,terrainHeight(x,z)+.12,z,.25,.20,.66,0,a+Math.PI/2,0);}
 const fx=-1.35,fz=-10.5,fy=terrainHeight(fx,fz)+.075;
 // Faceted limestone, a deep open basin and a small upper bowl.
 shape(new THREE.CylinderGeometry(1.85,1.94,.17,12),'#aaa78f',fx,fy+.085,fz);
 const basinProfile=[[0,.15],[1.34,.15],[1.34,.49],[1.43,.62],[1.64,.62],[1.70,.52],[1.70,.20],[1.80,.17],[0,.17]].map(p=>new THREE.Vector2(...p));
 shape(new THREE.LatheGeometry(basinProfile,24),'#d4ceb0',fx,fy,fz);
 shape(new THREE.TorusGeometry(1.54,.115,6,24),'#e1d9bc',fx,fy+.61,fz,1,1,1,Math.PI/2);
 shape(new THREE.CylinderGeometry(.28,.43,.95,10),'#bdb698',fx,fy+.78,fz);
 shape(new THREE.CylinderGeometry(.40,.40,.12,12),'#e1d9bc',fx,fy+1.24,fz);
 const bowlProfile=[[0,1.22],[.25,1.22],[.69,1.50],[.73,1.64],[.62,1.67],[.57,1.54],[.20,1.38],[0,1.38]].map(p=>new THREE.Vector2(...p));
 shape(new THREE.LatheGeometry(bowlProfile,24),'#d4ceb0',fx,fy,fz);
 shape(new THREE.CylinderGeometry(.11,.18,.36,10),'#bdb698',fx,fy+1.62,fz);
 const waterMat=mat('#70b9ae',4);
 for(const [radius,level]of [[1.33,.54],[.57,1.60]]){const water=mesh(new THREE.CircleGeometry(radius,48).rotateX(-Math.PI/2),waterMat);water.position.set(fx,fy+level,fz);water.name='Fountain rippling water';}
 for(let i=0;i<4;i++){const a=i*Math.PI/2+.3,dx=Math.sin(a),dz=Math.cos(a);const points=[[.10,1.80],[.27,2.10],[.48,1.99],[.61,1.67],[.86,1.32],[1.10,.55]].map(([r,y])=>new THREE.Vector3(fx+dx*r,fy+y,fz+dz*r));shape(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.027,6,false),'#b5e7de',0,0,0,1,1,1,0,0,0,false);
  shape(new THREE.TorusGeometry(.13,.012,4,20),'#d5f0df',fx+dx*1.10,fy+.555,fz+dz*1.10,1,1,1,Math.PI/2,0,0,false);
 }
 function tree(x,z,h,type){const y=terrainHeight(x,z),bark=type===2?palette.birch:palette.bark,crown=Math.hypot(x,z)>100?sphere:foliage;
  branch(x,y,z,x+.1*h,y+h*.68,z,h*.036,bark);
  if(type===1){ // Layered fir: irregular skirts, visible trunk and tiered tips.
   for(let j=0;j<4;j++){const k=j/4;shape(cone,j%2?palette.pineLight:palette.pine,x,y+h*(.37+k*.67),z,h*(.30-k*.22),h*(.47-k*.20),h*(.29-k*.2),0,j*.55,0);}
  }else if(type===2){ // Slender silver birch, lifted airy crowns, ink bark marks.
   for(let j=0;j<7;j++){const a=j*2.4,cy=y+h*(.50+j*.065),cx=x+Math.sin(a)*h*.15,cz=z+Math.cos(a)*h*.12;branch(x,cy-h*.14,z,cx,cy,cz,h*.012,bark);shape(crown,j%2?palette.oakLight:'#8ead54',cx,cy+h*.13,cz,h*.18,h*.22,h*.15,0,a,0);}
   for(let j=0;j<7;j++)shape(box,palette.dark,x+.045*h,y+h*(.10+j*.065),z+h*.034,h*.045,h*.009,h*.018,0,j*.9,0,false);
  }else if(type===3){ // Willow: wide umbrella with long hanging foliage fingers.
   for(let j=0;j<9;j++){const a=j*2.4,cx=x+Math.sin(a)*h*.27,cz=z+Math.cos(a)*h*.25;branch(x,y+h*.4,z,cx,y+h*.67,cz,h*.016,bark);shape(crown,j%2?palette.willow:'#779749',cx,y+h*.65,cz,h*.17,h*(.28+random()*.13),h*.16,0,a,.13*Math.sin(a));}
  }else{ // Spreading oak with branching structure and asymmetric lobed canopy.
   for(let j=0;j<8;j++){const a=j*2.4,cx=x+Math.sin(a)*h*.25,cz=z+Math.cos(a)*h*.23,cy=y+h*(.67+random()*.21);branch(x,y+h*.40,z,cx,cy-h*.1,cz,h*.022,bark);shape(crown,j%3===0?palette.oakLight:palette.oak,cx,cy,cz,h*.25,h*.21,h*.24,0,a,.18);}
  }
  // Flat irregular contact shadows anchor the trees, without expensive shadows.
  const shadow=new THREE.CircleGeometry(1,14);shadow.rotateX(-Math.PI/2);shadow.scale(h*.55,1,h*.35);shadow.translate(x+h*.2,0,z+h*.12);const sp=shadow.attributes.position;for(let k=0;k<sp.count;k++)sp.setY(k,terrainHeight(sp.getX(k),sp.getZ(k))+.055);shadow.computeVertexNormals();shape(shadow,'#607c40',0,0,0,1,1,1,0,0,0,false);shadow.dispose();
 }
 // Main framing trees flank an open road; distant groves vary species and scale.
 for(const [x,z,h,type]of [[-14,-31,7.5,0],[-17,-43,8.2,0],[20,-50,10,2],[-31,-65,10,3],[37,-75,12,1],[-27,40,8,1],[26,48,9,0],[56,8,11,3],[-58,10,12,2]])tree(x,z,h,type);
 for(let i=0;i<47;i++){const a=random()*Math.PI*2,r=95+random()*200,x=Math.sin(a)*r,z=Math.cos(a)*r;if(z<0&&Math.abs(x-roadCentre(z))<18)continue;tree(x,z,5+random()*9,i%4);}
 // A low stone wall and timber fence lead towards the village.
 for(let z=-65;z> -200;z-=3.5){const x=roadCentre(z)+7;shape(box,'#b1ad91',x,terrainHeight(x,z)+.5,z,.65,1,3.35);}
 for(let z=-30;z> -110;z-=6){const x=roadCentre(z)-6,y=terrainHeight(x,z);shape(box,'#8b7451',x,y+.65,z,.16,1.3,.16);for(const dy of [.4,.9])shape(box,'#a48b5a',x,y+dy,z-3,.12,.13,6);}
 // Village on the forward end of the lane: pitched roofs, chimneys and shutters.
 function house(x,z,w,d,h,roof){const y=terrainHeight(x,z);shape(box,palette.wall,x,y+h*.5,z,w,h,d);
  const g=new THREE.BufferGeometry();const a=[-w*.58,0,-d*.58,w*.58,0,-d*.58,0,h*.65,-d*.58,-w*.58,0,d*.58,w*.58,0,d*.58,0,h*.65,d*.58];g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(Array(12).fill(0),2));g.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,2,5,4,2,4,1]);g.computeVertexNormals();shape(g,roof,x,y+h,z);g.dispose();
  shape(box,'#c6b59a',x+w*.23,y+h*1.42,z-d*.2,.65,h*.62,.7);
  for(const side of [-1,1]){shape(box,'#354f4c',x+side*w*.27,y+h*.60,z+d*.505,w*.17,h*.23,.06);for(const edge of [-1,1])shape(box,'#60827a',x+side*w*.27+edge*w*.105,y+h*.60,z+d*.52,w*.055,h*.27,.08);}
  shape(box,'#67533d',x,y+h*.24,z+d*.51,w*.16,h*.48,.09);
 }
 for(let i=0;i<17;i++){const x=-45+(i%6)*17+random()*5,z=-230-Math.floor(i/6)*30;house(x,z,8+random()*4,9+random()*4,6+random()*4,['#bb6744','#8b725e','#bc9254'][i%3]);}
 house(-13,-270,9,11,18,'#718c86');
 const clockY=terrainHeight(-13,-270)+14;shape(new THREE.CylinderGeometry(1.25,1.25,.12,16),'#f3e6ba',-13,clockY,-264.3,1,1,1,Math.PI/2,0,0);shape(box,'#394b42',-13,clockY+.38,-264.2,.12,.85,.10);shape(box,'#394b42',-12.70,clockY,-264.2,.65,.12,.10);
 // Orchard rows soften the edge of the settlement and provide a middle layer.
 for(let i=0;i<12;i++)tree(-90+i*14,-185-(i%3)*11,4.3+random()*1.4,0);
 // Irregular overlapping ridges: asymmetric summits, shoulders and snow tongues.
 function mountain(x,z,h,r,colour,snow=false){
  const n=9,verts=[],inds=[],sx=(random()-.5)*r*.6,sz=(random()-.5)*r*.35;
  for(let ring=0;ring<2;ring++)for(let j=0;j<n;j++){const a=j/n*Math.PI*2,k=.78+random()*.43;verts.push(x+Math.sin(a)*r*k*(ring?.48:1),ring?h*(.32+random()*.20):-.5,z+Math.cos(a)*r*k*(ring?.44:.8));}
  verts.push(x+sx,h,z+sz);for(let j=0;j<n;j++){const k=(j+1)%n;inds.push(j,k,n+j,k,n+k,n+j,n+j,n+k,n*2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(Array(verts.length/3*2).fill(0),2));g.setIndex(inds);g.computeVertexNormals();shape(g,colour,0,0,0);g.dispose();
  if(snow){const points=[x+sx,h+.1,z+sz],tri=[];for(let j=0;j<n;j++){const k=(n+j)*3,t=.24+random()*.15;points.push((x+sx)*(1-t)+verts[k]*t,h*(1-t)+verts[k+1]*t+.25,(z+sz)*(1-t)+verts[k+2]*t);}for(let j=0;j<n;j++)tri.push(0,j+1,(j+1)%n+1);const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(points,3));cap.setAttribute('uv',new THREE.Float32BufferAttribute(Array(points.length/3*2).fill(0),2));cap.setIndex(tri);cap.computeVertexNormals();shape(cap,'#e3e6d6',0,0,0,1,1,1,0,0,0,false);cap.dispose();}
 }
 for(let i=0;i<8;i++){const a=.45+i*.22,r=1450+random()*200;mountain(Math.sin(a)*r,Math.cos(a)*r,140+random()*155,210+random()*100,'#8ca7a4',i%3===0);}
 for(let i=0;i<7;i++){const a=.62+i*.22,r=850+random()*240;mountain(Math.sin(a)*r,Math.cos(a)*r,60+random()*85,160+random()*120,i%2?'#6b8b81':'#78978b',i===3);}
 // Broad overlapping foothills give the horizon a layered countryside silhouette.
 for(let i=0;i<13;i++){const a=i/13*Math.PI*2,r=480+random()*140,h=16+random()*25;const g=new THREE.SphereGeometry(1,32,12);shape(g,i%2?'#89a66a':'#78985b',Math.sin(a)*r,-h*.22,Math.cos(a)*r,160,h,110,0,a,0,true);g.dispose();}
 // Dense alpha-cutout grass cards, merged into one draw call. The sprite is
 // procedural, with four curved blades and a fine dark silhouette per tuft.
 const grassGeo=[],quad=new THREE.PlaneGeometry(1,1);
 for(let i=0;i<22000;i++){const a=random()*Math.PI*2,r=2+Math.pow(random(),.75)*110,x=Math.sin(a)*r,z=Math.cos(a)*r;if(insidePlaza(x,z,.5)||(z< -13&&z> -410&&Math.abs(x-roadCentre(z))<2.2))continue;const h=.16+random()*.29,g=quad.clone();g.translate(0,.5,0);g.scale(.43+random()*.28,h,1);g.rotateY(random()*Math.PI);g.translate(x,terrainHeight(x,z)+.025,z);grassGeo.push(g);}
 const grass=mesh(mergeGeometries(grassGeo),new THREE.ShaderMaterial({uniforms,vertexShader:grassVertex,fragmentShader:grassFragment,side:THREE.DoubleSide}));grass.name='Dense meadow grass sprites';grassGeo.forEach(g=>g.dispose());
 // Small buttercups and warm rocks at the verges supply close-range scale.
 for(let i=0;i<100;i++){const z=8-random()*75,side=i%2?1:-1,x=roadCentre(z)+side*(2.5+random()*8),y=terrainHeight(x,z);if(insidePlaza(x,z,.7))continue;if(i%4===0)shape(sphere,'#c2bd95',x,y+.10,z,.2+random()*.25,.16,.25,0,random()*6,0);else shape(sphere,i%3?'#f0d76b':'#eee7c6',x,y+.27,z,.055,.04,.055,0,0,0,false);}
 // Ferns and small flowering shrubs distinguish the near meadow from the
 // distant turf. Each leaf has a pointed silhouette and a contrasting midrib.
 const leafGeo=new THREE.BufferGeometry();leafGeo.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.45,.45,0,0,1,0,.45,.45,0,0,.45,.08],3));leafGeo.setAttribute('uv',new THREE.Float32BufferAttribute([.5,0,0,.45,.5,1,1,.45,.5,.45],2));leafGeo.setIndex([0,1,4,1,2,4,2,3,4,3,0,4]);leafGeo.computeVertexNormals();
 for(let i=0;i<85;i++){const z=-5-random()*43,x=roadCentre(z)+(i%2?1:-1)*(3.2+random()*17),y=terrainHeight(x,z),size=.40+random()*.45;if(insidePlaza(x,z,1))continue;
  if(i%3===0){
   for(let j=0;j<7;j++){const a=j/7*Math.PI*2,tip=new THREE.Vector3(x+Math.sin(a)*size,y+size*.65,z+Math.cos(a)*size);branch(x,y,z,tip.x,tip.y,tip.z,.012,'#446b35');for(let k=1;k<5;k++){const t=k/5;for(const side of [-1,1])shape(leafGeo,k%2?'#7caa4b':'#5a883e',x+Math.sin(a)*size*t,y+size*.65*t,z+Math.cos(a)*size*t,size*.34,size*.45,size*.4,-.65,a+side*.8,-side*.5,false);}}
  }else{
   for(let j=0;j<4;j++){const a=j*2.4,px=x+Math.sin(a)*.19,pz=z+Math.cos(a)*.19,h=size*(.5+random()*.5);branch(px,y,pz,px,y+h,pz,.009,'#577e3c');shape(leafGeo,'#74a148',px,y+h*.3,pz,.19,.24,.2,-.6,a,.6,false);for(let k=0;k<5;k++){const angle=k/5*Math.PI*2;shape(sphere,i%5?'#eac955':'#c8b6d4',px+Math.sin(angle)*.052,y+h,pz+Math.cos(angle)*.052,.055,.025,.055,0,0,0,false);}shape(sphere,'#a57c32',px,y+h+.015,pz,.028,.025,.028,0,0,0,false);}
  }
 }
 leafGeo.dispose();
 const outlineMat=new THREE.ShaderMaterial({uniforms:{...uniforms,stroke:{value:1.6}},vertexShader:outlineVertex,fragmentShader:outlineFragment,side:THREE.BackSide});
 for(const [key,geos]of batches){const [colour,ink]=key.split('|'),geo=mergeGeometries(geos);mesh(geo,mat(colour,[palette.oak,palette.oakLight,palette.pine,palette.pineLight,palette.willow,'#779749','#8ead54'].includes(colour)?3:0));if(ink==='true')mesh(geo,outlineMat);geos.forEach(g=>g.dispose());}
 const clouds=new THREE.Group();clouds.name='Clearance-aware inked clouds';
 const cloudMat=new THREE.ShaderMaterial({vertexShader:cloudVertex,fragmentShader:cloudFragment,side:THREE.DoubleSide});
 for(let i=0;i<14;i++){const w=190+(i%4)*60;const cm=cloudMat.clone();cm.uniforms={variation:{value:i*2.1}};const c=new THREE.Mesh(new THREE.PlaneGeometry(w,w/(1.8+(i%3)*.2)),cm);c.userData={azimuth:i/14*Math.PI*2,altitude:(12+(i%4)*8)*Math.PI/180,radius:Math.atan(Math.hypot(w,w/1.8)*.5/1350)};clouds.add(c);}
 function updateClouds(directions){
  const placed=[];for(const c of clouds.children){const {azimuth,altitude,radius}=c.userData;let found=false;
   for(let j=0;j<64;j++){const a=azimuth+j*.29,alt=altitude+(j%3)*.045,d=new THREE.Vector3(Math.sin(a)*Math.cos(alt),Math.sin(alt),-Math.cos(a)*Math.cos(alt));
    if(directions.every(b=>d.angleTo(b)>radius+8*Math.PI/180)&&placed.every(b=>d.angleTo(b.d)>radius+b.radius+2*Math.PI/180)){c.position.copy(d).multiplyScalar(1350);c.position.y+=1.6;found=true;placed.push({d,radius});break;}
   }c.visible=found;
  }
 }
 return {root,land,path,clouds,uniforms,updateClouds,update(sun,day,time){uniforms.sunDirection.value.copy(sun);uniforms.daylight.value=day?1:0;uniforms.time.value=time;clouds.visible=day;},resize(w,h){uniforms.resolution.value.set(w,h);},stats:{grassTufts:grassGeo.length,treeSpecies:4,houses:18,clouds:14}};
}
