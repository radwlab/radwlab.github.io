/* forever: mat tema + 3D model. index dosyasına tek satır eklenir: <script src="matte3d.js"></script> */
(function(){
  const st=document.createElement('style');st.textContent="/* mat: saf siyah/beyaz yerine k\u00f6m\u00fcr grisi + k\u0131r\u0131k beyaz */\n:root{\n  --ink:#e8e6e2;\n  --line:rgba(232,230,226,.15);\n  --dim:rgba(232,230,226,.5);\n}\nhtml,body{background:#0e0e0f;color:var(--ink)}\n#bg{filter:grayscale(.45) contrast(.9) brightness(.8) saturate(.65)}\n.vig{background:\n  linear-gradient(to top,rgba(14,14,15,.75),transparent 38%),\n  linear-gradient(to bottom,rgba(14,14,15,.55),transparent 20%),\n  radial-gradient(ellipse at center,rgba(14,14,15,.12) 55%,rgba(14,14,15,.55) 100%)}\nbody::after{content:\"\";position:fixed;inset:0;z-index:5;pointer-events:none;opacity:.09;mix-blend-mode:overlay;\n  background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")}\n#pp{background:var(--ink);border-color:var(--ink)}\n#pp:hover,.cb:hover{background:#cfccc7;border-color:#cfccc7;color:#111}\n#barfill,#vol .fl,.pb i{background:var(--ink)}\n.it.act{background:var(--ink);color:#111}\n#dc{background:rgba(22,22,23,.72)}\n#list{background:rgba(18,18,19,.9)}\n#gl{position:fixed;inset:0;width:100%;height:100%;z-index:3;pointer-events:none;opacity:0;transition:opacity 1.6s .4s ease}\nbody.in #gl{opacity:1}";document.head.appendChild(st);
  function load(src){return new Promise((ok,no)=>{const e=document.createElement('script');e.src=src;e.onload=ok;e.onerror=no;document.head.appendChild(e)})}
  load('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js')
    .then(()=>load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js').catch(()=>{}))
    .then(run).catch(()=>{});
  function run(){
/* 3D model katmanı. Sitedeki lvl (ses), tx/ty (fare), started ve v (video) değişkenlerini kullanır.
   Klasöre "model.glb" koyarsan o gösterilir; yoksa mat gri bir torus knot gösterilir. */
(function(){
  if(!window.THREE) return;
  const cv=document.createElement('canvas');cv.id='gl';document.body.appendChild(cv);
  const R=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});
  R.setPixelRatio(Math.min(devicePixelRatio||1,2));
  const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(35,1,.1,50);C.position.z=7;
  S.add(new THREE.HemisphereLight(0xf2efe9,0x1a1a1c,.95));
  const key=new THREE.DirectionalLight(0xffffff,.75);key.position.set(3,4,5);S.add(key);
  const rim=new THREE.DirectionalLight(0x9aa0aa,.5);rim.position.set(-4,-1,-3);S.add(rim);

  const mat=new THREE.MeshStandardMaterial({color:0xb7b4af,roughness:.93,metalness:0});
  const rig=new THREE.Group();S.add(rig);
  let model=new THREE.Mesh(new THREE.TorusKnotGeometry(1.25,.38,220,32,2,3),mat);
  rig.add(model);

  if(THREE.GLTFLoader){
    new THREE.GLTFLoader().load('model.glb',g=>{
      const o=g.scene,b=new THREE.Box3().setFromObject(o),sz=b.getSize(new THREE.Vector3()),ct=b.getCenter(new THREE.Vector3());
      o.position.sub(ct);                                   // ortala
      const k=3.2/Math.max(sz.x,sz.y,sz.z);                 // boyutu sabitle
      const wrap=new THREE.Group();wrap.add(o);wrap.scale.setScalar(k);
      o.traverse(m=>{if(m.isMesh&&m.material){m.material.roughness=Math.max(m.material.roughness||0,.85);m.material.metalness=Math.min(m.material.metalness||0,.15)}});
      rig.remove(model);model=wrap;rig.add(model);
    },undefined,()=>{});
  }

  let W=0,H=0,pulse=0,spin=0;
  function fit(){W=innerWidth;H=innerHeight;R.setSize(W,H,false);C.aspect=W/H;C.updateProjectionMatrix();rig.position.y=.35}
  addEventListener('resize',fit);fit();
  v.addEventListener('loadeddata',()=>{pulse=1});          // her video değişiminde nabız

  (function loop(){
    requestAnimationFrame(loop);
    if(!started)return;
    const l=typeof lvl==='number'?lvl:0,x=typeof tx==='number'?tx:0,y=typeof ty==='number'?ty:0;
    pulse*=.94;spin+=.004+l*.02+pulse*.05;
    const base=(W<768?.5:.62)*(1+l*.14+pulse*.3);
    rig.scale.setScalar(base);
    rig.rotation.y=spin+x*.6;rig.rotation.x=y*.5+Math.sin(spin*.7)*.08;
    R.render(S,C);
  })();
})();
  }
})();
