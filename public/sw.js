const CACHE_NAME = 'corposepi-stereo-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/logo.png',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Raleway:wght@300;400;600;800&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // No interceptar el stream de audio ni el panel tikast
  if (
    url.hostname === '195.154.79.204' ||
    url.hostname === 'play14.tikast.com' ||
    e.request.url.includes('/stream')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return response;
        })
        .catch(() => {
          if (e.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
