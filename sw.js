const CACHE='liga-manager-offline-v71';
const ASSETS=['./','./index.html','./games.html','./match.html','./stats.html','./startelf.html','./team.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET') return;
  e.respondWith((async()=>{
    const u=new URL(r.url);
    const key=new Request(u.origin+u.pathname);
    const cached=await caches.match(key)||await caches.match(r);
    if(cached) return cached;
    try{
      const fresh=await fetch(r);
      if(fresh.ok && u.origin===location.origin){
        const copy=fresh.clone();
        const c=await caches.open(CACHE);
        c.put(key,copy).catch(()=>{});
      }
      return fresh;
    }catch(err){
      if(r.mode==='navigate') return caches.match('./index.html');
      return new Response('',{status:503,statusText:'Offline'});
    }
  })());
});
