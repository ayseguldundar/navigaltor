// NavigAItor hizmet çalışanı — çevrimdışı açılış ve hızlı yükleme.
// Sayfalar: önce ağ, bağlantı yoksa önbellek. Diğer dosyalar: önce önbellek.
const VERSION = '__BUILD_VERSION__';
const CACHE = 'navigaitor-' + VERSION;
// Demo panelleri (büyük dosyalar) önceden indirilmez; ziyaret edilince önbelleğe girer.
const PAGES = ['/', '/giris', '/yonetim', '/ogrenci', '/veli'];
const ASSETS = ['/manifest-ogretmen.webmanifest', '/manifest-ogrenci.webmanifest', '/manifest-veli.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png',
  '/config.js', '/vendor/supabase-js-2.117.2.js', '/app/supa.js', '/app/oturum.js', '/app/ortak.css', '/app/giris.js', '/app/yonetim.js', '/app/liste.js',
  '/app/yonetim-etkinlik.js', '/app/ogrenci.js', '/app/veli.js', '/app/kit-gorsel.js', '/app/navi.js', '/app/etkinlik.css', '/app/kvkk.js'];

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
  // Uygulama kodu ve ayarlar: önce ağ (yeni yayından hemen sonra eski kod çalışmasın), bağlantı yoksa önbellek.
  if (url.origin === location.origin && (url.pathname.startsWith('/app/') || url.pathname === '/config.js')) {
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  })));
});
