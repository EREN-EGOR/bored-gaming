
'use strict';

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 闊虫晥绯荤粺 (Web Audio API)
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?let audioCtx;
function getAudio(){
  if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  // 娴忚鍣ㄨ姹傜敤鎴蜂氦浜掑悗鎵嶈兘鎾斁锛岀‘淇濇仮澶?  if(audioCtx.state==='suspended') audioCtx.resume();
  return audioCtx;
}

function playGunshot(){
  const ctx=getAudio();
  const sr=ctx.sampleRate;
  const buf=ctx.createBuffer(1,sr*0.25,sr);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++){
    const t=i/sr;
    // 鐖嗚浣庨鍐插嚮
    const bang=(Math.random()*2-1)*Math.exp(-t*35)*1.0;
    // 楂橀鍣０灏?    const crack=(Math.random()*2-1)*Math.exp(-t*18)*0.5;
    // 涓鍏遍福
    const tone=Math.sin(2*Math.PI*180*t)*Math.exp(-t*22)*0.3;
    d[i]=Math.max(-1,Math.min(1,bang+crack+tone));
  }
  const src=ctx.createBufferSource();
  src.buffer=buf;
  // 浣庨€?+ 鍘嬬缉锛屾ā鎷熷鍐呮灙澹?  const filter=ctx.createBiquadFilter();
  filter.type='lowpass'; filter.frequency.value=4000;
  const comp=ctx.createDynamicsCompressor();
  comp.threshold.value=-6; comp.ratio.value=4;
  const gain=ctx.createGain(); gain.gain.value=1.2;
  src.connect(filter); filter.connect(comp); comp.connect(gain); gain.connect(ctx.destination);
  src.start();
}

function playStep(){
  const ctx=getAudio();
  const buf=ctx.createBuffer(1,ctx.sampleRate*0.08,ctx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++){
    const t=i/ctx.sampleRate;
    d[i]=(Math.random()*2-1)*Math.exp(-t*80)*0.3
        +Math.sin(t*60*Math.PI*2)*Math.exp(-t*50)*0.2;
  }
  const src=ctx.createBufferSource(); src.buffer=buf;
  const gain=ctx.createGain(); gain.gain.value=0.3;
  src.connect(gain); gain.connect(ctx.destination);
  src.start();
}

function playHit(){
  const ctx=getAudio();
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  osc.type='sawtooth'; osc.frequency.setValueAtTime(220,ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(55,ctx.currentTime+0.15);
  gain.gain.setValueAtTime(0.4,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.15);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime+0.15);
}

function playReload(){
  const ctx=getAudio();
  [0,0.3].forEach(delay=>{
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.12,ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++){
      const t=i/ctx.sampleRate;
      d[i]=(Math.random()*2-1)*Math.exp(-t*60)*0.5
          +Math.sin(t*400*Math.PI*2)*Math.exp(-t*40)*0.2;
    }
    const src=ctx.createBufferSource(); src.buffer=buf;
    const gain=ctx.createGain(); gain.gain.value=0.4;
    src.connect(gain); gain.connect(ctx.destination);
    src.start(ctx.currentTime+delay);
  });
}

function playMelee(){
  const ctx=getAudio();
  const buf=ctx.createBuffer(1,ctx.sampleRate*0.1,ctx.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++){
    const t=i/ctx.sampleRate;
    d[i]=(Math.random()*2-1)*Math.exp(-t*50)*0.6
        +Math.sin(t*200*Math.PI*2)*Math.exp(-t*30)*0.3;
  }
  const src=ctx.createBufferSource(); src.buffer=buf;
  const gain=ctx.createGain(); gain.gain.value=0.5;
  src.connect(gain); gain.connect(ctx.destination);
  src.start();
}

function playDeath(){
  const ctx=getAudio();
  const osc=ctx.createOscillator();
  const gain=ctx.createGain();
  osc.type='sine'; osc.frequency.setValueAtTime(440,ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110,ctx.currentTime+1.5);
  gain.gain.setValueAtTime(0.3,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+1.5);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime+1.5);
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 娓叉煋鍣?& 鍦烘櫙
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const canvas=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x1a1a2a,0.018);
scene.background=new THREE.Color(0x1a1a2a);

const camera=new THREE.PerspectiveCamera(80,1,0.05,150);
camera.position.set(2,1.7,2);

function resize(){
  renderer.setSize(innerWidth,innerHeight);
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
}
resize(); window.addEventListener('resize',resize);

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 绾圭悊锛堢▼搴忓寲锛?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?function makeTex(fn,s=256){
  const cv=document.createElement('canvas'); cv.width=cv.height=s;
  fn(cv.getContext('2d'),s);
  const t=new THREE.CanvasTexture(cv);
  t.wrapS=t.wrapT=THREE.RepeatWrapping;
  return t;
}

const wallTex=makeTex((ctx,s)=>{
  ctx.fillStyle='#6a5a4a'; ctx.fillRect(0,0,s,s);
  for(let i=0;i<4000;i++){
    const x=Math.random()*s,y=Math.random()*s;
    const v=Math.floor(Math.random()*40+80);
    ctx.fillStyle=`rgb(${v},${Math.floor(v*0.9)},${Math.floor(v*0.75)})`;
    ctx.fillRect(x,y,2,2);
  }
  ctx.strokeStyle='#3a2a1a'; ctx.lineWidth=2;
  const bw=64,bh=32;
  for(let row=0;row*bh<s+bh;row++){
    const off=row%2===0?0:bw/2;
    for(let col=-1;col*bw<s+bw;col++){
      ctx.strokeRect(col*bw+off+2,row*bh+2,bw-4,bh-4);
    }
  }
});
wallTex.repeat.set(2,1);

const floorTex=makeTex((ctx,s)=>{
  ctx.fillStyle='#555555'; ctx.fillRect(0,0,s,s);
  for(let i=0;i<2000;i++){
    const x=Math.random()*s,y=Math.random()*s,v=Math.floor(Math.random()*30+60);
    ctx.fillStyle=`rgb(${v},${v},${v})`; ctx.fillRect(x,y,3,3);
  }
  ctx.strokeStyle='#333'; ctx.lineWidth=1;
  const g=64;
  for(let i=0;i<=s/g;i++){
    ctx.beginPath();ctx.moveTo(i*g,0);ctx.lineTo(i*g,s);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i*g);ctx.lineTo(s,i*g);ctx.stroke();
  }
});
floorTex.repeat.set(6,6);

const ceilTex=makeTex((ctx,s)=>{
  ctx.fillStyle='#444444'; ctx.fillRect(0,0,s,s);
  for(let i=0;i<1000;i++){
    const x=Math.random()*s,y=Math.random()*s,v=Math.floor(Math.random()*20+50);
    ctx.fillStyle=`rgb(${v},${v},${v})`; ctx.fillRect(x,y,2,2);
  }
});
ceilTex.repeat.set(4,4);

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 鍦板浘
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const MAP=[
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,0,1,0,0,1,0,0,1,0,0,1,1,0,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,1,0,0,0,0,1,1,1,1,0,0,0,1,0,0,0,1],
  [1,0,0,1,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,1,0,1],
  [1,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,1,0,1],
  [1,0,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,1],
  [1,0,0,1,1,0,0,0,1,0,0,1,0,0,0,1,1,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
const CELL=5;
const MR=MAP.length, MC=MAP[0].length;
const OX=(MC*CELL)/2, OZ=(MR*CELL)/2;

const wallMat=new THREE.MeshLambertMaterial({map:wallTex});
const floorMat=new THREE.MeshLambertMaterial({map:floorTex});
const ceilMat=new THREE.MeshLambertMaterial({map:ceilTex});

MAP.forEach((row,rz)=>row.forEach((cell,cx)=>{
  const wx=cx*CELL-OX, wz=rz*CELL-OZ;
  // 鍦版澘
  const fm=new THREE.Mesh(new THREE.PlaneGeometry(CELL,CELL),floorMat);
  fm.rotation.x=-Math.PI/2; fm.position.set(wx+CELL/2,0,wz+CELL/2); fm.receiveShadow=true;
  scene.add(fm);
  // 澶╄姳鏉?  const cm=new THREE.Mesh(new THREE.PlaneGeometry(CELL,CELL),ceilMat);
  cm.rotation.x=Math.PI/2; cm.position.set(wx+CELL/2,4,wz+CELL/2);
  scene.add(cm);
  if(cell===1){
    const wm=new THREE.Mesh(new THREE.BoxGeometry(CELL,4,CELL),wallMat);
    wm.position.set(wx+CELL/2,2,wz+CELL/2); wm.receiveShadow=wm.castShadow=true;
    scene.add(wm);
  }
}));

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 鐏厜
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?scene.add(new THREE.AmbientLight(0xffffff,0.7));

const lightPositions=[[0,3.5,0],[10,3.5,0],[-10,3.5,0],[0,3.5,10],[0,3.5,-10],[10,3.5,10],[-10,3.5,-10],[10,3.5,-10],[-10,3.5,10],[5,3.5,5],[-5,3.5,-5],[5,3.5,-5],[-5,3.5,5]];
lightPositions.forEach(pos=>{
  const pl=new THREE.PointLight(0xfff5dd,2.0,25);
  pl.position.set(...pos); pl.castShadow=false;
  scene.add(pl);
  const lb=new THREE.Mesh(new THREE.SphereGeometry(0.12),new THREE.MeshBasicMaterial({color:0xffffff}));
  lb.position.set(...pos); scene.add(lb);
});

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 纰版挒
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const PR=0.4;
function isWall(x,z){
  const cx=Math.floor((x+OX)/CELL), cz=Math.floor((z+OZ)/CELL);
  if(cz<0||cz>=MR||cx<0||cx>=MC) return true;
  return MAP[cz][cx]===1;
}
function canMove(x,z){
  return !isWall(x-PR,z-PR)&&!isWall(x+PR,z-PR)&&!isWall(x-PR,z+PR)&&!isWall(x+PR,z+PR);
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 鏋ā鍨?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const gunPivot=new THREE.Group();
camera.add(gunPivot);
scene.add(camera);

function makeMat(color){return new THREE.MeshLambertMaterial({color});}

const gunGroup=new THREE.Group();
// 鏋
const barrelM=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.5),makeMat(0x222222));
barrelM.position.set(0.01,0,-0.25);
// 鏋韩
const bodyM=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.12,0.35),makeMat(0x333333));
bodyM.position.set(0,-0.02,0.02);
// 鎻℃妸
const gripM=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.2,0.1),makeMat(0x1a1a1a));
gripM.position.set(0,-0.14,0.1); gripM.rotation.x=0.15;
// 寮瑰專
const magM=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.14,0.08),makeMat(0x111111));
magM.position.set(0,-0.18,0.08);
// 鍑嗘槦锛堟灙涓婄殑锛?const sightM=new THREE.Mesh(new THREE.BoxGeometry(0.02,0.03,0.02),makeMat(0xff0000));
sightM.position.set(0,0.08,-0.22);
// 鏋墭
const stockM=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.15),makeMat(0x2a2a2a));
stockM.position.set(0,-0.01,0.19);

gunGroup.add(barrelM,bodyM,gripM,magM,sightM,stockM);
gunGroup.position.set(0.22,-0.22,-0.4);
gunGroup.rotation.y=0.05;
gunPivot.add(gunGroup);

// 鏋彛闂厜
const muzzleFlash=new THREE.PointLight(0xff8800,0,3);
muzzleFlash.position.set(0,0,-0.55);
gunGroup.add(muzzleFlash);

const muzzleSprite=new THREE.Mesh(
  new THREE.PlaneGeometry(0.2,0.2),
  new THREE.MeshBasicMaterial({color:0xffaa00,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide})
);
muzzleSprite.position.set(0,0,-0.55);
gunGroup.add(muzzleSprite);

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 绮掑瓙绯荤粺锛堣鑺憋級鈥?姣忕矑鐙珛鏉愯川锛宼ransparent:true 鎵嶈兘娣″嚭
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const particles=[];
const pGeo=new THREE.SphereGeometry(0.05,4,4);

function spawnBlood(pos){
  for(let i=0;i<18;i++){
    const mat=new THREE.MeshBasicMaterial({color:0xcc0000,transparent:true,opacity:1,depthWrite:false});
    const m=new THREE.Mesh(pGeo,mat);
    m.position.copy(pos);
    const spd=1.5+Math.random()*5;
    const theta=Math.random()*Math.PI*2;
    const phi=(Math.random()*0.8+0.1)*Math.PI;
    m._vx=Math.sin(phi)*Math.cos(theta)*spd;
    m._vy=Math.abs(Math.cos(phi))*spd*0.8+Math.random()*2;
    m._vz=Math.sin(phi)*Math.sin(theta)*spd;
    m._life=0.35+Math.random()*0.3;
    m._age=0;
    scene.add(m);
    particles.push(m);
  }
}

function updateParticles(dt){
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p._age+=dt;
    if(p._age>=p._life){ scene.remove(p); p.material.dispose(); particles.splice(i,1); continue; }
    p._vy-=12*dt;
    p.position.x+=p._vx*dt;
    p.position.y+=p._vy*dt;
    p.position.z+=p._vz*dt;
    p.material.opacity=Math.max(0,1-p._age/p._life);
  }
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 鎺夎惤鐗╃郴缁?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const drops=[];

// 鎸夋晫浜虹被鍨嬪喅瀹氭帀钀?function rollDrop(kind){
  const r=Math.random();
  if(kind==='heavy') return 'ammo'; // 蹇呮帀寮硅嵂
  if(kind==='berserker'){
    if(r<0.30) return 'ammo';
    if(r<0.60) return 'hp';
    if(r<0.75) return 'hpbig';
    return null; // 25% 涓嶆帀
  }
  if(kind==='sniper'){
    if(r<0.40) return 'ammo';
    if(r<0.65) return 'hp';
    if(r<0.75) return 'hpbig';
    return null;
  }
  // normal
  if(r<0.50) return 'ammo';
  if(r<0.70) return 'hp';
  if(r<0.75) return 'hpbig';
  return null;
}

function spawnDrop(pos, forceType){
  const type=forceType; // 璋冪敤鏂逛紶鍏ワ紝null鍒欎笉鐢熸垚
  if(!type) return;
  const color=type==='ammo'?0xf0a500:type==='hp'?0x00cc44:0x00ffaa;

  const g=new THREE.Group();
  // 涓讳綋鏂瑰潡
  const box=new THREE.Mesh(
    new THREE.BoxGeometry(0.4,0.4,0.4),
    new THREE.MeshLambertMaterial({color,emissive:color,emissiveIntensity:0.4})
  );
  g.add(box);
  // 鍏夋檿鐐瑰厜
  const pl=new THREE.PointLight(color,1.5,3);
  g.add(pl);

  g.position.set(pos.x, 0.3, pos.z);
  scene.add(g);

  drops.push({group:g, box, type, bobPhase:Math.random()*Math.PI*2});
}

function updateDrops(dt){
  for(let i=drops.length-1;i>=0;i--){
    const d=drops[i];
    d.bobPhase+=dt*2.5;
    // 涓婁笅娴姩
    d.group.position.y=0.3+Math.sin(d.bobPhase)*0.12;
    // 鏃嬭浆
    d.box.rotation.y+=dt*2;

    // 闂儊锛堟瘡0.5绉掞級
    const blink=Math.sin(d.bobPhase*4)>0;
    d.box.material.emissiveIntensity=blink?0.6:0.2;

    // 鎷惧彇妫€娴?    const dx=camera.position.x-d.group.position.x;
    const dz=camera.position.z-d.group.position.z;
    if(Math.sqrt(dx*dx+dz*dz)<1.2){
      pickupDrop(d,i);
    }
  }
}

function pickupDrop(d,idx){
  scene.remove(d.group);
  drops.splice(idx,1);
  if(d.type==='ammo'){
    const add=15+Math.floor(Math.random()*16); // 15~30鍙?    P.reserve=Math.min(P.reserve+add,999);
    showPickupMsg(`+${add} 寮硅嵂`,'#f0a500');
  } else if(d.type==='hp'){
    const before=P.hp;
    P.hp=Math.min(P.hp+25, P.maxHp);
    const actual=Math.round(P.hp-before);
    showPickupMsg(actual>0?`+${actual} HP`:'琛€閲忓凡婊?,'#00cc44');
    updateHpUI();
  } else { // hpbig
    const before=P.hp;
    P.hp=Math.min(P.hp+50, P.maxHp);
    const actual=Math.round(P.hp-before);
    showPickupMsg(actual>0?`+${actual} HP 鈽卄:'琛€閲忓凡婊?,'#00ffaa');
    updateHpUI();
  }
  updateAmmoUI();
}

function showPickupMsg(text,color){
  const el=document.createElement('div');
  el.style.cssText=`position:absolute;top:42%;left:50%;transform:translateX(-50%);
    font-size:22px;font-weight:bold;color:${color};text-shadow:1px 1px 3px #000;
    pointer-events:none;animation:floatup 1s ease-out forwards;font-family:'Courier New',monospace`;
  el.textContent=text;
  document.getElementById('ui').appendChild(el);
  setTimeout(()=>el.remove(),1000);
}
  const m=new THREE.Mesh(
    new THREE.CircleGeometry(0.06,8),
    new THREE.MeshBasicMaterial({color:0x080808,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1})
  );
  m.position.copy(pos).addScaledVector(normal,0.01);
  m.lookAt(pos.clone().add(normal));
  scene.add(m); holes.push(m);
  if(holes.length>40){ scene.remove(holes.shift()); }
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 绉诲姩杈呭姪锛氬垎杞存粦鍔紝涓嶅崱澧?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?function moveEnemy(ep, dx, dz, spd, dt){
  const dist=Math.sqrt(dx*dx+dz*dz);
  if(dist<0.01) return;
  const nx=ep.x+dx/dist*spd*dt;
  const nz=ep.z+dz/dist*spd*dt;
  // 鍚屾椂绉诲姩
  if(canMove(nx,nz)){ ep.x=nx; ep.z=nz; return; }
  // 鍙蛋X
  if(canMove(nx,ep.z)){ ep.x=nx; return; }
  // 鍙蛋Z
  if(canMove(ep.x,nz)){ ep.z=nz; return; }
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 鏁屼汉
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?
// 鑴搁儴璐村浘
function makeEnemyTex(eyeColor,mouthColor,bgColor){
  const cv=document.createElement('canvas'); cv.width=cv.height=64;
  const ctx=cv.getContext('2d');
  ctx.fillStyle=bgColor; ctx.fillRect(0,0,64,64);
  ctx.fillStyle=eyeColor;
  ctx.beginPath(); ctx.ellipse(20,22,7,6,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(44,22,7,6,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#000';
  ctx.beginPath(); ctx.arc(20,22,3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(44,22,3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=mouthColor; ctx.lineWidth=3;
  ctx.beginPath(); ctx.moveTo(14,44); ctx.lineTo(20,40); ctx.lineTo(26,44);
  ctx.lineTo(32,38); ctx.lineTo(38,44); ctx.lineTo(44,40); ctx.lineTo(50,44); ctx.stroke();
  return new THREE.CanvasTexture(cv);
}
const texNormal  =makeEnemyTex('#ff0000','#ff0000','#8b0000');
const texBerserker=makeEnemyTex('#ff6600','#ff6600','#cc4400');
const texHeavy   =makeEnemyTex('#aaaaaa','#888888','#444444');
const texSniper  =makeEnemyTex('#00ffff','#00cccc','#111122');

// 姝﹀櫒寤烘ā
function makeGun(color){
  const g=new THREE.Group();
  // 鏋
  const barrel=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.06,0.5),new THREE.MeshLambertMaterial({color}));
  barrel.position.set(0,0,-0.25); g.add(barrel);
  // 鏋韩
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.1,0.3),new THREE.MeshLambertMaterial({color:0x222222}));
  body.position.set(0,-0.02,0.02); g.add(body);
  // 鎻℃妸
  const grip=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.15,0.08),new THREE.MeshLambertMaterial({color:0x111111}));
  grip.position.set(0,-0.12,0.08); g.add(grip);
  return g;
}

function makeSniperRifle(){
  const g=new THREE.Group();
  // 闀挎灙绠?  const barrel=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.05,0.9),new THREE.MeshLambertMaterial({color:0x111111}));
  barrel.position.set(0,0,-0.45); g.add(barrel);
  // 鏋韩
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.4),new THREE.MeshLambertMaterial({color:0x1a1a1a}));
  body.position.set(0,0,0.05); g.add(body);
  // 鐬勫噯闀?  const scope=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.2,8),new THREE.MeshLambertMaterial({color:0x333333}));
  scope.rotation.x=Math.PI/2; scope.position.set(0,0.1,-0.1); g.add(scope);
  // 鎻℃妸
  const grip=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.18,0.08),new THREE.MeshLambertMaterial({color:0x111111}));
  grip.position.set(0,-0.14,0.1); g.add(grip);
  return g;
}

function makeKnife(){
  const g=new THREE.Group();
  // 鍒€鍒?  const blade=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.28,0.04),new THREE.MeshLambertMaterial({color:0xcccccc,emissive:0x444444}));
  blade.position.set(0,0.14,0); g.add(blade);
  // 鍒€灏栵紙涓夎閿ワ級
  const tip=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.1,4),new THREE.MeshLambertMaterial({color:0xdddddd}));
  tip.position.set(0,0.33,0); g.add(tip);
  // 鍒€鏌?  const handle=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.16,0.06),new THREE.MeshLambertMaterial({color:0x4a2800}));
  handle.position.set(0,-0.08,0); g.add(handle);
  // 鎶ゆ墜
  const guard=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.04,0.06),new THREE.MeshLambertMaterial({color:0x888888}));
  guard.position.set(0,0.02,0); g.add(guard);
  return g;
}

function makeHeavyGun(){
  const g=new THREE.Group();
  // 涓讳綋锛堝ぇ锛?  const body=new THREE.Mesh(new THREE.BoxGeometry(0.18,0.14,0.55),new THREE.MeshLambertMaterial({color:0x333333}));
  g.add(body);
  // 鏋锛堜袱鏍癸級
  [-0.05,0.05].forEach(ox=>{
    const b=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.04,0.6),new THREE.MeshLambertMaterial({color:0x111111}));
    b.position.set(ox,0.04,-0.3); g.add(b);
  });
  // 寮归紦
  const drum=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.14,10),new THREE.MeshLambertMaterial({color:0x222222}));
  drum.rotation.x=Math.PI/2; drum.position.set(0,-0.06,0.1); g.add(drum);
  return g;
}

// 閫氱敤琛€鏉?function makeHpBar(group, yOffset){
  const hpCv=document.createElement('canvas'); hpCv.width=64; hpCv.height=8;
  const hpCtx=hpCv.getContext('2d');
  const hpTex=new THREE.CanvasTexture(hpCv);
  const hpSpr=new THREE.Sprite(new THREE.SpriteMaterial({map:hpTex,depthTest:false}));
  hpSpr.scale.set(1.4,0.16,1); hpSpr.position.y=yOffset; group.add(hpSpr);
  function refreshHp(hp,max){
    hpCtx.fillStyle='#300'; hpCtx.fillRect(0,0,64,8);
    const pct=Math.max(0,hp/max);
    hpCtx.fillStyle=pct>0.5?'#0f0':pct>0.25?'#ff0':'#f00';
    hpCtx.fillRect(0,0,64*pct,8);
    hpTex.needsUpdate=true;
  }
  return refreshHp;
}

// 閫氱敤鑲綋
function makeBody(g, bodyColor, legColor, armColor, bodyH, bodyW){
  const body=new THREE.Mesh(new THREE.BoxGeometry(bodyW||0.7,bodyH||1.1,0.4),new THREE.MeshLambertMaterial({color:bodyColor}));
  body.position.y=(bodyH||1.1)/2; g.add(body);
  const legL=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.7,0.3),new THREE.MeshLambertMaterial({color:legColor}));
  legL.position.set(-0.2,-0.35,0); g.add(legL);
  const legR=legL.clone(); legR.position.x=0.2; g.add(legR);
  const armL=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.7,0.3),new THREE.MeshLambertMaterial({color:armColor}));
  armL.position.set(-(bodyW||0.7)/2-0.12, (bodyH||1.1)/2-0.2, 0); g.add(armL);
  const armR=armL.clone(); armR.position.x=(bodyW||0.7)/2+0.12+0.2; g.add(armR);
  return {body,legL,legR,armL,armR};
}

const enemies=[];

// 鈹€鈹€ 鏅€氬叺 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function buildNormal(x,z){
  const g=new THREE.Group();
  const {body,legL,legR,armL,armR}=makeBody(g,0x660000,0x440000,0x660000);
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.6,0.6),[
    new THREE.MeshLambertMaterial({color:0x8b0000}),new THREE.MeshLambertMaterial({color:0x8b0000}),
    new THREE.MeshLambertMaterial({color:0x8b0000}),new THREE.MeshLambertMaterial({color:0x8b0000}),
    new THREE.MeshLambertMaterial({map:texNormal}),new THREE.MeshLambertMaterial({color:0x8b0000}),
  ]);
  head.position.y=1.4; g.add(head);
  g.position.set(x,0.35,z); scene.add(g);
  const refreshHp=makeHpBar(g,2.2);
  refreshHp(100,100);
  return {
    group:g, kind:'normal', hp:100, maxHp:100,
    legL,legR,armL,armR, legAnim:Math.random()*Math.PI*2,
    state:'patrol', patrolTarget:null, patrolTimer:0,
    attackTimer:0, stunTimer:0, dying:false, dyingTimer:0,
    refreshHp, meshes:[body,head,legL,legR,armL,armR],
    speed:2.8, attackRange:1.8, attackDmg:6, attackRate:1.2,
    fleeHp:0.3, score:100,
  };
}

// 鈹€鈹€ 鐙傛垬澹?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function buildBerserker(x,z){
  const g=new THREE.Group();
  const {body,legL,legR,armL,armR}=makeBody(g,0xcc4400,0x882200,0xcc4400,1.0,0.65);
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.55,0.55),[
    new THREE.MeshLambertMaterial({color:0xcc4400}),new THREE.MeshLambertMaterial({color:0xcc4400}),
    new THREE.MeshLambertMaterial({color:0xcc4400}),new THREE.MeshLambertMaterial({color:0xcc4400}),
    new THREE.MeshLambertMaterial({map:texBerserker}),new THREE.MeshLambertMaterial({color:0xcc4400}),
  ]);
  head.position.y=1.3; g.add(head);
  // 鍒€鎸傚彸鎵?  const knife=makeKnife();
  knife.position.set(0.5,0.3,-0.1);
  knife.rotation.set(-0.5,0,0.3);
  armR.add(knife);
  g.position.set(x,0.35,z); scene.add(g);
  const refreshHp=makeHpBar(g,2.1);
  refreshHp(60,60);
  return {
    group:g, kind:'berserker', hp:60, maxHp:60,
    legL,legR,armL,armR, legAnim:Math.random()*Math.PI*2,
    state:'patrol', patrolTarget:null, patrolTimer:0,
    attackTimer:0, stunTimer:0, dying:false, dyingTimer:0,
    refreshHp, meshes:[body,head,legL,legR,armL,armR],
    speed:5.0, attackRange:1.5, attackDmg:12, attackRate:0.6,
    fleeHp:0,   // 涓嶉€冭窇
    score:150,
  };
}

// 鈹€鈹€ 閲嶈鍏?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function buildHeavy(x,z){
  const g=new THREE.Group();
  const {body,legL,legR,armL,armR}=makeBody(g,0x444444,0x333333,0x444444,1.3,0.9);
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.65,0.65),[
    new THREE.MeshLambertMaterial({color:0x555555}),new THREE.MeshLambertMaterial({color:0x555555}),
    new THREE.MeshLambertMaterial({color:0x555555}),new THREE.MeshLambertMaterial({color:0x555555}),
    new THREE.MeshLambertMaterial({map:texHeavy}),new THREE.MeshLambertMaterial({color:0x555555}),
  ]);
  head.position.y=1.65; g.add(head);
  // 閲嶆満鏋弻鎵嬫寔
  const hgun=makeHeavyGun();
  hgun.position.set(0,0.65,-0.45);
  g.add(hgun);
  // 鑲╃敳
  [-0.6,0.6].forEach(ox=>{
    const pad=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.2,0.25),new THREE.MeshLambertMaterial({color:0x333333}));
    pad.position.set(ox,1.2,0); g.add(pad);
  });
  g.position.set(x,0.35,z); scene.add(g);
  const refreshHp=makeHpBar(g,2.5);
  refreshHp(300,300);
  return {
    group:g, kind:'heavy', hp:300, maxHp:300,
    legL,legR,armL,armR, legAnim:Math.random()*Math.PI*2,
    state:'patrol', patrolTarget:null, patrolTimer:0,
    attackTimer:0, stunTimer:0, dying:false, dyingTimer:0,
    refreshHp, meshes:[body,head,legL,legR,armL,armR],
    speed:1.6, attackRange:10, attackDmg:4, attackRate:0.3,
    fleeHp:0,
    score:300,
    shootTimer:0,
  };
}

// 鈹€鈹€ 鐙欏嚮鎵?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function buildSniper(x,z){
  const g=new THREE.Group();
  const {body,legL,legR,armL,armR}=makeBody(g,0x111122,0x0a0a18,0x111122,1.1,0.6);
  const head=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.55,0.55),[
    new THREE.MeshLambertMaterial({color:0x111122}),new THREE.MeshLambertMaterial({color:0x111122}),
    new THREE.MeshLambertMaterial({color:0x111122}),new THREE.MeshLambertMaterial({color:0x111122}),
    new THREE.MeshLambertMaterial({map:texSniper}),new THREE.MeshLambertMaterial({color:0x111122}),
  ]);
  head.position.y=1.35; g.add(head);
  // 鐙欏嚮鏋寕鑲?  const srifle=makeSniperRifle();
  srifle.position.set(0.4,0.65,-0.1);
  srifle.rotation.y=-0.2;
  g.add(srifle);
  g.position.set(x,0.35,z); scene.add(g);
  const refreshHp=makeHpBar(g,2.1);
  refreshHp(80,80);
  return {
    group:g, kind:'sniper', hp:80, maxHp:80,
    legL,legR,armL,armR, legAnim:Math.random()*Math.PI*2,
    state:'patrol', patrolTarget:null, patrolTimer:0,
    attackTimer:0, stunTimer:0, dying:false, dyingTimer:0,
    refreshHp, meshes:[body,head,legL,legR,armL,armR],
    speed:2.0, attackRange:18, attackDmg:18, attackRate:2.5,
    fleeHp:0.3,
    score:200,
    preferDist:10, // 淇濇寔璺濈
  };
}

const SPAWN_PTS=[
  [8,8],[16,8],[-8,8],[-16,8],
  [8,-8],[16,-8],[-8,-8],[-16,-8],
  [0,16],[0,-16],[12,0],[-12,0],
];

// 鎸夌被鍨嬬敓鎴愶紝鏉冮噸锛氭櫘閫?0%锛岀媯鎴樺＋25%锛岄噸瑁?5%锛岀嫏鍑?0%
function trySpawn(x,z){
  const cx=Math.floor((x+OX)/CELL), cz=Math.floor((z+OZ)/CELL);
  if(cz<0||cz>=MR||cx<0||cx>=MC) return;
  if(MAP[cz][cx]!==0) return;
  const r=Math.random();
  let e;
  if(r<0.50)      e=buildNormal(x,z);
  else if(r<0.75) e=buildBerserker(x,z);
  else if(r<0.90) e=buildHeavy(x,z);
  else            e=buildSniper(x,z);
  enemies.push(e);
}

SPAWN_PTS.forEach(([x,z])=>trySpawn(x,z));

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 鐜╁
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const P={
  hp:100, maxHp:100,
  ammo:30, maxAmmo:30, reserve:120,
  score:0, kills:0, streak:0,
  yaw:0, pitch:0,
  shooting:false, lastShot:0,
  reloading:false, reloadProgress:0, reloadTime:1.8,
  meleeing:false, meleeTimer:0,
  bobPhase:0, isMoving:false,
  stepTimer:0,
  // 鍚庡潗鍔?  recoilPitch:0, recoilYaw:0,
};

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 灏勭嚎
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const ray=new THREE.Raycaster();

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 浼ゅ鏁板瓧
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?function showDmgNum(worldPos,dmg){
  const el=document.createElement('div');
  el.className='dmgnum';
  el.textContent=dmg;
  // 涓栫晫鍧愭爣杞睆骞?  const v=worldPos.clone().project(camera);
  const sx=(v.x*0.5+0.5)*innerWidth;
  const sy=(-v.y*0.5+0.5)*innerHeight;
  el.style.left=sx+'px'; el.style.top=sy+'px';
  document.getElementById('ui').appendChild(el);
  setTimeout(()=>el.remove(),800);
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 灏勫嚮
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?let muzzleTimer=0;
const xhair=document.getElementById('xhair');

function shoot(){
  if(P.reloading||P.meleeing||P.ammo<=0) return;
  const now=performance.now();
  if(now-P.lastShot<110) return;
  P.lastShot=now;
  P.ammo--;
  updateAmmoUI();
  playGunshot();

  // 鍚庡潗鍔?  P.recoilPitch-=0.03+Math.random()*0.015;
  P.recoilYaw+=(Math.random()-0.5)*0.018;

  // 鏋悗鍧愪綅绉伙紙绔嬪嵆寰€鍚庢帹锛?  gunGroup.position.z=-0.25;

  // 鏋彛闂紙0.07绉掞級
  muzzleFlash.intensity=6; muzzleTimer=0.07;
  muzzleSprite.material.opacity=1.0;

  // 鍑嗘槦鎵╂暎
  xhair.classList.add('spread');
  setTimeout(()=>xhair.classList.remove('spread'),100);

  // 灏勭嚎
  ray.setFromCamera({x:0,y:0},camera);
  const eMeshes=enemies.flatMap(e=>e.meshes);
  const eHits=ray.intersectObjects(eMeshes,false);
  if(eHits.length>0){
    const hit=eHits[0];
    const dmg=15+Math.floor(Math.random()*12);
    // 鎵惧搴旀晫浜?    for(const e of enemies){
      if(e.meshes.includes(hit.object)){
        e.hp-=dmg;
        e.refreshHp(Math.max(0,e.hp),e.maxHp);
        spawnBlood(hit.point);
        showDmgNum(hit.point,dmg);
        // 纭洿
        e.stunTimer=0.28;
        // 鍑嗘槦鍙樼孩
        document.getElementById('xh-dot').style.transform='scale(2)';
        setTimeout(()=>document.getElementById('xh-dot').style.transform='',100);
        playHit();
        if(e.hp<=0) killEnemy(e);
        break;
      }
    }
  } else {
    // 澧欎綋
    const wObjs=scene.children.filter(c=>c.isMesh&&c.material===wallMat);
    const wHits=ray.intersectObjects(wObjs,false);
    if(wHits.length>0) spawnHole(wHits[0].point,wHits[0].face.normal);
  }

  if(P.ammo===0&&P.reserve>0) startReload();
}

function killEnemy(e){
  if(e.dying) return;
  e.dying=true; e.state='dying'; e.dyingTimer=0.6;
  e.meshes=[];
  // 鎸夌被鍨嬫幏楠板喅瀹氭帀钀斤紝null=涓嶆帀
  spawnDrop(e.group.position, rollDrop(e.kind));
  P.kills++; P.streak++;
  P.score+=(e.score||100)*(P.streak>=3?2:1);
  updateScoreUI();
  const streakEl=document.getElementById('kill-streak');
  if(P.streak>=3){ streakEl.textContent=`${P.streak} KILL STREAK!`; }
  else { streakEl.textContent=''; }
  setTimeout(()=>{
    const pt=SPAWN_PTS[Math.floor(Math.random()*SPAWN_PTS.length)];
    trySpawn(pt[0],pt[1]);
  },6000+Math.random()*4000);
}

function startReload(){
  if(P.reserve<=0||P.ammo===P.maxAmmo||P.reloading) return;
  P.reloading=true; P.reloadProgress=0;
  playReload();
}

function finishReload(){
  const need=P.maxAmmo-P.ammo;
  const take=Math.min(need,P.reserve);
  P.ammo+=take; P.reserve-=take;
  P.reloading=false;
  updateAmmoUI();
  document.getElementById('reload-bar').style.width='0';
  document.getElementById('reload-bar').style.transition='none';
}

function doMelee(){
  if(P.meleeing) return;
  P.meleeing=true; P.meleeTimer=0.4;
  playMelee();
  // 杩戞垬灏勭嚎锛岀煭璺濈澶т激瀹?  ray.setFromCamera({x:0,y:0},camera);
  const eMeshes=enemies.flatMap(e=>e.meshes);
  const hits=ray.intersectObjects(eMeshes,false);
  if(hits.length>0&&hits[0].distance<2.5){
    for(const e of enemies){
      if(e.meshes.includes(hits[0].object)){
        const dmg=60+Math.floor(Math.random()*20);
        e.hp-=dmg;
        e.refreshHp(Math.max(0,e.hp),e.maxHp);
        e.stunTimer=0.4;
        showDmgNum(hits[0].point,dmg);
        spawnBlood(hits[0].point);
        if(e.hp<=0) killEnemy(e);
        break;
      }
    }
  }
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// UI
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?function updateHpUI(){
  const pct=P.hp/P.maxHp;
  document.getElementById('hp-fill').style.width=(pct*100)+'%';
  document.getElementById('hp-fill').style.background=pct>0.5?'linear-gradient(90deg,#27ae60,#2ecc71)':pct>0.25?'linear-gradient(90deg,#f39c12,#f0a500)':'linear-gradient(90deg,#c0392b,#e94560)';
  document.getElementById('hp-num').textContent=`${Math.ceil(P.hp)} / ${P.maxHp}`;
  const lb=document.getElementById('lowblood');
  if(pct<0.3){ const p=Math.round((0.3-pct)/0.3*12); lb.style.boxShadow=`inset 0 0 ${p*4}px #e94560`; lb.style.borderWidth=p+'px'; }
  else { lb.style.boxShadow=''; lb.style.borderWidth='0'; }
}
function updateAmmoUI(){
  document.getElementById('ammo-main').textContent=P.ammo;
  document.getElementById('ammo-res').textContent=P.reserve;
  document.getElementById('ammo-main').style.color=P.ammo<=5?'#e94560':P.ammo<=10?'#f0a500':'#fff';
}
function updateScoreUI(){
  document.getElementById('score-num').textContent=P.score;
  document.getElementById('kills').textContent='鍑绘潃: '+P.kills;
}

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 杈撳叆
// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?const keys={};
document.addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(e.code==='KeyR') startReload();
  if(e.code==='KeyF') doMelee();
  e.preventDefault();
},{passive:false});
document.addEventListener('keyup',e=>{ keys[e.code]=false; });

let locked=false;
canvas.addEventListener('click',()=>{ if(gameStarted) canvas.requestPointerLock(); });
document.addEventListener('pointerlockchange',()=>{ locked=document.pointerLockElement===canvas; });
document.addEventListener('mousemove',e=>{
  if(!locked) return;
  P.yaw-=e.movementX*0.0022;
  P.pitch-=e.movementY*0.0022;
  P.pitch=Math.max(-1.3,Math.min(1.3,P.pitch));
});
document.addEventListener('mousedown',e=>{ if(e.button===0&&locked) P.shooting=true; });
document.addEventListener('mouseup',e=>{ if(e.button===0) P.shooting=false; });

// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?// 娓告垙涓诲惊鐜?// 鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺愨晲鈺?let gameStarted=false, gameDead=false, lastTime=0;

document.getElementById('startBtn').onclick=()=>{
  document.getElementById('overlay').style.display='none';
  gameStarted=true;
  lastTime=performance.now();
  canvas.requestPointerLock();
};
document.getElementById('restartBtn').onclick=()=>location.reload();

function loop(now){
  requestAnimationFrame(loop);
  if(!gameStarted||gameDead) return;
  const dt=Math.min((now-lastTime)/1000,0.05);
  lastTime=now;

  // 鈹€鈹€ 灏勫嚮 鈹€鈹€
  if(P.shooting) shoot();

  // 鈹€鈹€ 鎹㈠脊 鈹€鈹€
  if(P.reloading){
    P.reloadProgress+=dt/P.reloadTime;
    if(P.reloadProgress>=1){ finishReload(); }
    else {
      const rb=document.getElementById('reload-bar');
      rb.style.transition='none';
      rb.style.width=(P.reloadProgress*100)+'%';
      // 鎹㈠脊鍔ㄧ敾锛氭灙鍏堜笅娌夎浆鍔ㄥ啀鎶捣
      const phase=P.reloadProgress;
      if(phase<0.4){
        // 涓嬫矇闃舵
        gunGroup.position.y=-0.22-Math.sin(phase/0.4*Math.PI)*0.18;
        gunGroup.rotation.z=Math.sin(phase/0.4*Math.PI)*0.3;
      } else {
        // 鎶捣闃舵
        gunGroup.position.y=-0.22-Math.sin((1-phase)/0.6*Math.PI)*0.1;
        gunGroup.rotation.z=Math.sin((1-phase)/0.6*Math.PI)*0.15;
      }
    }
  }

  // 鈹€鈹€ 杩戞垬璁℃椂 鈹€鈹€
  if(P.meleeing){
    P.meleeTimer-=dt;
    const t=1-P.meleeTimer/0.4;
    // 鎸ユ嫵鍔ㄧ敾
    gunGroup.rotation.x=-Math.sin(t*Math.PI)*0.8;
    gunGroup.position.z=-0.4+Math.sin(t*Math.PI)*0.2;
    if(P.meleeTimer<=0){ P.meleeing=false; gunGroup.rotation.x=0; }
  }

  // 鈹€鈹€ 鍚庡潗鍔涙仮澶?鈹€鈹€
  P.recoilPitch*=0.82; P.recoilYaw*=0.82;

  // 鈹€鈹€ 鏋彛闂秷閫€ 鈹€鈹€
  if(muzzleTimer>0){
    muzzleTimer-=dt;
    if(muzzleTimer<=0){ muzzleFlash.intensity=0; muzzleSprite.material.opacity=0; }
  }

  // 鈹€鈹€ 绉诲姩 鈹€鈹€
  const spd=(keys['ShiftLeft']||keys['ShiftRight'])?9:5.5;
  const sin=Math.sin(P.yaw), cos=Math.cos(P.yaw);
  let mx=0,mz=0;
  if(keys['KeyW']||keys['ArrowUp'])    { mx-=sin; mz-=cos; }
  if(keys['KeyS']||keys['ArrowDown'])  { mx+=sin; mz+=cos; }
  if(keys['KeyA']||keys['ArrowLeft'])  { mx-=cos; mz+=sin; }
  if(keys['KeyD']||keys['ArrowRight']) { mx+=cos; mz-=sin; }
  const ml=Math.sqrt(mx*mx+mz*mz);
  P.isMoving=ml>0;
  if(P.isMoving){ mx=mx/ml*spd*dt; mz=mz/ml*spd*dt; }

  if(canMove(camera.position.x+mx,camera.position.z)) camera.position.x+=mx;
  if(canMove(camera.position.x,camera.position.z+mz)) camera.position.z+=mz;

  // 鈹€鈹€ 鑴氭澹?鈹€鈹€
  if(P.isMoving){
    P.stepTimer+=dt*(spd>7?1.5:1);
    if(P.stepTimer>0.45){ P.stepTimer=0; playStep(); }
  } else { P.stepTimer=0; }

  // 鈹€鈹€ 澶撮儴鎽囨憜 鈹€鈹€
  if(P.isMoving) P.bobPhase+=dt*8;
  const bobY=P.isMoving?Math.sin(P.bobPhase)*0.04:0;
  const bobX=P.isMoving?Math.sin(P.bobPhase*0.5)*0.02:0;
  camera.position.y=1.7+bobY;

  // 鈹€鈹€ 鐩告満鏃嬭浆 鈹€鈹€
  camera.rotation.order='YXZ';
  camera.rotation.y=P.yaw;
  camera.rotation.x=P.pitch+P.recoilPitch;
  camera.rotation.z=bobX;

  // 鈹€鈹€ 鏋憜鍔紙璧拌矾鏃讹級 鈹€鈹€
  if(!P.reloading&&!P.meleeing){
    const targetGunY=-0.22+bobY*1.5;
    const targetGunX=bobX*2;
    gunGroup.position.y+=(targetGunY-gunGroup.position.y)*0.15;
    gunGroup.position.x+=(0.22+targetGunX*0.5-gunGroup.position.x)*0.1;
    // 鏋悗鍧愬钩婊戝洖浣嶏紙-0.4 鏄潤姝綅缃級
    gunGroup.position.z+=(-0.4-gunGroup.position.z)*0.25;
    // rotation 鍥炴
    gunGroup.rotation.z+=(0-gunGroup.rotation.z)*0.15;
  }

  // 鈹€鈹€ 绮掑瓙 鈹€鈹€
  updateParticles(dt);

  // 鈹€鈹€ 鏁屼汉AI 鈹€鈹€
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];
    const ep=e.group.position;
    const dx=camera.position.x-ep.x;
    const dz=camera.position.z-ep.z;
    const dist=Math.sqrt(dx*dx+dz*dz);

    // 鈹€鈹€ 姝讳骸鍊掑湴 鈹€鈹€
    if(e.dying){
      e.dyingTimer-=dt;
      e.group.rotation.z+=dt*4;
      e.group.position.y-=dt*1.5;
      if(e.dyingTimer<=0){ scene.remove(e.group); enemies.splice(i,1); }
      continue;
    }

    // 鈹€鈹€ 纭洿 鈹€鈹€
    if(e.stunTimer>0){
      e.stunTimer-=dt;
      const flash=Math.sin(e.stunTimer*40)>0;
      e.meshes.forEach(m=>{
        if(m.material&&!Array.isArray(m.material))
          m.material.emissive=new THREE.Color(flash?0xffffff:0x000000);
      });
      continue;
    } else {
      e.meshes.forEach(m=>{
        if(m.material&&!Array.isArray(m.material)&&m.material.emissive)
          m.material.emissive.set(0x000000);
      });
    }

    // 鈹€鈹€ 鏈濆悜 鈹€鈹€
    if(e.state==='flee'){
      e.group.rotation.y=Math.atan2(-dx,-dz);
    } else {
      e.group.rotation.y=Math.atan2(dx,dz);
    }

    // 鈹€鈹€ 鑵胯噦鍔ㄧ敾 鈹€鈹€
    const animSpd=e.state==='flee'?5:e.state==='patrol'?2:4;
    e.legAnim+=dt*animSpd;
    e.legL.rotation.x= Math.sin(e.legAnim)*0.5;
    e.legR.rotation.x=-Math.sin(e.legAnim)*0.5;
    e.armL.rotation.x=-Math.sin(e.legAnim)*0.35;
    e.armR.rotation.x= Math.sin(e.legAnim)*0.35;

    // 鈹€鈹€ 閫冭窇 鈹€鈹€
    if(e.state==='flee'){
      moveEnemy(ep,-dx,-dz,e.speed*1.2,dt);
      if(dist>20) e.state='patrol';
      continue;
    }

    // 鈹€鈹€ 娈嬭鍒囬€冭窇 鈹€鈹€
    if(e.fleeHp>0 && e.hp/e.maxHp<e.fleeHp && dist<16){
      e.state='flee'; continue;
    }

    // 鈺愨晲鈺愨晲 鍚勭被鍨嬩笓灞為€昏緫 鈺愨晲鈺愨晲

    if(e.kind==='heavy'){
      // 閲嶈锛氶潬杩戝埌涓窛绂伙紝鍋滀笅灏勫嚮
      if(dist<e.attackRange && dist>3){
        e.state='attack';
        e.attackTimer+=dt;
        if(e.attackTimer>=e.attackRate){
          e.attackTimer=0;
          // 灏勫嚮锛堟墸琛€锛?          P.hp=Math.max(0,P.hp-e.attackDmg);
          updateHpUI();
          const pain=document.getElementById('pain');
          pain.style.background='rgba(233,69,96,0.35)';
          setTimeout(()=>pain.style.background='rgba(233,69,96,0)',100);
          playHit();
          if(P.hp<=0) die();
        }
      } else if(dist>e.attackRange){
        e.state='chase';
        moveEnemy(ep,dx,dz,e.speed,dt);
      }
      continue;
    }

    if(e.kind==='sniper'){
      // 鐙欏嚮锛氫繚鎸?preferDist锛屽お杩戝悗閫€锛屽湪鑼冨洿鍐呭仠涓嬭搫鍔涘皠鍑?      if(dist<e.preferDist-1){
        // 澶繎锛屽悗閫€
        e.state='chase';
        moveEnemy(ep,-dx,-dz,e.speed,dt);
      } else if(dist<=e.attackRange){
        // 鍦ㄥ皠绋嬪唴锛屽仠涓嬪皠鍑?        e.state='attack';
        e.attackTimer+=dt;
        if(e.attackTimer>=e.attackRate){
          e.attackTimer=0;
          P.hp=Math.max(0,P.hp-e.attackDmg);
          updateHpUI();
          const pain=document.getElementById('pain');
          pain.style.background='rgba(233,69,96,0.5)';
          setTimeout(()=>pain.style.background='rgba(233,69,96,0)',120);
          playHit();
          if(P.hp<=0) die();
        }
      } else {
        e.state='patrol';
        // 宸￠€绘极姝?        e.patrolTimer-=dt;
        if(!e.patrolTarget||e.patrolTimer<=0){
          e.patrolTimer=2+Math.random()*3;
          const angle=Math.random()*Math.PI*2;
          e.patrolTarget={x:ep.x+Math.cos(angle)*3,z:ep.z+Math.sin(angle)*3};
        }
        const pdx=e.patrolTarget.x-ep.x, pdz=e.patrolTarget.z-ep.z;
        const pl=Math.sqrt(pdx*pdx+pdz*pdz);
        if(pl>0.3) moveEnemy(ep,pdx,pdz,e.speed,dt);
        else e.patrolTarget=null;
      }
      continue;
    }

    // 鈹€鈹€ 鏅€氬叺 & 鐙傛垬澹紙杩戣韩锛?鈹€鈹€
    if(dist<e.attackRange){
      e.state='attack';
      e.attackTimer+=dt;
      if(e.attackTimer>=e.attackRate){
        e.attackTimer=0;
        const dmg=e.attackDmg+Math.floor(Math.random()*5);
        P.hp=Math.max(0,P.hp-dmg);
        P.streak=0;
        updateHpUI();
        document.getElementById('kill-streak').textContent='';
        const pain=document.getElementById('pain');
        pain.style.background='rgba(233,69,96,0.45)';
        setTimeout(()=>pain.style.background='rgba(233,69,96,0)',120);
        playHit();
        if(P.hp<=0) die();
      }
    } else if(dist<14){
      e.state='chase';
      moveEnemy(ep,dx,dz,e.speed,dt);
    } else {
      e.state='patrol';
      e.patrolTimer-=dt;
      if(!e.patrolTarget||e.patrolTimer<=0){
        e.patrolTimer=1.5+Math.random()*3;
        const angle=Math.random()*Math.PI*2;
        e.patrolTarget={x:ep.x+Math.cos(angle)*4,z:ep.z+Math.sin(angle)*4};
      }
      const pdx=e.patrolTarget.x-ep.x, pdz=e.patrolTarget.z-ep.z;
      const pl=Math.sqrt(pdx*pdx+pdz*pdz);
      if(pl>0.3) moveEnemy(ep,pdx,pdz,e.speed,dt);
      else e.patrolTarget=null;
    }
  }

  renderer.render(scene,camera);
}

function die(){
  gameDead=true;
  document.exitPointerLock();
  playDeath();
  const d=document.getElementById('dead');
  d.style.display='flex';
  document.getElementById('dead-stats').innerHTML=`寰楀垎: <span>${P.score}</span><br>鍑绘潃: <span>${P.kills}</span><br>鏈€楂樿繛鏉€: <span>${P.streak}</span>`;
}

updateHpUI(); updateAmmoUI(); updateScoreUI();
requestAnimationFrame(loop);

