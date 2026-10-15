"use strict";
const cacheName = "textcove-57e9c53f";
const assets = [
  "./",
  "./index.html",
  "./404.html",
  "./app.css",
  "./app.js",
  "./boot.js",
  "./assets/IBMPlexMono-Regular.woff2",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return Promise.allSettled(
        assets.map(function(url) {
          return cache.add(new Request(url, { cache: "reload" }));
        })
      );
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener("message", function(event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") {
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(cacheName).then(function(cache) {
            cache.put("./index.html", copy);
          }).catch(function() {});
          return response;
        }
        if (response && response.status === 404) {
          return caches.match("./404.html", { ignoreSearch: true }).then(function(page) {
            return page || response;
          });
        }
        return response;
      }).catch(function() {
        return caches.match("./index.html", { ignoreSearch: true });
      })
    );
    return;
  }
  const url = new URL(event.request.url);
  const path = url.pathname;
  const isAppShell = url.origin === self.location.origin && (
    path === "/" ||
    path.slice(-1) === "/" ||
    path.slice(-10) === "index.html" ||
    path.slice(-6) === "app.js" ||
    path.slice(-7) === "boot.js" ||
    path.slice(-7) === "app.css"
  );
  if (isAppShell) {
    const shellKey = (path === "/" || path.slice(-1) === "/" || path.slice(-10) === "index.html") ? "./index.html" : event.request;
    event.respondWith(
      fetch(event.request).then(function(response) {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(cacheName).then(function(cache) {
            cache.put(shellKey, copy);
          }).catch(function() {});
        }
        return response;
      }).catch(function() {
        return caches.match(shellKey, { ignoreSearch: false });
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request, { ignoreSearch: false }).then(function(cached) {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(function(response) {
        if (response && response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(cacheName).then(function(cache) {
            cache.put(event.request, copy);
          }).catch(function() {});
        }
        return response;
      }).catch(function() {
        const dest = event.request.destination;
        if (dest === "image" || dest === "font" || dest === "audio" || dest === "video") {
          return new Response("", { status: 404, statusText: "Not Found" });
        }
        return caches.match("./index.html", { ignoreSearch: true });
      });
    })
  );
});
