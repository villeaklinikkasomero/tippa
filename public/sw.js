/* Tippa service worker: tallentaa sovelluksen tiedostot laitteelle, jotta palvelu aukeaa myös ilman verkkoa.
   Nosta VERSION-numeroa aina, kun julkaiset muutoksia, niin käyttäjät saavat uuden version. */
const VERSION = 'tippa-v7';
const ASSETS = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'manifest.webmanifest',
  'favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'palkinnot/30-paivaa-ilman-alkoholia.webp',
  'fonts/baloo-2-latin-600-normal.woff2',
  'fonts/baloo-2-latin-700-normal.woff2',
  'fonts/baloo-2-latin-800-normal.woff2',
  'fonts/figtree-latin-400-normal.woff2',
  'fonts/figtree-latin-500-normal.woff2',
  'fonts/figtree-latin-600-normal.woff2',
  'fonts/figtree-latin-700-normal.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Sivu: verkko ensin, jotta päivitykset näkyvät heti; ilman verkkoa välimuistista.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('index.html', copy)); return res; })
        .catch(() => caches.match('index.html'))
    );
    return;
  }
  // Muut tiedostot: välimuisti ensin.
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
