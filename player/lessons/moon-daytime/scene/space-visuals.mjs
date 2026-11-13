import * as THREE from '../vendor/three.module.min.js';
// All imagery is procedural; no texture requests, postprocessing or bloom pass.
export const noiseGLSL=`
float hash31(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise3(p);p=p*2.03+vec3(13.1,7.3,5.4);a*=.5;}return v;}
`;
export const solarVertex=`varying vec3 localPoint;varying vec3 viewNormal;void main(){localPoint=normalize(position);viewNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const solarFragment=`precision highp float;uniform float time;uniform float daylight;varying vec3 localPoint;varying vec3 viewNormal;${noiseGLSL}
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
export const coronaVertex=`varying vec2 texCoord;void main(){texCoord=uv;vec4 centre=modelViewMatrix*vec4(0.,0.,0.,1.);centre.xy+=position.xy;gl_Position=projectionMatrix*centre;}`;
export const coronaFragment=`precision highp float;uniform float time;uniform float daylight;varying vec2 texCoord;${noiseGLSL}
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
export function createSunVisual(radius,{daylight=false}={}){
 const root=new THREE.Group();root.name=daylight?'Daytime Sun':'Textured Sun and enhanced corona';
 const surface=new THREE.ShaderMaterial({uniforms:{time:{value:0},daylight:{value:daylight?1:0}},vertexShader:solarVertex,fragmentShader:solarFragment,toneMapped:false});
 const disc=new THREE.Mesh(new THREE.SphereGeometry(radius,80,56),surface);root.add(disc);
 const coronaMaterial=new THREE.ShaderMaterial({uniforms:{time:{value:0},daylight:{value:daylight?1:0}},vertexShader:coronaVertex,fragmentShader:coronaFragment,transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,toneMapped:false});
 const corona=new THREE.Mesh(new THREE.PlaneGeometry(radius*8,radius*8),coronaMaterial);corona.renderOrder=1;root.add(corona);
 function tick(seconds){surface.uniforms.time.value=seconds;coronaMaterial.uniforms.time.value=seconds;}
 return {root,disc,corona,tick};
}
export const starVertex=`attribute float starSize;attribute float brightness;attribute vec3 starColour;uniform float pixelRatio;varying vec3 colour;varying float intensity;varying float sparkle;void main(){colour=starColour;intensity=brightness;sparkle=step(3.,starSize);gl_PointSize=starSize*pixelRatio;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const starFragment=`precision highp float;varying vec3 colour;varying float intensity;varying float sparkle;void main(){vec2 p=gl_PointCoord*2.-1.;float r=length(p);float a=exp(-r*r*6.)*.4+(1.-smoothstep(.05,.70,r))*.8;float crossGlow=exp(-abs(p.x)*23.)*exp(-abs(p.y)*3.)+exp(-abs(p.y)*23.)*exp(-abs(p.x)*3.);a+=crossGlow*sparkle*.15;if(r>1.)discard;gl_FragColor=vec4(colour,clamp(a*intensity,0.,1.));}`;
export const backgroundVertex=`varying vec2 texCoord;void main(){texCoord=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const backgroundFragment=`precision highp float;varying vec2 texCoord;
void main(){vec2 p=texCoord-.5;float haze=.5+.25*sin(texCoord.x*13.+sin(texCoord.y*9.))+.15*cos(texCoord.y*17.+texCoord.x*3.);float band=exp(-pow((p.y-p.x*.45-.05)*5.,2.));float vignette=1.-smoothstep(.15,.7,length(p));vec3 base=vec3(.012,.024,.052);vec3 colour=base+vec3(.012,.019,.037)*haze*band+vec3(.004,.009,.015)*vignette;gl_FragColor=vec4(colour,1.);}`;
export function createSpaceBackground(){
 const root=new THREE.Group();root.name='Layered space backdrop';
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(74,74),new THREE.ShaderMaterial({vertexShader:backgroundVertex,fragmentShader:backgroundFragment,depthWrite:false,toneMapped:false}));backdrop.position.z=-57;root.add(backdrop);
 let seed=219;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const pos=[],sizes=[],brightness=[],colours=[];
 for(let i=0;i<5200;i++){
  pos.push((random()-.5)*72,(random()-.5)*72,-50+random()*16);
  const bright=random(),size=bright>.985?4.+random()*1.5:bright>.86?2.4+random()*1.:1.45+random()*.75;
  sizes.push(size);brightness.push(bright>.86?.85+random()*.15:.50+random()*.30);
  const tint=random();colours.push(tint<.16?1:.81+random()*.19,tint<.16?.80+random()*.16:.88+random()*.12,tint<.16?.63+random()*.16:1);
 }
 const geo=new THREE.BufferGeometry();for(const [key,values,size]of [['position',pos,3],['starSize',sizes,1],['brightness',brightness,1],['starColour',colours,3]])geo.setAttribute(key,new THREE.Float32BufferAttribute(values,size));
 const material=new THREE.ShaderMaterial({uniforms:{pixelRatio:{value:1}},vertexShader:starVertex,fragmentShader:starFragment,transparent:true,depthWrite:false,depthTest:true,toneMapped:false});
 const stars=new THREE.Points(geo,material);root.add(stars);
 function resize(pixelRatio){material.uniforms.pixelRatio.value=Math.min(pixelRatio,2);}
 return {root,stars,backdrop,resize};
}
