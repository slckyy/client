'use strict';
const ROOT = new URL('./', self.location.href);
const PREFIX = 'relieve-calls-' + ROOT.pathname.replace(/[^a-zA-Z0-9]/g, '_') + '-';
const CACHE = PREFIX + 'v1';
const FILES = ['./', './index.html', './styles.css', './app.js', './atmosphere.svg', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'].map(path => new URL(path, ROOT).href);
const INDEX = new URL('./index.html', ROOT).href;
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== ROOT.origin || !url.href.startsWith(ROOT.href)) return;
  const navigation = request.mode === 'navigate';
  if (!navigation && !FILES.includes(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok) { await cache.put(navigation ? INDEX : request, response.clone()); return response; }
      return (await cache.match(navigation ? INDEX : request)) || response;
    } catch {
      return (await cache.match(navigation ? INDEX : request)) || new Response('This part of the app is not available offline yet. Connect once and reopen it.', {status:503,headers:{'Content-Type':'text/plain'}});
    }
  })());
});
