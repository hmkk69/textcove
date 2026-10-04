"use strict";
(function() {
  try {
    if (localStorage.getItem("TextCove-theme") === "night" || localStorage.getItem("SimpleJot-theme") === "night") {
      document.documentElement.classList.add("night");
    }
  } catch (err) {}
  var refreshing = false;
  var hadController = ("serviceWorker" in navigator) && !!navigator.serviceWorker.controller;
  var isHttp = window.location.protocol === "http:" || window.location.protocol === "https:";
  var checkInterval = 60000;
  var watchedReg = null;
  function reloadOnce() {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  }
  function sendSkipWaiting(worker) {
    try {
      if (worker) worker.postMessage({ type: "SKIP_WAITING" });
    } catch (err) {}
  }
  function trackWorker(worker) {
    if (!worker) return;
    if (worker.state === "installed" && navigator.serviceWorker.controller) {
      sendSkipWaiting(worker);
      return;
    }
    worker.addEventListener("statechange", function() {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        sendSkipWaiting(worker);
      }
    });
  }
  function watchForUpdate(reg) {
    if (!reg || reg === watchedReg) return;
    watchedReg = reg;
    if (reg.waiting && navigator.serviceWorker.controller) {
      sendSkipWaiting(reg.waiting);
    }
    if (reg.installing) {
      trackWorker(reg.installing);
    }
    reg.addEventListener("updatefound", function() {
      trackWorker(reg.installing);
      if (reg.waiting && navigator.serviceWorker.controller) {
        sendSkipWaiting(reg.waiting);
      }
    });
  }
  function checkForUpdate() {
    if (!("serviceWorker" in navigator)) return;
    if (navigator.onLine === false) return;
    navigator.serviceWorker.getRegistration().then(function(reg) {
      if (!reg) return;
      watchForUpdate(reg);
      reg.update().then(function() {
        if (reg.waiting && navigator.serviceWorker.controller) {
          sendSkipWaiting(reg.waiting);
        }
      }).catch(function() {});
    }).catch(function() {});
  }
  if ("serviceWorker" in navigator && isHttp) {
    window.addEventListener("load", function() {
      navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(function(reg) {
        watchForUpdate(reg);
        if (navigator.onLine !== false) {
          reg.update().catch(function() {});
        }
        if (reg.waiting && navigator.serviceWorker.controller) {
          sendSkipWaiting(reg.waiting);
        }
      }).catch(function() {});
    });
    window.addEventListener("online", checkForUpdate);
    window.addEventListener("focus", checkForUpdate);
    window.addEventListener("pageshow", checkForUpdate);
    document.addEventListener("visibilitychange", function() {
      if (!document.hidden) checkForUpdate();
    });
    setInterval(checkForUpdate, checkInterval);
    navigator.serviceWorker.addEventListener("controllerchange", function() {
      if (!hadController) {
        hadController = true;
        return;
      }
      reloadOnce();
    });
  }
  function updateNetStatus() {
    var el = document.getElementById("netStatus");
    if (!el) return;
    el.classList.toggle("is-offline", !navigator.onLine);
  }
  window.addEventListener("online", updateNetStatus);
  window.addEventListener("offline", updateNetStatus);
  updateNetStatus();
  function syncNotesBtn() {
    var btn = document.getElementById("notes");
    var menu = document.getElementById("notesMenu");
    if (!btn || !menu) return;
    btn.setAttribute("aria-expanded", menu.classList.contains("notes-menu--open") ? "true" : "false");
  }
  var notesShortcut = document.getElementById("notes");
  if (notesShortcut) {
    notesShortcut.addEventListener("click", function() { setTimeout(syncNotesBtn, 0); });
  }
  var settingsShortcut = document.getElementById("settings");
  if (settingsShortcut) {
    settingsShortcut.addEventListener("click", function() {
      var btn = document.getElementById("settings");
      var menu = document.getElementById("setMenu");
      if (!btn || !menu) return;
      btn.setAttribute("aria-expanded", menu.classList.contains("settings-menu--open") ? "true" : "false");
    });
  }
  try {
    var host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
      var reloadSource = new EventSource("/__textcove_reload");
      reloadSource.onmessage = function(e) {
        if (e.data === "reload") window.location.reload();
      };
    }
  } catch (err) {}
})();
