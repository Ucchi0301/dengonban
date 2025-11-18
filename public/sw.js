self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  clients.claim();
});

// オフライン対応（最低限）
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => null));
});
