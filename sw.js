const V='uw-v4',CORE=['./','index.html','css/style.css','js/puzzles.js','js/puzzles2.js','js/certs.js','js/core.js','js/app.js','books.json','bookmeta.json','manifest.webmanifest','icons/icon-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  const isApp=u.origin===location.origin;
  e.respondWith(
    caches.match(e.request).then(hit=>{
      const net=fetch(e.request).then(r=>{if(r&&r.ok&&(isApp||/fonts\.g/.test(u.host))){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));}return r;}).catch(()=>hit);
      return isApp&&/\.(js|css|html|json)$|\/$/.test(u.pathname)?net.then(r=>r||hit):(hit||net);
    })
  );
});
