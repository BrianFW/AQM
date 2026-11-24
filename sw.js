// Service worker: caches the app shell so the dashboard opens instantly
// (and offline, showing its last layout). Data requests always go to the
// network — nothing from Apps Script is cached here.
const CACHE = 'air-monitor-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg', './icon-180.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;   // API calls pass through
  // Network first for the shell, so updates arrive; cache as fallback.
  e.respondWith(fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
    .catch(() => caches.match(e.request)));
});
