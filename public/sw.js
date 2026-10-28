// NavigAItor hizmet çalışanı — çevrimdışı açılış ve hızlı yükleme.
// Sayfalar: önce ağ, bağlantı yoksa önbellek. Diğer dosyalar: önce önbellek.
const VERSION = '__BUILD_VERSION__';
const CACHE = 'navigaitor-' + VERSION;
const PAGES = ['/', '/ogretmen', '/ogrenci', '/veli'];
const ASSETS = ['/manifest-ogretmen.webmanifest', '/manifest-ogrenci.webmanifest', '/manifest-veli.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([...PAGES, ...ASSETS])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('navigaitor-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(url.pathname, copy));
      return res;
    }).catch(() => caches.match(url.pathname).then((r) => r || caches.match('/'))));
    return;
  }
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !isFont) return;
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
