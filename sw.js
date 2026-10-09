'use strict';
const CACHE_PREFIX = 'tin6-bai15-thuat-toan-';
const STATIC_CACHE = CACHE_PREFIX + 'v1';
const CORE_ASSETS = ['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== STATIC_CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(STATIC_CACHE).then(c => c.put('./index.html', copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp => {
    if (resp && resp.ok) {
      const copy = resp.clone();
      caches.open(STATIC_CACHE).then(c => c.put(req, copy)).catch(() => {});
    }
    return resp;
  })));
});
