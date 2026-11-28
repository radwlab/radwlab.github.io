/* forever: mat tema + 3D video menüsü. index dosyasına tek satır: <script src="matte3d.js"></script> */
(function(){
const CSS=`
:root{--ink:#e8e6e2;--line:rgba(232,230,226,.15);--dim:rgba(232,230,226,.5)}
html,body{background:#0e0e0f;color:var(--ink)}
#bg{filter:grayscale(.45) contrast(.9) brightness(.8) saturate(.65);transition:opacity .7s ease,filter .9s ease}
body.m3on #bg{filter:grayscale(.7) brightness(.32) blur(18px)}
.vig{background:linear-gradient(to top,rgba(14,14,15,.75),transparent 38%),linear-gradient(to bottom,rgba(14,14,15,.55),transparent 20%),radial-gradient(ellipse at center,rgba(14,14,15,.12) 55%,rgba(14,14,15,.55) 100%)}
body::after{content:"";position:fixed;inset:0;z-index:5;pointer-events:none;opacity:.09;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}
#pp{background:var(--ink);border-color:var(--ink)}
#pp:hover,.cb:hover{background:#cfccc7;border-color:#cfccc7;color:#111}
#barfill,#vol .fl,.pb i{background:var(--ink)}
.it.act{background:var(--ink);color:#111}
#dc{background:rgba(22,22,23,.72)}
#list{background:rgba(18,18,19,.9)}
#gl{position:fixed;inset:0;width:100%;height:100%;z-index:3;opacity:0;pointer-events:none;touch-action:none;transition:opacity .55s ease}
body.m3on #gl{opacity:1;pointer-events:auto}
body.m3on #cc,body.m3on #bl,body.m3on #br{opacity:0!important;pointer-events:none!important}
#m3btn{top:20px;right:28px;width:40px;height:40px}
body.m3on #m3btn{opacity:0!important;pointer-events:none}
#m3lbl{position:fixed;z-index:100;left:50%;bottom:calc(34px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;font:500 .66rem var(--mono);letter-spacing:.24em;color:var(--dim);opacity:0;pointer-events:none;transition:opacity .5s;white-space:nowrap}
#m3lbl b{font-weight:500;color:var(--ink);letter-spacing:.3em}
body.m3on #m3lbl{opacity:1}
@media(max-width:768px){#m3btn{top:10px;right:16px;width:34px;height:34px}}`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
function inject(src){return new Promise((ok,no)=>{const e=document.createElement('script');e.src=src;e.onload=ok;e.onerror=no;document.head.appendChild(e)})}
inject('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js').then(run).catch(()=>{});

function run(){
  const n=vids.length,STEP=Math.PI*2/n,RAD=6,ease=t=>1-Math.pow(1-t,3);
  const cv=document.createElement('canvas');cv.id='gl';document.body.appendChild(cv);
  const rd=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  rd.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.1,60);
  sc.add(new THREE.HemisphereLight(0xf2efe9,0x1a1a1c,1));
  const key=new THREE.DirectionalLight(0xffffff,.7);key.position.set(3,5,6);sc.add(key);
  const ring=new THREE.Group();sc.add(ring);

  function tex(i,name){
    const c=document.createElement('canvas');c.width=360;c.height=450;const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,360,450);g.addColorStop(0,'#2d2d2f');g.addColorStop(1,'#19191b');
    x.fillStyle=g;x.fillRect(0,0,360,450);
    x.strokeStyle='rgba(232,230,226,.16)';x.lineWidth=2;x.strokeRect(14,14,332,422);
    x.fillStyle='rgba(232,230,226,.5)';x.font='500 20px ui-monospace,Menlo,monospace';
    x.fillText(String(i+1).padStart(2,'0')+' / '+n,32,56);
    x.fillStyle='#e8e6e2';if('letterSpacing' in x)x.letterSpacing='3px';
    const words=name.split(' ');let fs=48;
    do{x.font='300 '+fs+'px -apple-system,Helvetica,Arial,sans-serif';if(Math.max(...words.map(w=>x.measureText(w).width))<=296)break;fs-=2}while(fs>20);
    const lh=fs*1.15;words.forEach((w,k)=>x.fillText(w,32,404-(words.length-1-k)*lh));
    const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;
  }
  const body=new THREE.MeshStandardMaterial({color:0x2c2c2e,roughness:.95,metalness:0});
  const geo=new THREE.BoxGeometry(1.1,1.4,.12);
  const pose=m=>{const a=m.userData.i*STEP;m.position.set(Math.sin(a)*RAD,0,Math.cos(a)*RAD);m.rotation.set(0,a,0);m.scale.setScalar(1)};
  const tiles=vids.map((o,i)=>{
    const fm=new THREE.MeshBasicMaterial({map:tex(i,o.n)});
    const m=new THREE.Mesh(geo,[body,body,body,body,fm,body]);
    m.userData={i,fm};pose(m);ring.add(m);return m;
  });

  /* arayüz: menü butonu + alt yazı */
  const lb=document.createElement('div');lb.id='m3lbl';lb.innerHTML='<b id="m3n"></b><span>kaydır, dokunup aç</span>';document.body.appendChild(lb);
  const bt=document.createElement('button');bt.id='m3btn';bt.className='cb ui';bt.setAttribute('aria-label','video menüsü');
  bt.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>';
  document.body.appendChild(bt);

  let s=0,target=0,intro=0,fade=0,mode='idle',active=false,op=null,shown=false,drag=null,vel=0,curShown=-1,wheelT=0;
  const mod=k=>((Math.round(k)%n)+n)%n;

  function pauseSoon(){
    if(!v.paused&&v.readyState>=3){v.pause();setPP(false)}
    else v.addEventListener('playing',()=>{if(mode==='menu'){v.pause();setPP(false)}},{once:true});
  }
  function showMenu(){
    if(mode!=='idle')return;
    mode='menu';active=true;intro=0;fade=0;s=target=idx;
    document.body.classList.add('m3on');pauseSoon();
  }
  function closeMenu(){
    if(mode!=='menu')return;
    mode='idle';document.body.classList.remove('m3on');
    v.play().catch(()=>{});setPP(true);
    setTimeout(()=>{if(mode==='idle')active=false},700);
  }
  bt.onclick=showMenu;

  function openTile(k){
    if(mode!=='menu')return;
    mode='opening';const m=tiles[k];
    ring.updateMatrixWorld(true);
    const p=new THREE.Vector3(),q=new THREE.Quaternion(),sv=new THREE.Vector3();
    m.matrixWorld.decompose(p,q,sv);
    sc.attach(m);m.position.copy(p);m.quaternion.copy(q);m.scale.copy(sv);
    const dist=3,vh=2*Math.tan(THREE.MathUtils.degToRad(20))*dist,vw=vh*cam.aspect;
    const dir=new THREE.Vector3();cam.getWorldDirection(dir);
    op={m,k,from:{p,q,s:sv.x},to:{p:cam.position.clone().add(dir.multiplyScalar(dist)),q:cam.quaternion.clone(),s:Math.max(vh/1.4,vw/1.1)*1.06},
        t0:performance.now(),loaded:false,hidden:false,dirn:k>=idx?1:-1};
  }

  function pick(x,y){
    const r=cv.getBoundingClientRect(),ray=new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2((x-r.left)/r.width*2-1,-((y-r.top)/r.height)*2+1),cam);
    const hit=ray.intersectObjects(tiles.filter(m=>m.visible),false)[0];if(!hit)return;
    const i=hit.object.userData.i,cur=mod(s);
    if(i===cur)openTile(i);
    else{let d=i-cur;if(d>n/2)d-=n;if(d<-n/2)d+=n;target=Math.round(s)+d}
  }

  /* kaydırma / dokunma */
  const stepPx=()=>Math.max(90,innerWidth*.2);
  cv.addEventListener('pointerdown',e=>{if(mode!=='menu')return;cv.setPointerCapture(e.pointerId);drag={x:e.clientX,s0:s,moved:false,lx:e.clientX,lt:performance.now()};vel=0});
  cv.addEventListener('pointermove',e=>{
    if(!drag)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>8)drag.moved=true;
    if(drag.moved){const now=performance.now();s=drag.s0-dx/stepPx();target=s;vel=-(e.clientX-drag.lx)/stepPx()/Math.max(8,now-drag.lt)*16;drag.lx=e.clientX;drag.lt=now}
  });
  const up=e=>{if(!drag)return;const d=drag;drag=null;if(d.moved)target=Math.round(s+vel*9);else if(e.type==='pointerup')pick(e.clientX,e.clientY)};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();const t=performance.now();if(mode!=='menu'||t-wheelT<220)return;wheelT=t;target=Math.round(target)+((e.deltaY+e.deltaX)>0?1:-1)},{passive:false});

  /* klavye: menü açıkken site kısayollarını engelle (capture) */
  addEventListener('keydown',e=>{
    if(!started)return;
    if(e.key==='g'||e.key==='G'){e.stopImmediatePropagation();mode==='menu'?closeMenu():showMenu();return}
    if(mode==='idle')return;
    if(['ArrowLeft','ArrowRight','Enter','Escape'].includes(e.key)||e.code==='Space'){
      e.stopImmediatePropagation();e.preventDefault();if(mode!=='menu')return;
      if(e.key==='ArrowLeft')target=Math.round(target)-1;
      else if(e.key==='ArrowRight')target=Math.round(target)+1;
      else if(e.key==='Enter')openTile(mod(s));
      else if(e.key==='Escape')closeMenu();
    }
  },true);

  function fit(){rd.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
  addEventListener('resize',fit);fit();

  let last=performance.now();
  (function loop(now){
    requestAnimationFrame(loop);
    const dt=Math.min(50,now-last);last=now;
    if(!started)return;
    if(!shown){shown=true;setTimeout(showMenu,350)}   // girişten sonra menü kendiliğinden açılır
    if(!active)return;
    if(mode==='menu'){intro=Math.min(1,intro+dt/900);if(!drag)s+=(target-s)*(1-Math.exp(-dt/110))}
    const px=typeof tx==='number'?tx:0;
    cam.position.set(px*.7,1.6,13);cam.lookAt(0,0,0);
    ring.rotation.y=-s*STEP-(1-ease(intro))*1.4;
    const ei=ease(intro),c=mod(s);
    if(c!==curShown){curShown=c;document.getElementById('m3n').textContent=String(c+1).padStart(2,'0')+' / '+String(n).padStart(2,'0')}
    for(const m of tiles){
      if(op&&m===op.m)continue;
      const i=m.userData.i;let rel=(((i-s)%n)+n)%n;if(rel>n/2)rel-=n;
      const f=Math.cos(rel*STEP),near=Math.max(0,1-Math.abs(rel));
      m.visible=f>.2;if(!m.visible)continue;
      const w=Math.min(1,(f-.2)/.5);
      m.scale.setScalar((.55+.45*w)*(1+.14*near)*ei*(1-fade));
      m.position.y=Math.sin(now/900+i)*.04;
      m.userData.fm.color.setScalar(.38+.62*near);
    }
    if(op){
      const e0=Math.min(1,(now-op.t0)/1050),e=e0<.5?4*e0*e0*e0:1-Math.pow(-2*e0+2,3)/2;
      op.m.position.lerpVectors(op.from.p,op.to.p,e);
      op.m.quaternion.slerpQuaternions(op.from.q,op.to.q,e);
      op.m.scale.setScalar(op.from.s+(op.to.s-op.from.s)*e);
      fade=e;
      if(!op.loaded&&e0>.62){op.loaded=true;load(op.k,op.dirn);setPP(true);try{flash.animate([{opacity:.7},{opacity:0}],{duration:700})}catch(_){}}
      if(!op.hidden&&e0>.74){op.hidden=true;document.body.classList.remove('m3on')}
      if(now-op.t0>1750){ring.add(op.m);pose(op.m);op=null;fade=0;mode='idle';active=false;return}
    }
    rd.render(sc,cam);
  })(performance.now());
}
})();
