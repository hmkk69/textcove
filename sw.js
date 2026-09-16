// offline mode

var cacheName = "simplejot-v4";
var assets = [
  "./",
  "./index.html",
  "./app.css",
  "./app.js",
  "./IBMPlexMono-Regular.woff2",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(assets);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== cacheName) {
            return caches.delete(key);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") {
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).then(function (response) {
        var copy = response.clone();
        caches.open(cacheName).then(function (cache) {
          cache.put("./index.html", copy);
        });
        return response;
      }).catch(function () {
        return caches.match("./index.html", { ignoreSearch: true });
      })
    );
    return;
  }
  var url = new URL(event.request.url);
  var path = url.pathname;
  var isAppShell = url.origin === self.location.origin && (
    path === "/" ||
    path.slice(-1) === "/" ||
    path.slice(-10) === "index.html" ||
    path.slice(-6) === "app.js" ||
    path.slice(-7) === "app.css"
  );
  if (isAppShell) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        if (response && response.status === 200) {
          var copy = response.clone();
          caches.open(cacheName).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      }).catch(function () {
        return caches.match(event.request, { ignoreSearch: false });
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request, { ignoreSearch: false }).then(function (cached) {
      if (cached) {
        return cached;
      }
      return fetch(event.request).then(function (response) {
        if (response && response.status === 200 && response.type === "basic") {
          var copy = response.clone();
          caches.open(cacheName).then(function (cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      });
    })
  );
});
