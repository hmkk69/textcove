"use strict";
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".btn-group button, footer button, section button").forEach(function(button) {
    button.addEventListener("click", function(e) {
      var rect = button.getBoundingClientRect();
      var x = (e.clientX || rect.left + rect.width / 2) - rect.left;
      var y = (e.clientY || rect.top + rect.height / 2) - rect.top;
      button.style.setProperty("--ripple-x", x + "px");
      button.style.setProperty("--ripple-y", y + "px");
      button.classList.remove("ripple");
      void button.offsetWidth;
      button.classList.add("ripple");
      setTimeout(function() { button.classList.remove("ripple"); }, 450);
    });
  });

  const title = document.getElementById("fileName");
  const content = document.getElementById("fileContent");
  const start = document.getElementById("start");
  const home = document.getElementById("homepage");
  const save = document.getElementById("save");
  const clear = document.getElementById("clear");
  const settings = document.getElementById("settings");
  const setMenu = document.getElementById("setMenu");
  const notesBtn = document.getElementById("notes");
  const notesMenu = document.getElementById("notesMenu");
  const tagInput = document.getElementById("tagInput");
  const tagChips = document.getElementById("tagChips");
  const tagSuggestions = document.getElementById("tagSuggestions");
  const tagList = document.getElementById("tagList");
  const tagMenuNote = document.getElementById("tagMenuNote");
  const tagFilter = document.getElementById("tagFilter");
  let suggestIndex = -1;
  const noteList = document.getElementById("noteList");
  const newNote = document.getElementById("newNote");
  const searchInput = document.getElementById("noteSearch");
  const sortSelect = document.getElementById("noteSort");
  const fs = document.getElementById("fs");
  const lh = document.getElementById("lh");
  const lw = document.getElementById("lw");
  const fontPick = document.getElementById("fontPick");
  const theme = document.getElementById("theme");
  const themeIcon = document.getElementById("themeIcon");
  const info = document.getElementById("info");
  const chars = document.getElementById("charCounter");
  const words = document.getElementById("wordCounter");
  const saveStatus = document.getElementById("saveStatus");
  const storeStatus = document.getElementById("storeStatus");
  const trashToggle = document.getElementById("trashToggle");
  const trashCount = document.getElementById("trashCount");
  const trashList = document.getElementById("trashList");
  const trashEmpty = document.getElementById("trashEmpty");
  const exportBtn = document.getElementById("exportData");
  const importBtn = document.getElementById("importData");
  const fileInput = document.getElementById("fileInput");
  const previewBtn = document.getElementById("previewToggle");
  const preview = document.getElementById("preview");
  const previewBody = document.getElementById("previewBody");
  const printTitle = document.getElementById("printTitle");
  const copyBtn = document.getElementById("copyNote");
  const resetBtn = document.getElementById("resetSettings");
  const dialog = document.getElementById("appDialog");
  const dialogMessage = document.getElementById("dialogMessage");
  const dialogInput = document.getElementById("dialogInput");
  const dialogOk = document.getElementById("dialogOk");
  const dialogCancel = document.getElementById("dialogCancel");
  const installTip = document.getElementById("installTip");

  let deferredInstall = null;

  function isInstalledMode() {
    try {
      if (window.matchMedia && (window.matchMedia("(display-mode: standalone)").matches || window.matchMedia("(display-mode: window-controls-overlay)").matches)) return true;
    } catch (err) {}
    try {
      if (window.navigator.standalone === true) return true;
    } catch (err) {}
    return false;
  }

  function syncInstallUI() {
    if (!installTip) return;
    installTip.hidden = isInstalledMode();
  }

  function installInstructions() {
    try {
      if (/iphone|ipad|ipod/i.test(window.navigator.userAgent || "")) return "To install on iPhone or iPad: tap Share, then Add to Home Screen.";
    } catch (err) {}
    return "To install: open the browser menu, then choose Install TextCove or Save and share > Install. On iPhone use Share > Add to Home Screen.";
  }

  function requestInstall() {
    if (deferredInstall) {
      try {
        deferredInstall.prompt();
        if (deferredInstall.userChoice) {
          deferredInstall.userChoice.then(function() {
            deferredInstall = null;
            syncInstallUI();
          }).catch(function() {
            deferredInstall = null;
          });
        } else {
          deferredInstall = null;
        }
      } catch (err) {
        deferredInstall = null;
      }
      return;
    }
    showAlert(installInstructions());
  }

  window.addEventListener("beforeinstallprompt", function(e) {
    if (!installTip) return;
    e.preventDefault();
    deferredInstall = e;
    syncInstallUI();
  });

  window.addEventListener("appinstalled", function() {
    deferredInstall = null;
    syncInstallUI();
  });

  if (installTip) installTip.addEventListener("click", requestInstall);

  syncInstallUI();

  if ("launchQueue" in window && window.launchQueue && typeof window.launchQueue.setConsumer === "function") {
    try {
      window.launchQueue.setConsumer(function(params) {
        if (!params || !params.files || !params.files.length) return;
        params.files.forEach(function(handle) {
          const done = function(file) {
            if (file) handleDroppedFile(file);
          };
          if (handle && typeof handle.getFile === "function") {
            handle.getFile().then(done).catch(function() {});
          } else {
            done(handle);
          }
        });
      });
    } catch (err) {}
  }

  let dialogResolve = null;
  let lastFocus = null;

  function restoreFocus() {
    try {
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    } catch (err) {}
    lastFocus = null;
  }

  function finishDialog(value) {
    if (dialog.open) dialog.close();
    const resolve = dialogResolve;
    dialogResolve = null;
    restoreFocus();
    if (resolve) resolve(value);
  }

  function openDialog(mode, message, options) {
    const opts = options || {};
    return new Promise(function(resolve) {
      try { lastFocus = document.activeElement; } catch (err) { lastFocus = null; }
      dialogResolve = resolve;
      dialogMessage.textContent = message;
      dialogOk.textContent = opts.ok || "OK";
      dialogCancel.textContent = opts.cancel || "Cancel";
      dialog.setAttribute("data-mode", mode);
      if (mode === "prompt") {
        dialogInput.style.display = "";
        dialogInput.value = opts.value || "";
        dialogCancel.style.display = "";
      } else if (mode === "confirm") {
        dialogInput.style.display = "none";
        dialogCancel.style.display = "";
      } else {
        dialogInput.style.display = "none";
        dialogCancel.style.display = "none";
      }
      if (!dialog.open) dialog.showModal();
      if (mode === "prompt") {
        dialogInput.focus();
        dialogInput.select();
      } else {
        dialogOk.focus();
      }
    });
  }

  function showAlert(message) {
    return openDialog("alert", message, { ok: "OK" });
  }

  function showConfirm(message) {
    return openDialog("confirm", message, { ok: "YES", cancel: "NO" });
  }

  function showPrompt(message, defaultValue, okLabel) {
    return openDialog("prompt", message, { value: defaultValue || "", ok: okLabel || "Save", cancel: "Cancel" });
  }

  dialogOk.addEventListener("click", function(e) {
    e.preventDefault();
    const mode = dialog.getAttribute("data-mode");
    if (mode === "prompt") finishDialog(dialogInput.value);
    else if (mode === "confirm") finishDialog(true);
    else finishDialog(undefined);
  });

  dialogCancel.addEventListener("click", function(e) {
    e.preventDefault();
    const mode = dialog.getAttribute("data-mode");
    finishDialog(mode === "prompt" ? null : false);
  });

  dialog.addEventListener("cancel", function() {
    const mode = dialog.getAttribute("data-mode");
    const pending = dialogResolve;
    dialogResolve = null;
    restoreFocus();
    if (!pending) return;
    if (mode === "prompt") pending(null);
    else if (mode === "confirm") pending(false);
    else pending(undefined);
  });

  dialogInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      dialogOk.click();
    }
  });

  dialog.addEventListener("keydown", function(e) {
    if (e.key !== "Tab") return;
    const items = [dialogInput, dialogOk, dialogCancel].filter(function(el) {
      return el && el.style.display !== "none" && !el.disabled;
    });
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function() { URL.revokeObjectURL(url); }, 4000);
  }

  function escapeHtml(value) {
    return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function countText(value) {
    const text = String(value || "");
    const trimmed = text.trim();
    let wordCount = 0;
    if (trimmed !== "") {
      const matches = trimmed.replace(/['";:,.?¿\-!¡]+/g, "").match(/\S+/g);
      wordCount = matches ? matches.length : 0;
    }
    return { words: wordCount, all: Array.from(text).length };
  }

  function updateCounters() {
    if (content.value.length > loadSafeLimit) {
      chars.textContent = content.value.length + " chars";
      words.textContent = "too large to count";
      return;
    }
    const counter = countText(content.value);
    words.textContent = counter.words + " words";
    chars.textContent = counter.all + " chars";
  }

  const mem = {};
  function safeGet(k) { try { const v = localStorage.getItem(k); if (v !== null) return v; } catch (err) {} return mem[k] !== undefined ? mem[k] : null; }
  function safeSet(k, v) { v = String(v); mem[k] = v; try { localStorage.setItem(k, v); return true; } catch (err) { return false; } }
  function safeRemove(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (err) {} }

  function isQuotaError(err) {
    return !!err && (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014);
  }

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (err) {
      return "";
    }
  }
  function backupStamp() {
    const d = new Date();
    const pad = function(n) { return String(n).padStart(2, "0"); };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  }

  function setStatus(state, text) {
    saveStatus.dataset.state = state;
    saveStatus.textContent = text;
  }

  function markSaving() {
    setStatus("saving", "Saving...");
  }

  function markSaved() {
    setStatus("saved", "Saved at " + formatTime(Date.now()));
  }

  function markError(text) {
    setStatus("error", text);
  }

  function hasStorage() {
    const test = "test";
    try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (err) {
      return false;
    }
  }

  const notesPrefix = "TextCove-note:";
  const recoveryPrefix = "TextCove-recovery:";
  const noteExportVersion = "1.0";
  const loadSafeLimit = 1024 * 1024;
  const defaultNoteBase = "New note";
  const pinKey = "TextCove-pins";
  const metaKey = "TextCove-meta";
  const tagListKey = "TextCove-tagList";
  const noteTagKey = "TextCove-tags";
  const trashKey = "TextCove-trash-v1";
  const backupKey = "TextCove-lastBackup";
  let currentNote = "";
  let shownNote = "";
  let dirty = false;
  const idbName = "TextCove";
  const idbStore = "notes";
  const saveDelay = 250;
  const recoveryThrottle = 1500;
  const mirrorLimit = 100000;
  const trashMax = 30;
  const trashDays = 30;
  const backupDays = 7;
  const maxLinePaddingEm = 12;
  const maxFileSize = 5 * 1024 * 1024;
  const maxTextLen = 1000000;
  const maxImportNotes = 200;
  const maxTags = 100;
  const maxTagLen = 24;
  let lastTrash = null;
  let deleteRunning = false;
  let _dbPromise = null;
  let namesCache = [];
  let saveTimer = null;
  let lastRecoveryWrite = 0;
  let listToken = 0;
  let listCache = { at: 0, data: null };
  let previewOpen = false;
  const legacyPrefix = "SimpleJot-";
  const legacyNotesPrefix = "SimpleJot-note:";
  const legacyRecoveryPrefix = "SimpleJot-recovery:";
  const legacyIdbName = "SimpleJot";
  const brandSingleKeys = ["pins", "meta", "tagList", "tags", "trash-v1", "lastBackup", "current", "settings", "settings-fs", "settings-lh", "settings-lw", "settings-font", "sort", "theme", "seen"];
  function migrateBrandKeys() {
    try {
      brandSingleKeys.forEach(function(suffix) {
        const oldK = legacyPrefix + suffix, newK = "TextCove-" + suffix;
        if (safeGet(newK) === null) {
          const v = safeGet(oldK);
          if (v !== null) safeSet(newK, v);
        }
        safeRemove(oldK);
      });
      [[legacyNotesPrefix, notesPrefix], [legacyRecoveryPrefix, recoveryPrefix]].forEach(function(pair) {
        const from = pair[0], to = pair[1];
        const pending = [];
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.indexOf(from) === 0) pending.push(k);
          }
        } catch (err) {}
        Object.keys(mem).forEach(function(k) {
          if (k.indexOf(from) === 0 && pending.indexOf(k) === -1) pending.push(k);
        });
        pending.forEach(function(k) {
          const name = k.slice(from.length);
          if (safeGet(to + name) === null) safeSet(to + name, safeGet(k) || "");
          safeRemove(k);
        });
      });
    } catch (err) {}
  }
  migrateBrandKeys();
  let pins = [];
  let meta = {};

  try {
    pins = JSON.parse(safeGet(pinKey) || "[]");
    if (!Array.isArray(pins)) pins = [];
  } catch (err) {
    pins = [];
  }

  try {
    meta = JSON.parse(safeGet(metaKey) || "{}");
    if (!meta || typeof meta !== "object") meta = {};
  } catch (err) {
    meta = {};
  }

  function savePins() {
    if (!safeSet(pinKey, JSON.stringify(pins))) markError("Save failed: storage is full");
  }

  function saveMeta() {
    safeSet(metaKey, JSON.stringify(meta));
  }

  function touchMeta(name) {
    if (!name || isReservedName(name)) return;
    meta[name] = Date.now();
    saveMeta();
  }

  let allTags = [];
  let noteTags = {};

  try {
    allTags = JSON.parse(safeGet(tagListKey) || "[]");
    if (!Array.isArray(allTags)) allTags = [];
  } catch (err) {
    allTags = [];
  }

  try {
    noteTags = JSON.parse(safeGet(noteTagKey) || "{}");
    if (!noteTags || typeof noteTags !== "object" || Array.isArray(noteTags)) noteTags = {};
  } catch (err) {
    noteTags = {};
  }

  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }

  function safeTagName(value) {
    return String(value === null || value === undefined ? "" : value).replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, maxTagLen);
  }

  allTags = allTags.map(safeTagName).filter(function(t) { return t !== ""; }).slice(0, maxTags);

  function saveTagStore() {
    safeSet(tagListKey, JSON.stringify(allTags.slice(0, maxTags)));
    safeSet(noteTagKey, JSON.stringify(noteTags));
  }

  function tagsFor(name) {
    if (!name || !hasOwn(noteTags, name)) return [];
    const list = noteTags[name];
    if (!Array.isArray(list)) return [];
    return list.map(safeTagName).filter(function(t) { return t !== ""; }).slice(0, maxTags);
  }

  function registerTag(tag) {
    const clean = safeTagName(tag);
    if (clean === "") return "";
    for (let i = 0; i < allTags.length; i++) {
      if (allTags[i].toLowerCase() === clean.toLowerCase()) return allTags[i];
    }
    if (allTags.length >= maxTags) return "";
    allTags.push(clean);
    return clean;
  }

  function setNoteTags(name, tags) {
    if (!name || isReservedName(name)) return;
    const clean = [];
    (tags || []).forEach(function(t) {
      const tag = registerTag(t);
      if (tag !== "" && clean.indexOf(tag) === -1) clean.push(tag);
    });
    if (clean.length) noteTags[name] = clean;
    else delete noteTags[name];
    saveTagStore();
  }

  function everyTag() {
    const seen = Object.create(null);
    const out = [];
    const push = function(t) {
      const clean = safeTagName(t);
      if (clean === "" || seen[clean.toLowerCase()]) return;
      seen[clean.toLowerCase()] = true;
      out.push(clean);
    };
    allTags.forEach(push);
    Object.keys(noteTags).forEach(function(n) {
      if (Array.isArray(noteTags[n])) noteTags[n].forEach(push);
    });
    return out.sort(function(a, b) { return a.localeCompare(b); });
  }

  function moveNoteTags(oldName, newName) {
    if (!oldName || !newName || oldName === newName) return;
    if (!hasOwn(noteTags, oldName)) return;
    noteTags[newName] = noteTags[oldName];
    delete noteTags[oldName];
    saveTagStore();
  }

  function removeTagEverywhere(tag) {
    const lower = safeTagName(tag).toLowerCase();
    if (lower === "") return;
    allTags = allTags.filter(function(t) { return t.toLowerCase() !== lower; });
    Object.keys(noteTags).forEach(function(n) {
      const kept = (Array.isArray(noteTags[n]) ? noteTags[n] : []).filter(function(t) { return safeTagName(t).toLowerCase() !== lower; });
      if (kept.length) noteTags[n] = kept;
      else delete noteTags[n];
    });
    saveTagStore();
  }

  function mirrorPut(n, v) { v = v || ""; if (!n) return; if (v.length > mirrorLimit) { safeRemove(notesPrefix + n); return; } safeSet(notesPrefix + n, v); }
  function mirrorDel(n) { safeRemove(notesPrefix + n); }
  function prefixScan(p) { const o = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(p) === 0) o[k.slice(p.length)] = localStorage.getItem(k) || ""; } } catch (err) {} Object.keys(mem).forEach(function(k) { if (k.indexOf(p) === 0) { const n = k.slice(p.length); if (!(n in o)) o[n] = mem[k]; } }); return o; }
  function mirrorAll() { return prefixScan(notesPrefix); }
  function recoveryAll() { return prefixScan(recoveryPrefix); }
  function getTrash() { try { const t = JSON.parse(safeGet(trashKey) || "[]"); return Array.isArray(t) ? t : []; } catch (err) { return []; } }
  function setTrash(t) { safeSet(trashKey, JSON.stringify((t || []).slice(0, trashMax))); try { trashCount.textContent = String(getTrash().length); } catch (err) {} renderTrash(); }
  function pushTrash(o) { const t = getTrash(); const rec = { name: o.name, value: o.value, pin: !!o.pin, updated: o.updated || 0, tags: tagsFor(o.name), deletedAt: Date.now() }; t.unshift(rec); setTrash(t.filter(function(x) { return Date.now() - (x.deletedAt || 0) < trashDays * 864e5; }).slice(0, trashMax)); lastTrash = rec; }
  function pruneTrash() { setTrash(getTrash().filter(function(x) { return Date.now() - (x.deletedAt || 0) < trashDays * 864e5; })); }
  function markBackup() { safeSet(backupKey, String(Date.now())); }
  function needBackup() { const t = parseInt(safeGet(backupKey) || "0", 10) || 0; return Date.now() - t > backupDays * 864e5; }
  function opfsBackup(n) { try { if (!navigator.storage || !navigator.storage.getDirectory) return Promise.resolve(); return navigator.storage.getDirectory().then(function(d) { return d.getFileHandle("textcove-backup.json", { create: true }); }).then(function(h) { return h.createWritable().then(function(w) { return w.write(JSON.stringify({ version: noteExportVersion, exportedAt: new Date().toISOString(), notes: n, tags: allTags, noteTags: noteTags })).then(function() { return w.close(); }); }).catch(function() {}); }).catch(function() {}); } catch (err) { return Promise.resolve(); } }
  function refreshStoreStatus() { try { if (!navigator.storage || !navigator.storage.estimate) { try { storeStatus.textContent = "Saved on this device"; } catch (err) {} return; } navigator.storage.estimate().then(function(e) { const q = e.quota || 0, l = q - (e.usage || 0); const s = q ? (l > 1073741824 ? (l / 1073741824).toFixed(1) + "GB" : Math.max(1, Math.round(l / 1048576)) + "MB") : ""; try { storeStatus.textContent = s ? "Saved on this device, " + s + " free" : "Saved on this device"; } catch (err) {} if (q && l < 104857600) markError("Running low on space, export soon"); }).catch(function() {}); } catch (err) {} }
  function initPersist() { try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function() {}); } catch (err) {} refreshStoreStatus(); }
  function stashPrev() { const pn = currentNote, pv = content.value; if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; } if (!pn || shownNote !== pn) return Promise.resolve(); return idbPut(pn, pv).then(function() { clearRecovery(pn); }).catch(function() { safeSet(recoveryPrefix + pn, pv); mirrorPut(pn, pv); }); }
  function rescueMirrors() { const m = mirrorAll(), ks = Object.keys(m).slice(0, maxImportNotes); if (!ks.length) return Promise.resolve(0); let c = Promise.resolve(), n = 0; ks.forEach(function(k) { c = c.then(function() { return idbPut(sanitizeFileName(k) || generateNoteName(defaultNoteBase), String(m[k] || "").slice(0, maxTextLen)).then(function() { n++; }).catch(function() {}); }); }); return c.then(function() { return refreshNames().then(function() { return n; }); }); }

  let useIdb = typeof indexedDB !== "undefined";

  function lsKeys() { const s = {}; Object.keys(prefixScan(notesPrefix)).forEach(function(k) { s[k] = 1; }); return Object.keys(s); }

  function lsGetItem(name) { const v = safeGet(notesPrefix + name); return v === null ? null : v; }

  function lsPutItem(name, value) { const ok = safeSet(notesPrefix + name, value || ""); if (!ok) return Promise.reject({ name: "QuotaExceededError" }); if (namesCache.indexOf(name) === -1) namesCache.push(name); touchMeta(name); return Promise.resolve(); }

  function lsDelItem(name) { safeRemove(notesPrefix + name); dropFromCaches(name); return Promise.resolve(); }

  function dropFromCaches(name) {
    const i = namesCache.indexOf(name);
    if (i !== -1) namesCache.splice(i, 1);
    const pi = pins.indexOf(name);
    if (pi !== -1) {
      pins.splice(pi, 1);
      savePins();
    }
    if (meta[name] !== undefined) {
      delete meta[name];
      saveMeta();
    }
    if (hasOwn(noteTags, name)) {
      delete noteTags[name];
      saveTagStore();
    }
  }

  function idbOpen() {
    if (_dbPromise) return _dbPromise;
    _dbPromise = new Promise(function(res, rej) {
      try {
        const req = indexedDB.open(idbName, 1);
        req.onupgradeneeded = function() {
          if (!req.result.objectStoreNames.contains(idbStore)) {
            req.result.createObjectStore(idbStore);
          }
        };
        req.onsuccess = function() { res(req.result); };
        req.onerror = function() { rej(req.error); };
        req.onblocked = function() {};
      } catch (err) { rej(err); }
    });
    return _dbPromise;
  }

  function idbTx(mode, fn) {
    return idbOpen().then(function(db) {
      return new Promise(function(res, rej) {
        let tx;
        try { tx = db.transaction(idbStore, mode); }
        catch (err) { rej(err); return; }
        let out;
        try { out = fn(tx.objectStore(idbStore)); }
        catch (err) { rej(err); return; }
        tx.oncomplete = function() { res(out && out.result !== undefined ? out.result : out); };
        tx.onerror = function() { rej(tx.error); };
        tx.onabort = function() { rej(tx.error || new Error("IDB aborted")); };
      });
    });
  }

  function idbGet(name) {
    if (!useIdb) return Promise.resolve(lsGetItem(name));
    return idbTx("readonly", function(s) { return s.get(name); }).then(function(v) {
      if (v === undefined || v === null) return null;
      if (typeof v === "object" && v !== null && "c" in v) return v.c;
      return String(v);
    }).catch(function(err) {
      if (isQuotaError(err)) throw err;
      useIdb = false;
      return lsGetItem(name);
    });
  }

  function invalidateListCache() {
    listCache = { at: 0, data: null };
  }

  function idbPut(name, value) {
    mirrorPut(name, value);
    invalidateListCache();
    if (!useIdb) return lsPutItem(name, value);
    const rec = { c: value || "", u: Date.now() };
    return idbTx("readwrite", function(s) { return s.put(rec, name); }).then(function() {
      if (namesCache.indexOf(name) === -1) namesCache.push(name);
      touchMeta(name);
    }).catch(function(err) {
      if (isQuotaError(err)) throw err;
      useIdb = false;
      return lsPutItem(name, value);
    });
  }

  function idbDel(name) {
    mirrorDel(name);
    invalidateListCache();
    if (!useIdb) return lsDelItem(name);
    return idbTx("readwrite", function(s) { return s.delete(name); }).then(function() {
      dropFromCaches(name);
    }).catch(function(err) {
      if (isQuotaError(err)) throw err;
      useIdb = false;
      return lsDelItem(name);
    });
  }

  function migrateIdbFromLegacy() {
    return new Promise(function(resolve) {
      try {
        if (typeof indexedDB === "undefined") { resolve(); return; }
        let fresh = false;
        const openReq = indexedDB.open(legacyIdbName, 1);
        openReq.onupgradeneeded = function() { fresh = true; };
        openReq.onsuccess = function() {
          const db = openReq.result;
          const done = function() { try { db.close(); } catch (err) {} resolve(); };
          if (fresh) {
            done();
            try { indexedDB.deleteDatabase(legacyIdbName); } catch (err) {}
            return;
          }
          let names = [];
          try { names = Array.prototype.slice.call(db.objectStoreNames); } catch (err) {}
          if (names.indexOf(idbStore) === -1) { done(); return; }
          let entries = [];
          let finished = false;
          const finish = function() {
            if (finished) return;
            finished = true;
            let chain = Promise.resolve();
            entries.forEach(function(e) {
              chain = chain.then(function() {
                const v = e.v;
                let text = "";
                if (typeof v === "object" && v !== null && "c" in v) text = v.c;
                else if (v !== undefined && v !== null) text = String(v);
                return idbGet(String(e.k)).then(function(existing) {
                  if (existing === null || existing === undefined || existing === "") {
                    return idbPut(String(e.k), text).catch(function() {});
                  }
                }).catch(function() {});
              });
            });
            chain.then(function() {
              done();
              try { indexedDB.deleteDatabase(legacyIdbName); } catch (err) {}
            });
          };
          try {
            const tx = db.transaction(idbStore, "readonly");
            const store = tx.objectStore(idbStore);
            const cursorReq = store.openCursor();
            cursorReq.onsuccess = function() {
              const cursor = cursorReq.result;
              if (cursor) { entries.push({ k: cursor.key, v: cursor.value }); cursor.continue(); return; }
              finish();
            };
            cursorReq.onerror = function() { finish(); };
            tx.onabort = function() { finish(); };
            tx.onerror = function() { finish(); };
          } catch (err) { done(); }
        };
        openReq.onerror = function() { resolve(); };
        openReq.onblocked = function() { resolve(); };
      } catch (err) { resolve(); }
    });
  }

  function idbGetAllKeys() {
    if (!useIdb) return Promise.resolve(lsKeys());
    return idbOpen().then(function(db) {
      return new Promise(function(res, rej) {
        try {
          const tx = db.transaction(idbStore, "readonly");
          const store = tx.objectStore(idbStore);
          if (store.getAllKeys) {
            const rq = store.getAllKeys();
            rq.onsuccess = function() { res(rq.result || []); };
            rq.onerror = function() { rej(rq.error); };
          } else {
            const keys = [];
            const cur = store.openCursor();
            cur.onsuccess = function() {
              const c = cur.result;
              if (c) { keys.push(c.key); c.continue(); }
              else res(keys);
            };
            cur.onerror = function() { rej(cur.error); };
          }
        } catch (err) { rej(err); }
      });
    }).catch(function(err) {
      if (isQuotaError(err)) throw err;
      useIdb = false;
      return lsKeys();
    });
  }

  function idbGetAll() {
    if (!useIdb) {
      const out = {};
      lsKeys().forEach(function(k) { out[k] = lsGetItem(k) || ""; });
      return Promise.resolve(out);
    }
    return idbOpen().then(function(db) {
      return new Promise(function(res, rej) {
        try {
          const tx = db.transaction(idbStore, "readonly");
          const store = tx.objectStore(idbStore);
          const out = {};
          if (store.getAll && store.getAllKeys) {
            const kr = store.getAllKeys();
            const vr = store.getAll();
            let keys = null;
            let vals = null;
            const done = function() {
              if (keys !== null && vals !== null) {
                for (let i = 0; i < keys.length; i++) {
                  const v = vals[i];
                  out[keys[i]] = (v && typeof v === "object" && "c" in v) ? v.c : String(v === undefined || v === null ? "" : v);
                }
                res(out);
              }
            };
            kr.onsuccess = function() { keys = kr.result || []; done(); };
            kr.onerror = function() { rej(kr.error); };
            vr.onsuccess = function() { vals = vr.result || []; done(); };
            vr.onerror = function() { rej(vr.error); };
          } else {
            const cur = store.openCursor();
            cur.onsuccess = function() {
              const c = cur.result;
              if (c) {
                const v = c.value;
                out[c.key] = (v && typeof v === "object" && "c" in v) ? v.c : String(v === undefined || v === null ? "" : v);
                c.continue();
              } else res(out);
            };
            cur.onerror = function() { rej(cur.error); };
          }
        } catch (err) { rej(err); }
      });
    }).catch(function(err) {
      if (isQuotaError(err)) throw err;
      useIdb = false;
      const out = {};
      lsKeys().forEach(function(k) { out[k] = lsGetItem(k) || ""; });
      return out;
    });
  }

  function refreshNames() {
    return idbGetAllKeys().then(function(keys) {
      namesCache = (keys || []).slice().sort();
      return namesCache;
    });
  }

  function getNoteNames() {
    return namesCache.slice().sort();
  }

  function writeRecoverySync() {
    if (!currentNote) return true;
    mirrorPut(currentNote, content.value);
    return safeSet(recoveryPrefix + currentNote, content.value);
  }

  function scheduleRecovery() {
    if (Date.now() - lastRecoveryWrite > recoveryThrottle) {
      if (writeRecoverySync()) lastRecoveryWrite = Date.now();
    }
  }

  function clearRecovery(name) {
    safeRemove(recoveryPrefix + (name || currentNote));
  }

  function reconcileRecovery() {
    const recs = recoveryAll();
    const keys = Object.keys(recs).slice(0, 50);
    let chain = Promise.resolve();
    keys.forEach(function(k) {
      const saved = String(recs[k] || "");
      if (!saved) return;
      chain = chain.then(function() {
        return idbGet(k).then(function(cur) {
          const current = String(cur === null || cur === undefined ? "" : cur);
          if (current !== saved) {
            return idbPut(k, saved.slice(0, maxTextLen)).catch(function() {});
          }
        }).catch(function() {});
      });
    });
    return chain;
  }

  function flushSave() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    if (!currentNote) return Promise.resolve();
    const n = currentNote, val = content.value;
    return idbPut(n, val).then(function() {
      if (currentNote === n) { dirty = false; shownNote = n; }
      clearRecovery(n);
      markSaved();
    }).catch(function(err) {
      writeRecoverySync();
      if (isQuotaError(err)) {
        markError("Save failed: storage is full");
        showAlert("Storage is full, so this note could not be saved. Free some space or export your notes.");
      } else {
        markError("Save failed");
      }
    });
  }

  function requestSave() {
    dirty = true; shownNote = currentNote; markSaving();
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, saveDelay);
    scheduleRecovery();
  }

  function generateNoteName(baseName) {
    const names = getNoteNames();
    let candidate = baseName;
    let counter = 0;
    while (names.indexOf(candidate) !== -1) {
      counter++;
      candidate = baseName + " (" + counter + ")";
    }
    return candidate;
  }

  function reserveName(baseName) {
    const name = generateNoteName(baseName);
    namesCache.push(name);
    return name;
  }

  function ensureCurrentNote() {
    if (currentNote) return Promise.resolve(currentNote);
    const autoName = reserveName(defaultNoteBase);
    currentNote = autoName; shownNote = autoName; dirty = false;
    safeSet("TextCove-current", autoName);
    title.value = autoName;
    return idbPut(autoName, content.value).then(function() {
      markSaved();
      renderNoteList();
      return autoName;
    }).catch(function(err) {
      const ri = namesCache.indexOf(autoName);
      if (ri !== -1) namesCache.splice(ri, 1);
      if (isQuotaError(err)) markError("Save failed: storage is full");
      return autoName;
    });
  }

  let openSeq = 0;
  let oversizeWarnedName = "";

  function openNote(name) {
    const mySeq = ++openSeq;
    const sp = stashPrev();
    currentNote = name; shownNote = ""; dirty = false;
    safeSet("TextCove-current", name);
    title.value = name;
    if (previewOpen && !isSplitView()) togglePreview(false);
    const rec = safeGet(recoveryPrefix + name);
    const load = function() {
      if (rec !== null && rec !== undefined) {
        if (String(rec).length > loadSafeLimit) { handleOversizedNote(name, String(rec)); return Promise.resolve(name); }
        content.value = rec; shownNote = name;
        updateCounters();
        if (!preview.hidden) refreshPreview();
        idbPut(name, rec).then(function() { clearRecovery(name); }).catch(function() {});
        markSaved();
        renderNoteList();
        return Promise.resolve(name);
      }
      return idbGet(name).then(function(v) {
        if (mySeq !== openSeq || currentNote !== name) return;
        const text = (v === null || v === undefined) ? "" : String(v);
        if (text.length > loadSafeLimit) { handleOversizedNote(name, text); return; }
        content.value = text; shownNote = name;
        updateCounters();
        if (!preview.hidden) refreshPreview();
        renderNoteList();
      }).catch(function() {
        if (mySeq !== openSeq || currentNote !== name) return;
        content.value = ""; shownNote = name;
        updateCounters();
        if (!preview.hidden) refreshPreview();
      });
    };
    return sp.then(load).catch(load);
  }

  function formatSize(chars) {
    if (chars >= 1048576) return (chars / 1048576).toFixed(1) + " MB";
    if (chars >= 1024) return Math.round(chars / 1024) + " KB";
    return chars + " chars";
  }

  function openFallbackNote(exclude) {
    const others = getNoteNames().filter(function(n) { return n !== exclude; });
    if (others.length) return openNote(sortedNames(others)[0]);
    return createNewNote();
  }

  function openNextAfterDelete(deletedName, hasUndo) {
    currentNote = ""; shownNote = ""; dirty = false;
    safeRemove("TextCove-current");
    return Promise.resolve(openFallbackNote(deletedName)).catch(function() {}).then(function() {
      if (hasUndo === false) setStatus("saved", "Deleted \u201c" + deletedName + "\u201d");
      else setStatus("saved", "Deleted \u201c" + deletedName + "\u201d, click here to undo");
      renderNoteList();
    }).then(function() {
      deleteRunning = false;
    });
  }

  function handleOversizedNote(name, value) {
    const size = formatSize(String(value).length);
    setStatus("error", "Note too large to open");
    showConfirm("Note \u201c" + name + "\u201d is too large (" + size + ") for the app to open safely. Loading it may freeze this page. Please download a backup copy first.", { ok: "Download backup", cancel: "Later" }).then(function(wantsDownload) {
      if (!wantsDownload) { openFallbackNote(name); return; }
      try {
        downloadBlob(new Blob([value], { type: "text/plain;charset=utf-8" }), sanitizeFileName(name) + ".txt");
        setStatus("saved", "Backup downloaded");
      } catch (err) {
        showAlert("Backup download failed. The note was kept. Please try again.");
        openFallbackNote(name);
        return;
      }
      showConfirm("Backup downloaded. This note (" + size + ") will now be cleared entirely so the app can load again. Only continue if you have saved the downloaded file.", { ok: "Clear this note", cancel: "Keep note" }).then(function(yes) {
        if (!yes) { openFallbackNote(name); return; }
        if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
        idbDel(name).then(function() {
          clearRecovery(name);
          setStatus("saved", "Cleared oversized note");
          showAlert("Note \u201c" + name + "\u201d was cleared. Your downloaded backup keeps its content.");
          openFallbackNote(name);
        }).catch(function() {
          showAlert("Could not clear the note. Please try again.");
          openFallbackNote(name);
        });
      });
    });
  }

  function formatDate(ts) {
    if (!ts) return "";
    try {
      return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    } catch (err) {
      return "";
    }
  }

  function sortedNames(names) {
    const mode = sortSelect ? sortSelect.value : "updated";
    const pinned = [];
    const rest = [];
    names.forEach(function(n) {
      if (pins.indexOf(n) !== -1) pinned.push(n);
      else rest.push(n);
    });
    const byName = function(a, b) { return a.localeCompare(b); };
    const byUpdated = function(a, b) { return (meta[b] || 0) - (meta[a] || 0) || byName(a, b); };
    const cmp = mode === "name" ? byName : byUpdated;
    pinned.sort(cmp);
    rest.sort(cmp);
    return pinned.concat(rest);
  }

  function snippetFor(text) {
    const head = String(text === null || text === undefined ? "" : text).slice(0, 200);
    const firstLine = head.split("\n")[0].trim().slice(0, 60);
    return firstLine === "" ? "Empty note" : firstLine;
  }

  function renderTagOptions() {
    if (!tagFilter) return;
    const current = tagFilter.value;
    const tags = everyTag();
    tagFilter.innerHTML = "";
    const any = document.createElement("option");
    any.value = "";
    any.textContent = "All tags";
    tagFilter.appendChild(any);
    tags.forEach(function(tag) {
      const opt = document.createElement("option");
      opt.value = tag;
      const count = Object.keys(noteTags).filter(function(n) { return tagsFor(n).indexOf(tag) !== -1; }).length;
      opt.textContent = tag + " (" + count + ")";
      tagFilter.appendChild(opt);
    });
    tagFilter.value = tags.indexOf(current) !== -1 ? current : "";
  }

  function renderTagChips() {
    if (!tagChips) return;
    try {
      if (tagMenuNote) tagMenuNote.textContent = "Tags for " + (currentNote || "New note");
      const mine = tagsFor(currentNote);
      tagChips.innerHTML = "";
      mine.forEach(function(tag) {
        const chip = document.createElement("span");
        chip.className = "tag-chip";
        const label = document.createElement("span");
        label.className = "tag-chip-label";
        label.textContent = tag;
        const rm = document.createElement("button");
        rm.className = "tag-chip-remove";
        rm.setAttribute("data-tag", tag);
        rm.setAttribute("aria-label", "Remove tag " + tag);
        rm.textContent = "\u00d7";
        rm.addEventListener("click", function() {
          toggleCurrentTag(this.getAttribute("data-tag"));
        });
        chip.appendChild(label);
        chip.appendChild(rm);
        tagChips.appendChild(chip);
      });
    } catch (err) {}
  }

  function renderTagMenu() {
    if (!tagList) return;
    try {
      if (tagMenuNote) tagMenuNote.textContent = "Tags for " + (currentNote || "New note");
      const mine = tagsFor(currentNote);
      const tags = everyTag();
      tagList.innerHTML = "";
      if (!tags.length) {
        const empty = document.createElement("li");
        empty.className = "notes-empty";
        empty.textContent = "No tags yet. Type a name above to create one.";
        tagList.appendChild(empty);
        return;
      }
      tags.forEach(function(tag) {
        const li = document.createElement("li");
        const on = mine.indexOf(tag) !== -1;
        const toggle = document.createElement("button");
        toggle.className = "tag-toggle" + (on ? " is-on" : "");
        toggle.setAttribute("data-tag", tag);
        toggle.setAttribute("aria-pressed", on ? "true" : "false");
        toggle.setAttribute("aria-label", (on ? "Remove tag " : "Add tag ") + tag);
        toggle.textContent = (on ? "\u2713 " : "+ ") + tag;
        toggle.addEventListener("click", function() {
          toggleCurrentTag(this.getAttribute("data-tag"));
        });
        const remove = document.createElement("button");
        remove.className = "tag-remove";
        remove.setAttribute("data-tag", tag);
        remove.setAttribute("aria-label", "Delete tag " + tag);
        remove.dataset.tooltip = "Delete this tag from every note";
        remove.textContent = "\u00d7";
        remove.addEventListener("click", function() {
          deleteTagEverywhere(this.getAttribute("data-tag"));
        });
        li.appendChild(toggle);
        li.appendChild(remove);
        tagList.appendChild(li);
      });
    } catch (err) {}
  }

  function noteTagTarget() {
    if (currentNote) return Promise.resolve(currentNote);
    return ensureCurrentNote();
  }

  function toggleCurrentTag(tag) {
    const clean = safeTagName(tag);
    if (clean === "") return;
    noteTagTarget().then(function(name) {
      const list = tagsFor(name).slice();
      const i = list.indexOf(clean);
      if (i === -1) list.push(clean);
      else list.splice(i, 1);
      setNoteTags(name, list);
      refreshTagUI();
    }).catch(function() {});
  }

  function hideSuggestions() {
    if (!tagSuggestions) return;
    tagSuggestions.hidden = true;
    tagSuggestions.innerHTML = "";
    suggestIndex = -1;
  }

  function showSuggestions(query) {
    if (!tagSuggestions || !tagInput) return;
    const mine = tagsFor(currentNote);
    const all = everyTag();
    const q = query.toLowerCase();
    const matches = all.filter(function(t) {
      return t.toLowerCase().indexOf(q) !== -1 && mine.indexOf(t) === -1;
    }).slice(0, 8);
    tagSuggestions.innerHTML = "";
    suggestIndex = -1;
    if (!matches.length || q === "") {
      tagSuggestions.hidden = true;
      return;
    }
    matches.forEach(function(tag, idx) {
      const item = document.createElement("div");
      item.className = "tag-suggest-item";
      item.setAttribute("data-tag", tag);
      item.setAttribute("data-index", String(idx));
      item.textContent = tag;
      item.addEventListener("mousedown", function(e) {
        e.preventDefault();
        applySuggestedTag(this.getAttribute("data-tag"));
      });
      tagSuggestions.appendChild(item);
    });
    tagSuggestions.hidden = false;
  }

  function applySuggestedTag(tag) {
    noteTagTarget().then(function(name) {
      const list = tagsFor(name).slice();
      if (list.indexOf(tag) === -1) list.push(tag);
      setNoteTags(name, list);
      if (tagInput) tagInput.value = "";
      hideSuggestions();
      refreshTagUI();
    }).catch(function() {});
  }

  function addCurrentTag() {
    if (!tagInput) return;
    const typed = safeTagName(tagInput.value);
    if (typed === "") return;
    const existing = everyTag().filter(function(t) { return t.toLowerCase() === typed.toLowerCase(); })[0];
    const tag = registerTag(existing || typed);
    if (tag === "") {
      showAlert("Tag limit reached (" + maxTags + "). Delete a tag you no longer need and try again.");
      return;
    }
    tagInput.value = "";
    hideSuggestions();
    noteTagTarget().then(function(name) {
      const list = tagsFor(name).slice();
      if (list.indexOf(tag) === -1) list.push(tag);
      setNoteTags(name, list);
      refreshTagUI();
    }).catch(function() {});
  }

  function deleteTagEverywhere(tag) {
    const clean = safeTagName(tag);
    if (clean === "") return;
    const usage = Object.keys(noteTags).filter(function(n) { return tagsFor(n).indexOf(clean) !== -1; }).length;
    const label = usage === 1 ? "1 note" : usage + " notes";
    showConfirm("Delete the tag \u201c" + clean + "\u201d from " + label + "?", { ok: "YES", cancel: "NO" }).then(function(yes) {
      if (!yes) return;
      removeTagEverywhere(clean);
      renderTagOptions();
      refreshTagUI();
      setStatus("saved", "Deleted tag \u201c" + clean + "\u201d");
    });
  }

  function refreshTagUI() {
    renderTagChips();
    renderTagMenu();
    renderNoteList();
  }

  function renderNoteList() {
    renderTagOptions();
    renderTagMenu();
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const activeTag = tagFilter ? tagFilter.value : "";
    const myToken = ++listToken;
    const paint = function(all) {
      if (myToken !== listToken) return;
      noteList.innerHTML = "";
      let names = sortedNames(getNoteNames());
      if (activeTag !== "") {
        names = names.filter(function(n) {
          return tagsFor(n).indexOf(activeTag) !== -1;
        });
      }
      if (q !== "") {
        names = names.filter(function(n) {
          if (n.toLowerCase().indexOf(q) !== -1) return true;
          if (tagsFor(n).some(function(t) { return t.toLowerCase().indexOf(q) !== -1; })) return true;
          const body = (n === currentNote) ? content.value : (all[n] || "");
          if (String(body).length > loadSafeLimit) return false;
          const hay = String(body).length > 50000 ? String(body).slice(0, 50000) : String(body);
          return hay.toLowerCase().indexOf(q) !== -1;
        });
      }
      if (!names.length) {
        const empty = document.createElement("li");
        empty.className = "notes-empty";
        empty.textContent = q ? "No notes match your search." : (activeTag !== "" ? "No notes with this tag." : "No notes yet.");
        noteList.appendChild(empty);
        return;
      }
      names.forEach(function(name) {
        const li = document.createElement("li");
        li.className = "note-row" + (name === currentNote ? " note--current" : "");
        const main = document.createElement("button");
        main.className = "note-open";
        main.setAttribute("data-note", name);
        main.setAttribute("aria-label", "Open note " + name);
        const nameSpan = document.createElement("span");
        nameSpan.className = "note-name";
        nameSpan.textContent = name;
        const metaLine = document.createElement("span");
        metaLine.className = "note-meta";
        const snippetSpan = document.createElement("span");
        snippetSpan.className = "note-snippet";
        snippetSpan.textContent = snippetFor(name === currentNote ? content.value : (all[name] || ""));
        const dateSpan = document.createElement("span");
        dateSpan.className = "note-date";
        dateSpan.textContent = formatDate(meta[name]);
        metaLine.appendChild(snippetSpan);
        metaLine.appendChild(dateSpan);
        main.appendChild(nameSpan);
        main.appendChild(metaLine);
        main.addEventListener("click", function() {
          openNote(this.getAttribute("data-note"));
          notesMenu.classList.remove("notes-menu--open");
          notesBtn.classList.remove("notes-btn--active");
          notesBtn.focus();
        });
        const pinBtn = document.createElement("button");
        pinBtn.className = "note-pin" + (pins.indexOf(name) !== -1 ? " is-pinned" : "");
        pinBtn.dataset.tooltip = pins.indexOf(name) !== -1 ? "Unpin note" : "Pin note";
        pinBtn.setAttribute("aria-label", (pins.indexOf(name) !== -1 ? "Unpin note " : "Pin note ") + name);
        pinBtn.setAttribute("data-note", name);
        pinBtn.textContent = pins.indexOf(name) !== -1 ? "\u2605" : "\u2606";
        pinBtn.addEventListener("click", function() {
          const n = this.getAttribute("data-note");
          const i = pins.indexOf(n);
          if (i === -1) pins.push(n);
          else pins.splice(i, 1);
          savePins();
          renderNoteList();
        });
        const delBtn = document.createElement("button");
        delBtn.className = "note-delete";
        delBtn.dataset.tooltip = "Move to Trash, Shift-click to delete permanently";
        delBtn.setAttribute("aria-label", "Delete note " + name);
        delBtn.setAttribute("data-note", name);
        delBtn.textContent = "\u00d7";
        delBtn.addEventListener("click", function(e) {
          trashNote(this.getAttribute("data-note"), !!(e && e.shiftKey));
        });
        const noteTagList = tagsFor(name);
        li.appendChild(main);
        li.appendChild(pinBtn);
        li.appendChild(delBtn);
        if (noteTagList.length) {
          const tagRow = document.createElement("div");
          tagRow.className = "note-tags";
          noteTagList.forEach(function(tag) {
            const chip = document.createElement("button");
            chip.className = "note-tag";
            chip.setAttribute("data-tag", tag);
            chip.setAttribute("aria-label", "Filter notes by tag " + tag);
            chip.textContent = tag;
            chip.addEventListener("click", function(e) {
              if (e && e.stopPropagation) e.stopPropagation();
              if (!tagFilter) return;
              tagFilter.value = tag;
              renderNoteList();
            });
            tagRow.appendChild(chip);
          });
          li.appendChild(tagRow);
        }
        noteList.appendChild(li);
      });
    };
    const useCache = listCache.data && (Date.now() - listCache.at < 2000);
    const fetchAll = useCache ? Promise.resolve(listCache.data) : idbGetAll().then(function(all) {
      listCache = { at: Date.now(), data: all };
      return all;
    });
    fetchAll.then(paint).catch(function() {
      const fallback = {};
      if (currentNote) fallback[currentNote] = content.value;
      paint(fallback);
    });
  }

  function moveNoteToTrash(name) {
    if (!name || deleteRunning) return;
    deleteRunning = true;
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    const liveText = (name === currentNote) ? content.value : null;
    const collect = function() {
      if (liveText !== null) return Promise.resolve(String(liveText || ""));
      return idbGet(name).then(function(v) {
        return String(v === null || v === undefined ? "" : v);
      }).catch(function() {
        return "";
      });
    };
    collect().then(function(text) {
      if (text === "") {
        if (getNoteNames().length <= 1) {
          deleteRunning = false;
          showAlert("This note is empty. Write something first, there is nothing to move to Trash. To remove it anyway, Shift-click delete.");
          renderNoteList();
          return null;
        }
        return false;
      }
      pushTrash({ name: name, value: text, pin: pins.indexOf(name) !== -1, updated: meta[name] || 0 });
      return true;
    }).then(function(trashed) {
      if (trashed === null) return null;
      return idbDel(name).then(function() {
        return trashed;
      });
    }).then(function(trashed) {
      if (trashed === null) return;
      clearRecovery(name);
      if (name === currentNote) return openNextAfterDelete(name, trashed);
      if (trashed) setStatus("saved", "Deleted \u201c" + name + "\u201d, click here to undo");
      else setStatus("saved", "Deleted \u201c" + name + "\u201d");
      renderNoteList();
    }).catch(function() {
      renderNoteList();
    }).then(function() {
      deleteRunning = false;
    });
  }

  function deleteNotePermanent(name) {
    if (!name || deleteRunning) return;
    showConfirm("Delete \u201c" + name + "\u201d permanently? This cannot be undone.", { ok: "YES", cancel: "NO" }).then(function(yes) {
      if (!yes) return;
      deleteRunning = true;
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      idbDel(name).then(function() {
        clearRecovery(name);
      }).catch(function() {}).then(function() {
        if (name === currentNote) {
          currentNote = ""; shownNote = ""; dirty = false;
          safeRemove("TextCove-current");
          Promise.resolve(openFallbackNote(name)).catch(function() {}).then(function() {
            setStatus("saved", "Deleted \u201c" + name + "\u201d permanently");
            renderNoteList();
          }).then(function() {
            deleteRunning = false;
          });
        } else {
          setStatus("saved", "Deleted \u201c" + name + "\u201d permanently");
          renderNoteList();
          deleteRunning = false;
        }
      });
    });
  }

  function trashNote(name, isPermanent) {
    if (isPermanent) {
      deleteNotePermanent(name);
      return;
    }
    moveNoteToTrash(name);
  }
  function renderTrash() { try { if (!trashList) return; const t = getTrash(); if (trashCount) trashCount.textContent = String(t.length); trashList.innerHTML = ""; t.forEach(function(x, i) { const li = document.createElement("li"); li.className = "trash-row"; const b = document.createElement("span"); b.className = "note-name"; b.textContent = x.name; const r = document.createElement("button"); r.className = "trash-restore"; r.textContent = "Restore"; r.setAttribute("aria-label", "Restore " + x.name); r.addEventListener("click", function() { restoreTrash(i); }); const d = document.createElement("button"); d.className = "note-delete"; d.textContent = "\u00d7"; d.setAttribute("aria-label", "Delete forever " + x.name); d.addEventListener("click", function() { wipeTrash(i); }); li.appendChild(b); li.appendChild(r); li.appendChild(d); trashList.appendChild(li); }); if (trashEmpty) trashEmpty.style.display = t.length ? "" : "none"; } catch (err) {} }
  function restoreTrash(i) { const t = getTrash(), x = t[i]; if (!x) return Promise.resolve(false); const target = getNoteNames().indexOf(x.name) !== -1 ? reserveName(x.name) : x.name; if (namesCache.indexOf(target) === -1) namesCache.push(target); return idbPut(target, x.value).then(function() { if (x.pin && pins.indexOf(target) === -1) { pins.push(target); savePins(); } if (x.updated) { meta[target] = x.updated; saveMeta(); } if (Array.isArray(x.tags) && x.tags.length) setNoteTags(target, x.tags); t.splice(i, 1); setTrash(t); if (lastTrash && lastTrash.name === x.name && lastTrash.value === x.value) lastTrash = null; if (!currentNote) return openNote(target); renderNoteList(); setStatus("saved", "Restored \u201c" + target + "\u201d"); return true; }).catch(function() { showAlert("Restore failed. Storage may be full."); return false; }); }
  function wipeTrash(i) { const t = getTrash(), x = t[i]; showConfirm("Delete \u201c" + (x ? x.name : "") + "\u201d forever?", { ok: "YES", cancel: "NO" }).then(function(yes) { if (!yes) return; const n = getTrash(); n.splice(i, 1); setTrash(n); if (lastTrash && x && lastTrash.name === x.name && lastTrash.value === x.value) lastTrash = null; }); }

  function migrateFromLocalStorage() {
    const batch = [];
    try {
      const legacyTitleKey = localStorage.getItem("TextCove-title") !== null ? "TextCove-title" : "SimpleJot-title";
      const legacyContentKey = localStorage.getItem("TextCove-content") !== null ? "TextCove-content" : "SimpleJot-content";
      if (localStorage.getItem(legacyTitleKey) !== null || localStorage.getItem(legacyContentKey) !== null) {
        const legacyTitle = localStorage.getItem(legacyTitleKey) || localStorage.getItem("TextCove-title") || localStorage.getItem("SimpleJot-title") || "Untitled";
        const legacyContent = localStorage.getItem(legacyContentKey) || "";
        batch.push({ k: legacyTitle, v: legacyContent });
        localStorage.removeItem("TextCove-title");
        localStorage.removeItem("TextCove-content");
        localStorage.removeItem("SimpleJot-title");
        localStorage.removeItem("SimpleJot-content");
        safeSet("TextCove-current", legacyTitle);
      }
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.indexOf(notesPrefix) === 0) {
          batch.push({ k: key.slice(notesPrefix.length), v: localStorage.getItem(key) || "" });
          toRemove.push(key);
        }
      }
      let chain = Promise.resolve();
      batch.forEach(function(item) {
        chain = chain.then(function() { return idbPut(item.k, item.v); });
      });
      return chain.then(function() {
        toRemove.forEach(function(k) { try { const v = localStorage.getItem(k) || mem[k] || ""; if (String(v).length > mirrorLimit) safeRemove(k); } catch (err) {} });
        safeSet("TextCove-migrated-idb-v1", "1");
      });
    } catch (err) { return Promise.resolve(); }
  }

  function inlineMd(s) {
    const codes = [];
    let out = String(s).replace(/`([^`]+)`/g, function(m, p1) {
      codes.push(p1);
      return "@@tc" + (codes.length - 1) + "@@";
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/~~([^~\n]+)~~/g, "<del>$1</del>");
    out = out.replace(/(^|\W)\*([^*\n]+)\*/g, "$1<em>$2</em>");
    out = out.replace(/(^|\W)_([^_\n]+)_/g, "$1<em>$2</em>");
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noopener\">$1</a>");
    out = out.replace(/@@tc(\d+)@@/g, function(m, i) {
      return "<code>" + (codes[+i] ? codes[+i] : "") + "</code>";
    });
    return out;
  }

  function renderMarkdown(src) {
    const lines = escapeHtml(src).split("\n");
    let html = "";
    let inList = false;
    let inOrdered = false;
    let inCode = false;
    const closeList = function() {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      if (inOrdered) {
        html += "</ol>";
        inOrdered = false;
      }
    };
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^```/.test(line)) {
        closeList();
        html += inCode ? "</code></pre>" : "<pre><code>";
        inCode = !inCode;
        continue;
      }
      if (inCode) {
        html += line + "\n";
        continue;
      }
      if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
        closeList();
        html += "<hr>";
        continue;
      }
      const heading = /^(#{1,6})\s+(.*)/.exec(line);
      if (heading) {
        closeList();
        const level = heading[1].length;
        html += "<h" + level + ">" + inlineMd(heading[2]) + "</h" + level + ">";
        continue;
      }
      const task = /^\s*-\s+\[([ xX])\]\s+(.*)/.exec(line);
      if (task) {
        if (inOrdered) { html += "</ol>"; inOrdered = false; }
        if (!inList) { html += "<ul>"; inList = true; }
        const checked = task[1].toLowerCase() === "x" ? " checked disabled" : " disabled";
        html += "<li class=\"task\"><input type=\"checkbox\"" + checked + "><span>" + inlineMd(task[2]) + "</span></li>";
        continue;
      }
      const ordered = /^\s*\d+[.)]\s+(.*)/.exec(line);
      if (ordered) {
        if (inList) { html += "</ul>"; inList = false; }
        if (!inOrdered) { html += "<ol>"; inOrdered = true; }
        html += "<li>" + inlineMd(ordered[1]) + "</li>";
        continue;
      }
      const bullet = /^\s*-\s+(.*)/.exec(line);
      if (bullet) {
        if (inOrdered) { html += "</ol>"; inOrdered = false; }
        if (!inList) { html += "<ul>"; inList = true; }
        html += "<li>" + inlineMd(bullet[1]) + "</li>";
        continue;
      }
      const quote = /^\s*&gt;\s?(.*)/.exec(line);
      if (quote) {
        closeList();
        html += "<blockquote>" + inlineMd(quote[1]) + "</blockquote>";
        continue;
      }
      if (line.trim() === "") {
        closeList();
        continue;
      }
      closeList();
      html += "<p>" + inlineMd(line) + "</p>";
    }
    closeList();
    if (inCode) html += "</code></pre>";
    return html;
  }

  function refreshPreview() {
    if (!previewOpen) return;
    if (content.value.trim() === "") {
      previewBody.innerHTML = "";
      previewBody.textContent = "Nothing to preview yet.";
    } else {
      previewBody.innerHTML = renderMarkdown(content.value);
    }
  }

  function isSplitView() {
    try { return !!(window.matchMedia && window.matchMedia("(min-width: 48em)").matches); } catch (err) { return false; }
  }
  function applyLayout() {
    if (isSplitView()) {
      content.style.display = "";
    } else if (previewOpen) {
      content.style.display = "none";
    } else {
      content.style.display = "";
    }
  }
  function togglePreview(force) {
    if (isSplitView()) {
      const desired = typeof force === "boolean" ? force : preview.hidden;
      preview.hidden = !desired;
      previewOpen = !preview.hidden;
      content.style.display = "";
      previewBtn.classList.toggle("preview-btn--active", previewOpen);
      previewBtn.setAttribute("aria-pressed", previewOpen ? "true" : "false");
      if (previewOpen) refreshPreview();
      return;
    }
    previewOpen = typeof force === "boolean" ? force : !previewOpen;
    preview.hidden = !previewOpen;
    content.style.display = previewOpen ? "none" : "";
    previewBtn.classList.toggle("preview-btn--active", previewOpen);
    previewBtn.setAttribute("aria-pressed", previewOpen ? "true" : "false");
    if (previewOpen) refreshPreview();
    else content.focus();
  }

  function readFileAsText(file) {
    return new Promise(function(resolve, reject) {
      const reader = new FileReader();
      reader.onload = function(ev) { resolve(ev.target.result); };
      reader.onerror = function() { reject(reader.error || new Error("read failed")); };
      reader.readAsText(file);
    });
  }

  function processImportedNotes(dataStr) {
    let data;
    try {
      data = JSON.parse(dataStr);
    } catch (err) {
      showAlert("That file is not valid JSON, so nothing was imported.");
      return;
    }
    if (!data || typeof data !== "object" || !data.notes || typeof data.notes !== "object") {
      showAlert("Invalid backup format. Expected an object with a \"notes\" property.");
      return;
    }
    const noteObj = data.notes;
    let importedCount = 0;
    if (Array.isArray(data.tags)) data.tags.forEach(function(t) { registerTag(t); });
    const importedTags = data.noteTags && typeof data.noteTags === "object" && !Array.isArray(data.noteTags) ? data.noteTags : {};
    const keys = Object.keys(noteObj).slice(0, maxImportNotes);
    if (Object.keys(noteObj).length > maxImportNotes) {
      showAlert("Backup has too many notes. Only the first " + maxImportNotes + " will be imported.");
    }
    let chain = Promise.resolve();
    keys.forEach(function(key) {
      chain = chain.then(function() {
        const raw = String(noteObj[key] === null || noteObj[key] === undefined ? "" : noteObj[key]);
        const value = raw.length > maxTextLen ? raw.slice(0, maxTextLen) : raw;
        const cleanKey = sanitizeFileName(key);
        let noteName;
        if (key && key.trim() !== "") {
          noteName = getNoteNames().indexOf(cleanKey) !== -1 ? reserveName(cleanKey) : cleanKey;
          if (namesCache.indexOf(noteName) === -1) namesCache.push(noteName);
        } else {
          noteName = reserveName(defaultNoteBase);
        }
        return idbPut(noteName, value).then(function() {
          importedCount++;
          if (hasOwn(importedTags, key) && Array.isArray(importedTags[key])) setNoteTags(noteName, importedTags[key]);
        });
      });
    });
    chain.then(function() {
      markSaved();
      if (currentNote === "" || getNoteNames().indexOf(currentNote) === -1) {
        const firstNote = sortedNames(getNoteNames())[0];
        if (firstNote) {
          openNote(firstNote);
          return;
        }
      }
      renderNoteList();
      showAlert("Successfully imported " + importedCount + " note(s).");
    }).catch(function(err) {
      if (isQuotaError(err)) {
        markError("Save failed: storage is full");
        showAlert("Storage is full, so only " + importedCount + " note(s) were imported.");
      } else {
        showAlert("Imported " + importedCount + " note(s).");
      }
      renderNoteList();
    });
  }

  function handleImportFile(file) {
    if (!file) return;
    if (file.size && file.size > maxFileSize) {
      showAlert("File is too large (max 5MB), so nothing was imported.");
      return;
    }
    readFileAsText(file).then(function(text) {
      if (String(text).length > maxTextLen) {
        showAlert("File is too large (max ~1M characters), so nothing was imported.");
        return;
      }
      processImportedNotes(text);
    }).catch(function() {
      showAlert("Failed to read file. Please try again.");
    });
  }

  function handleDroppedFile(file) {
    if (!file) return;
    if (file.size && file.size > maxFileSize) {
      showAlert("File is too large (max 5MB).");
      return;
    }
    const name = file.name || "";
    const isJson = /\.json$/i.test(name) || (file.type && file.type.indexOf("json") !== -1);
    if (isJson) {
      handleImportFile(file);
      return;
    }
    readFileAsText(file).then(function(text) {
      const str = String(text || "");
      if (str.length > maxTextLen) {
        showAlert("File is too large (max ~1M characters).");
        return;
      }
      const rawBase = name.replace(/\.[a-z0-9]+$/i, "") || defaultNoteBase;
      const base = sanitizeFileName(rawBase);
      const noteName = getNoteNames().indexOf(base) !== -1 ? reserveName(base) : base;
      if (namesCache.indexOf(noteName) === -1) namesCache.push(noteName);
      stashPrev();
      currentNote = noteName; shownNote = noteName; dirty = false;
      safeSet("TextCove-current", noteName);
      title.value = noteName;
      content.value = String(text || "");
      updateCounters();
      idbPut(noteName, content.value).then(function() {
        markSaved();
        renderNoteList();
      }).catch(function(err) {
        if (isQuotaError(err)) markError("Save failed: storage is full");
      });
    }).catch(function() {
      showAlert("Failed to read file. Please try again.");
    });
  }

  function exportData() {
    flushSave().then(function() {
      return idbGetAll();
    }).then(function(notes) {
      let total = 0;
      Object.keys(notes).forEach(function(k) { total += String(notes[k] || "").length; });
      if (total === 0) {
        showAlert("There is nothing to back up yet. Write something first.");
        return null;
      }
      if (total > 10000000) {
        return showConfirm("Backup is large (" + formatSize(total) + "). Export anyway?", { ok: "YES", cancel: "NO" }).then(function(yes) {
          if (yes) return notes;
          return null;
        });
      }
      return notes;
    }).then(function(notes) {
      if (!notes) return;
      const exportObj = { version: noteExportVersion, exportedAt: new Date().toISOString(), notes: notes, tags: allTags, noteTags: noteTags };
      downloadBlob(new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json;charset=utf-8" }), "textcove-backup-" + backupStamp() + ".json");
      markBackup(); opfsBackup(notes); refreshStoreStatus();
    }).catch(function(err) {
      if (isQuotaError(err)) showAlert("Storage is full, so the export could not be prepared.");
    });
  }

  function createNewNote() {
    stashPrev();
    const autoName = reserveName(defaultNoteBase);
    currentNote = autoName; shownNote = autoName; dirty = false;
    safeSet("TextCove-current", autoName);
    title.value = autoName;
    content.value = "";
    if (previewOpen && !isSplitView()) togglePreview(false);
    updateCounters();
    setStatus("ready", "Ready");
    return idbPut(autoName, "").then(function() {
      markSaved();
      renderNoteList();
    }).catch(function(err) {
      const ni = namesCache.indexOf(autoName);
      if (ni !== -1) namesCache.splice(ni, 1);
      if (isQuotaError(err)) markError("Save failed: storage is full");
      renderNoteList();
    });
    notesMenu.classList.remove("notes-menu--open");
    notesBtn.classList.remove("notes-btn--active");
    content.focus();
  }

  function applyRename(oldName, newName, val) {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    moveNoteTags(oldName, newName);
    currentNote = newName; shownNote = newName;
    safeSet("TextCove-current", newName);
    title.value = newName;
    markSaving();
    const p = oldName ? idbGet(oldName).then(function(oldVal) {
      const c = (val !== "" ? val : (oldVal || ""));
      return idbPut(newName, c).then(function() { return idbDel(oldName); });
    }) : idbPut(newName, val);
    p.then(function() {
      if (oldName) clearRecovery(oldName);
      markSaved();
      renderNoteList();
    }).catch(function(err) {
      if (isQuotaError(err)) {
        markError("Save failed: storage is full");
        showAlert("Storage is full, so the note could not be renamed.");
        moveNoteTags(newName, oldName);
        currentNote = oldName; shownNote = oldName || "";
        title.value = oldName || "";
        safeSet("TextCove-current", oldName || "");
      }
    });
  }

  function commitRename() {
    const rawName = title.value.trim();
    const newName = sanitizeFileName(rawName);
    if (!rawName) {
      title.value = currentNote;
      return;
    }
    if (newName !== rawName) title.value = newName;
    if (newName === currentNote) {
      title.value = currentNote;
      return;
    }
    if (getNoteNames().indexOf(newName) !== -1) {
      const suggestion = generateNoteName(newName);
      showConfirm("A note named \u201c" + newName + "\u201d already exists. Use \u201c" + suggestion + "\u201d instead?", { ok: "YES", cancel: "NO" }).then(function(yes) {
        if (yes) {
          applyRename(currentNote, suggestion, content.value);
        } else {
          title.value = currentNote;
          title.focus();
        }
      });
      return;
    }
    applyRename(currentNote, newName, content.value);
  }

  function clampLineWidth(v) {
    const n = parseFloat(v);
    if (isNaN(n)) return 10;
    return Math.min(maxLinePaddingEm, Math.max(1, n));
  }

  function isReservedName(name) {
    const lower = String(name || "").toLowerCase();
    return lower === "__proto__" || lower === "constructor" || lower === "prototype";
  }

  function sanitizeFileName(name) {
    let cleaned = String(name || "").replace(/[\\/:*?"<>|]/g, "-").replace(/[\u0000-\u001f\u007f]+/g, "").trim().slice(0, 120);
    if (isReservedName(cleaned)) cleaned = defaultNoteBase;
    return cleaned || defaultNoteBase;
  }

  function undoLastDelete() {
    const bin = getTrash();
    const t = lastTrash || bin[0];
    if (!t) {
      showAlert("Nothing to undo.");
      return Promise.resolve(false);
    }
    const idx = bin.findIndex(function(x) { return x.name === t.name && x.value === t.value; });
    const target = getNoteNames().indexOf(t.name) !== -1 ? reserveName(t.name) : t.name;
    if (namesCache.indexOf(target) === -1) namesCache.push(target);
    return idbPut(target, t.value).then(function() {
      if (t.pin && pins.indexOf(target) === -1) { pins.push(target); savePins(); }
      if (t.updated) { meta[target] = t.updated; saveMeta(); }
      if (Array.isArray(t.tags) && t.tags.length) setNoteTags(target, t.tags);
      if (idx !== -1) { bin.splice(idx, 1); setTrash(bin); }
      lastTrash = null;
      if (!currentNote) return openNote(target);
      renderNoteList();
      setStatus("saved", "Brought back \u201c" + target + "\u201d");
      return true;
    }).catch(function() {
      showAlert("Undo failed. Storage may be full.");
      return false;
    });
  }

  const editorFonts = {
    ibm: "\"IBM Plex Mono\", \"Roboto Mono\", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    sysMono: "ui-monospace, SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace",
    consolas: "Consolas, Menlo, Monaco, \"Courier New\", monospace",
    sysSans: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif",
    serif: "Georgia, \"Times New Roman\", Times, serif"
  };

  function currentFontId() {
    const stored = safeGet("TextCove-settings-font");
    if (stored && editorFonts[stored]) return stored;
    return "ibm";
  }

  function fontStackFor(id) {
    if (id && editorFonts[id]) return editorFonts[id];
    return editorFonts.ibm;
  }

  function applyFontFamily() {
    const stack = fontStackFor(currentFontId());
    content.style.fontFamily = stack;
    preview.style.fontFamily = stack;
    if (fontPick) fontPick.value = currentFontId();
  }

  function textSettings() {
    const fsValue = fs.value;
    const lhValue = lh.value;
    const lwValue = String(clampLineWidth(lw.value));
    const fontValue = fontPick && editorFonts[fontPick.value] ? fontPick.value : currentFontId();
    const settingValues = "font-size:" + fsValue + "em;line-height:" + lhValue + ";padding-left:" + lwValue + "em;padding-right:" + lwValue + "em;";
    content.style.fontSize = fsValue + "em";
    content.style.lineHeight = String(lhValue);
    content.style.paddingLeft = lwValue + "em";
    content.style.paddingRight = lwValue + "em";
    content.style.fontFamily = fontStackFor(fontValue);
    if (previewOpen) {
      preview.style.fontSize = fsValue + "em";
      preview.style.lineHeight = String(lhValue);
      preview.style.paddingLeft = lwValue + "em";
      preview.style.paddingRight = lwValue + "em";
      preview.style.fontFamily = fontStackFor(fontValue);
    } else {
      preview.style.fontFamily = fontStackFor(fontValue);
    }
    safeSet("TextCove-settings", settingValues);
    safeSet("TextCove-settings-fs", fsValue);
    safeSet("TextCove-settings-lh", lhValue);
    safeSet("TextCove-settings-lw", lwValue);
    safeSet("TextCove-settings-font", fontValue);
  }

  function applyStoredSettings() {
    const fsv = safeGet("TextCove-settings-fs");
    if (fsv) fs.value = fsv;
    const lhv = safeGet("TextCove-settings-lh");
    if (lhv) lh.value = lhv;
    const lwv = safeGet("TextCove-settings-lw");
    if (lwv) lw.value = lwv;
    if (fontPick) fontPick.value = currentFontId();
    applyFontFamily();
    const stored = safeGet("TextCove-settings");
    if (stored) {
      content.style.fontSize = fs.value + "em";
      content.style.lineHeight = String(lh.value);
      content.style.paddingLeft = String(clampLineWidth(lw.value)) + "em";
      content.style.paddingRight = String(clampLineWidth(lw.value)) + "em";
      preview.style.fontSize = fs.value + "em";
      preview.style.lineHeight = String(lh.value);
      preview.style.paddingLeft = String(clampLineWidth(lw.value)) + "em";
      preview.style.paddingRight = String(clampLineWidth(lw.value)) + "em";
    }
  }

  function defaultTextSettings() {
    return {
      fs: fs.defaultValue || "1",
      lh: lh.defaultValue || "1.9",
      lw: lw.defaultValue || "10",
      font: "ibm"
    };
  }

  function isTextSettingsDefault() {
    const d = defaultTextSettings();
    return String(fs.value) === String(d.fs) &&
      String(lh.value) === String(d.lh) &&
      String(clampLineWidth(lw.value)) === String(clampLineWidth(d.lw)) &&
      currentFontId() === d.font &&
      (!fontPick || String(fontPick.value) === String(d.font));
  }

  function resetTextSettings() {
    if (isTextSettingsDefault()) {
      showAlert("Settings are already at their defaults, so there is nothing to reset.");
      return;
    }
    const d = defaultTextSettings();
    fs.value = d.fs;
    lh.value = d.lh;
    lw.value = d.lw;
    if (fontPick) fontPick.value = d.font;
    textSettings();
    showAlert("Text settings have been reset to defaults.");
  }

  const rootEl = document.documentElement;

  function currentThemeMode() {
    const stored = safeGet("TextCove-theme");
    if (stored === "night" || stored === "light") return stored;
    try {
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "night";
    } catch (err) {}
    return "light";
  }

  function applyTheme() {
    const night = currentThemeMode() === "night";
    rootEl.classList.toggle("night", night);
    if (theme) {
      theme.dataset.tooltip = night ? "Switch to light theme" : "Switch to dark theme";
      theme.setAttribute("aria-label", night ? "Switch to light theme" : "Switch to dark theme");
    }
    if (themeIcon) {
      const ref = night ? "#icon-sun" : "#icon-moon";
      themeIcon.setAttribute("href", ref);
      themeIcon.setAttribute("xlink:href", ref);
    }
  }

  try {
    const schemeQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    const followSystem = function() {
      if (safeGet("TextCove-theme") === null) applyTheme();
    };
    if (schemeQuery && typeof schemeQuery.addEventListener === "function") schemeQuery.addEventListener("change", followSystem);
    else if (schemeQuery && typeof schemeQuery.addListener === "function") schemeQuery.addListener(followSystem);
  } catch (err) {}

  function syncMenuExpanded() {
    try {
      if (notesBtn) notesBtn.setAttribute("aria-expanded", notesMenu.classList.contains("notes-menu--open") ? "true" : "false");
      if (settings) settings.setAttribute("aria-expanded", setMenu.classList.contains("settings-menu--open") ? "true" : "false");
    } catch (err) {}
  }

  try {
    const menuSync = new MutationObserver(function() { syncMenuExpanded(); });
    if (notesMenu) menuSync.observe(notesMenu, { attributes: true, attributeFilter: ["class"] });
    if (setMenu) menuSync.observe(setMenu, { attributes: true, attributeFilter: ["class"] });
  } catch (err) {}
  syncMenuExpanded();

  if (hasStorage() === true || typeof indexedDB !== "undefined") {
    if (!hasStorage()) setTimeout(function() { showAlert("Browser storage is limited. Notes still work, but export often to keep them."); }, 0);
    initPersist(); pruneTrash();

    applyTheme();

    applyStoredSettings();

    content.addEventListener("input", function() {
      updateCounters();
      if (content.value.length > loadSafeLimit && oversizeWarnedName !== currentNote) {
        oversizeWarnedName = currentNote;
        setStatus("error", "Note too large, export soon");
        showAlert("This note is over " + formatSize(loadSafeLimit) + ". Typing may freeze the page. Download a backup copy, then split it into smaller notes.");
      } else if (content.value.length <= loadSafeLimit) {
        oversizeWarnedName = "";
      }
      if (previewOpen) refreshPreview();
      if (!currentNote) {
        if (content.value === "") return;
        ensureCurrentNote().then(function() { requestSave(); });
      } else {
        requestSave();
      }
    });

    content.addEventListener("keydown", function(e) {
      if (e.key === "Tab") {
        e.preventDefault();
        const startPos = content.selectionStart || 0;
        const endPos = content.selectionEnd || 0;
        content.value = content.value.slice(0, startPos) + "  " + content.value.slice(endPos);
        content.selectionStart = content.selectionEnd = startPos + 2;
        updateCounters();
        if (previewOpen) refreshPreview();
        if (!currentNote) {
          ensureCurrentNote().then(function() { requestSave(); });
        } else {
          requestSave();
        }
      }
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape") {
        const notesWasOpen = notesMenu.classList.contains("notes-menu--open");
        const settingsWasOpen = setMenu.classList.contains("settings-menu--open");
        setMenu.classList.remove("settings-menu--open");
        settings.classList.remove("settings-btn--active");
        notesMenu.classList.remove("notes-menu--open");
        notesBtn.classList.remove("notes-btn--active");
        notesBtn.setAttribute("aria-expanded", "false");
        settings.setAttribute("aria-expanded", "false");
        try { if (notesWasOpen && notesBtn) notesBtn.focus(); else if (settingsWasOpen && settings) settings.focus(); } catch (err) {}
        return;
      }
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = (e.key || "").toLowerCase();
      if (key === "s") {
        e.preventDefault();
        save.click();
      } else if (key === "n") {
        e.preventDefault();
        createNewNote();
      } else if (key === "k") {
        e.preventDefault();
        notesMenu.classList.add("notes-menu--open");
        notesBtn.classList.add("notes-btn--active");
        setMenu.classList.remove("settings-menu--open");
        settings.classList.remove("settings-btn--active");
        refreshNames().then(renderNoteList).catch(renderNoteList);
        if (searchInput) searchInput.focus();
      }
    });

    function handleHide() {
      writeRecoverySync();
      if (currentNote) mirrorPut(currentNote, content.value);
      flushSave();
    }

    document.addEventListener("visibilitychange", function() {
      if (document.hidden) handleHide();
    });
    window.addEventListener("pagehide", handleHide);
    window.addEventListener("beforeunload", function() { writeRecoverySync(); if (currentNote) mirrorPut(currentNote, content.value); });

    title.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        title.blur();
      }
    });
    title.addEventListener("change", commitRename);
    title.addEventListener("blur", function() {
      if (title.value.trim() === "" && currentNote) title.value = currentNote;
    });

    if (searchInput) {
      let searchTimer = null;
      searchInput.addEventListener("input", function() {
        if (searchTimer) clearTimeout(searchTimer);
        searchTimer = setTimeout(renderNoteList, 250);
      });
    }
    if (sortSelect) {
      const storedSort = safeGet("TextCove-sort");
      if (storedSort === "name" || storedSort === "updated") sortSelect.value = storedSort;
      sortSelect.addEventListener("change", function() {
        safeSet("TextCove-sort", sortSelect.value);
        renderNoteList();
      });
    }

    function bootFromIDB() {
      const migrated = safeGet("TextCove-migrated-idb-v1");
      const startP = migrated ? Promise.resolve() : migrateFromLocalStorage();
      return startP.then(refreshNames).then(function() {
        const unnamed = getNoteNames().filter(function(n) { return n.trim() === ""; });
        let chain = Promise.resolve();
        unnamed.forEach(function(bad) {
          chain = chain.then(function() {
            const fixedName = reserveName(defaultNoteBase);
            moveNoteTags(bad, fixedName);
            return idbGet(bad).then(function(v) {
              return idbPut(fixedName, v || "").then(function() { return idbDel(bad); }).then(function() {
                if (safeGet("TextCove-current") === bad) safeSet("TextCove-current", fixedName);
                clearRecovery(bad);
              });
            });
          });
        });
        return chain;
      }).then(refreshNames).then(function() {
        return reconcileRecovery();
      }).then(refreshNames).then(function() {
        if (!getNoteNames().length) {
          return rescueMirrors().then(function(n) {
            if (n > 0) { setTimeout(function() { showAlert("Recovered " + n + " note(s) from local backup after browser cleared data. Export to keep them."); }, 0); return; }
            const recs = recoveryAll(), rk = Object.keys(recs);
            if (rk.length) { let c = Promise.resolve(); rk.slice(0, 10).forEach(function(k) { c = c.then(function() { return idbPut(sanitizeFileName(k) || generateNoteName(defaultNoteBase), String(recs[k] || "").slice(0, maxTextLen)).catch(function() {}); }); }); return c.then(refreshNames).then(function() { if (getNoteNames().length) setTimeout(function() { showAlert("Recovered unsaved text. Export to keep it."); }, 0); }); }
            if (safeGet("TextCove-current")) setTimeout(function() { showAlert("Browser cleared saved notes. Starting fresh \u2014 export often to keep notes."); }, 0);
            const f = generateNoteName(defaultNoteBase);
            return idbPut(f, "").then(function() { safeSet("TextCove-current", f); }).then(refreshNames);
          });
        }
      }).then(function() {
        let wanted = null;
        let sharedBody = "";
        let sharedTitle = "";
        try {
          const params = new URLSearchParams(window.location.search);
          wanted = params.get("share") || params.get("note");
          sharedTitle = params.get("title") || "";
          const sharedText = params.get("text") || "";
          const sharedUrl = params.get("url") || "";
          const proto = params.get("protocol") || "";
          const parts = [];
          if (sharedTitle) parts.push(sharedTitle);
          if (sharedText) parts.push(sharedText);
          if (sharedUrl && sharedUrl !== sharedText) parts.push(sharedUrl);
          if (!parts.length && proto) parts.push(proto);
          sharedBody = parts.join("\n\n");
        } catch (err) {}
        if (sharedBody) {
          const rawBase = String(sharedTitle || sharedBody).split("\n")[0].trim().slice(0, 40) || defaultNoteBase;
          const base = sanitizeFileName(rawBase);
          const target = getNoteNames().indexOf(base) !== -1 ? reserveName(base) : base;
          if (namesCache.indexOf(target) === -1) namesCache.push(target);
          stashPrev();
          currentNote = target; shownNote = target; dirty = false;
          safeSet("TextCove-current", target);
          title.value = target;
          content.value = sharedBody.slice(0, maxTextLen);
          updateCounters();
          try {
            window.history.replaceState({}, "", window.location.pathname);
          } catch (err) {}
          return idbPut(target, content.value).then(function() {
            markSaved();
            renderNoteList();
          }).catch(function(err) {
            if (isQuotaError(err)) markError("Save failed: storage is full");
          });
        }
        const savedNote = safeGet("TextCove-current");
        if (wanted && getNoteNames().indexOf(wanted) !== -1) {
          return openNote(wanted);
        } else if (savedNote !== null && getNoteNames().indexOf(savedNote) !== -1) {
          return openNote(savedNote);
        } else if (getNoteNames().length) {
          return openNote(sortedNames(getNoteNames())[0]);
        }
      }).then(function() {
        renderNoteList(); renderTrash(); refreshStoreStatus();
        if (needBackup() && getNoteNames().length) setStatus("saved", "Export a copy when something matters");
        else setStatus("ready", "Ready");
        idbGetAll().then(opfsBackup).catch(function() {});
        try { setInterval(function() { refreshStoreStatus(); idbGetAll().then(opfsBackup).catch(function() {}); }, 3600000); } catch (err) {}
      }).then(function() {
        let params = null;
        try {
          params = new URLSearchParams(window.location.search);
        } catch (err) {}
        if (!params) return;
        const action = params.get("action");
        if (action === "new") {
          createNewNote();
        } else if (action === "search") {
          notesMenu.classList.add("notes-menu--open");
          notesBtn.classList.add("notes-btn--active");
          if (searchInput) searchInput.focus();
        }
      }).catch(function() {
        renderNoteList();
      });
    }

    migrateIdbFromLegacy().then(bootFromIDB);
  } else {
    showAlert("Sorry, either your browser does not support local storage, or you have exceeded storage limits.");
  }

  save.addEventListener("click", function(event) {
    event.preventDefault();
    if (content.value === "") {
      showAlert("There is nothing to save yet. Write something first.");
      return;
    }
    const downloadCurrent = function(name) {
      const safe = sanitizeFileName(name);
      downloadBlob(new Blob([content.value], { type: "text/plain;charset=utf-8" }), safe + ".txt");
      markSaved();
    };
    const existingName = sanitizeFileName(title.value.trim() || currentNote);
    if (existingName !== "") {
      if (!currentNote) {
        const finalName = getNoteNames().indexOf(existingName) !== -1 ? reserveName(existingName) : existingName;
        if (namesCache.indexOf(finalName) === -1) namesCache.push(finalName);
        currentNote = finalName; shownNote = finalName;
        safeSet("TextCove-current", finalName);
        title.value = finalName;
        idbPut(finalName, content.value).then(function() {
          clearRecovery(finalName);
          markSaved();
          renderNoteList();
        }).catch(function(err) {
          if (isQuotaError(err)) markError("Save failed: storage is full");
        });
        downloadCurrent(finalName);
        return;
      }
      downloadCurrent(title.value.trim() || currentNote);
      return;
    }
    showPrompt("Please give your file a title:", generateNoteName(defaultNoteBase), "Save").then(function(answer) {
      if (answer === null) return;
      let finalName = sanitizeFileName((answer || "").trim() || generateNoteName(defaultNoteBase));
      if (getNoteNames().indexOf(finalName) !== -1) {
        finalName = reserveName(finalName);
      } else if (namesCache.indexOf(finalName) === -1) {
        namesCache.push(finalName);
      }
      const oldName = currentNote;
      const val = content.value;
      currentNote = finalName; shownNote = finalName;
      safeSet("TextCove-current", finalName);
      title.value = finalName;
      idbPut(finalName, val).then(function() {
        clearRecovery(finalName);
        if (oldName && oldName !== finalName) {
          idbDel(oldName).then(function() { clearRecovery(oldName); }).catch(function() {});
        }
        markSaved();
        renderNoteList();
      }).catch(function(err) {
        if (isQuotaError(err)) markError("Save failed: storage is full");
      });
      downloadCurrent(finalName);
    });
  }, false);

  clear.addEventListener("click", function(e) {
    if (deleteRunning) return;
    const isPermanent = !!(e && e.shiftKey);
    if (isPermanent && currentNote) {
      deleteNotePermanent(currentNote);
      return;
    }
    if (content.value === "" && getNoteNames().length <= 1) {
      showAlert("This note is empty. Write something first, there is nothing to delete. To remove it anyway, Shift-click delete.");
      return;
    }
    deleteRunning = true;
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    const doomed = currentNote;
      const doomedVal = content.value;
      const wasPinned = doomed ? pins.indexOf(doomed) !== -1 : false;
      const wasUpdated = doomed ? (meta[doomed] || 0) : 0;
      const done = function() {
        if (doomed && doomedVal !== "") {
          pushTrash({ name: doomed, value: doomedVal, pin: wasPinned, updated: wasUpdated });
          clearRecovery(doomed);
        } else if (doomed) {
          clearRecovery(doomed);
        }
        if (!doomed) {
          safeRemove("TextCove-current");
          currentNote = ""; shownNote = ""; dirty = false;
          title.value = "";
          content.value = "";
          if (previewOpen && !isSplitView()) togglePreview(false);
          updateCounters();
          setStatus("saved", "Ready");
          renderNoteList();
          deleteRunning = false;
          return;
        }
        return openNextAfterDelete(doomed, doomedVal !== "");
      };
      if (doomed) { idbDel(doomed).then(done).catch(done); }
      else done();
  });

  settings.addEventListener("click", function() {
    this.classList.toggle("settings-btn--active");
    setMenu.classList.toggle("settings-menu--open");
    notesBtn.classList.remove("notes-btn--active");
    notesMenu.classList.remove("notes-menu--open");
  });

  notesBtn.addEventListener("click", function() {
    this.classList.toggle("notes-btn--active");
    notesMenu.classList.toggle("notes-menu--open");
    setMenu.classList.remove("settings-menu--open");
    settings.classList.remove("settings-btn--active");
    refreshNames().then(renderNoteList).catch(renderNoteList);
  });

  if (tagFilter) tagFilter.addEventListener("change", function() {
    renderNoteList();
  });

  if (tagInput) {
    tagInput.addEventListener("input", function() {
      showSuggestions(this.value.trim());
    });
    tagInput.addEventListener("keydown", function(e) {
      if (!tagSuggestions || tagSuggestions.hidden) {
        if (e.key === "Enter" || e.key === ",") {
          e.preventDefault();
          addCurrentTag();
        }
        return;
      }
      const items = tagSuggestions.querySelectorAll(".tag-suggest-item");
      if (e.key === "ArrowDown") {
        e.preventDefault();
        suggestIndex = Math.min(suggestIndex + 1, items.length - 1);
        items.forEach(function(el, i) { el.classList.toggle("is-active", i === suggestIndex); });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        suggestIndex = Math.max(suggestIndex - 1, 0);
        items.forEach(function(el, i) { el.classList.toggle("is-active", i === suggestIndex); });
      } else if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (suggestIndex >= 0 && items[suggestIndex]) {
          applySuggestedTag(items[suggestIndex].getAttribute("data-tag"));
        } else {
          addCurrentTag();
        }
      } else if (e.key === "Escape") {
        hideSuggestions();
      }
    });
    tagInput.addEventListener("blur", function() {
      setTimeout(hideSuggestions, 150);
    });
  }

  newNote.addEventListener("click", createNewNote);

  fs.addEventListener("input", function() {
    const val = fs.value;
    content.style.fontSize = val + "em";
    if (previewOpen) preview.style.fontSize = val + "em";
    textSettings();
  });

  lh.addEventListener("input", function() {
    const val = lh.value;
    content.style.lineHeight = val;
    if (previewOpen) preview.style.lineHeight = val;
    textSettings();
  });

  lw.addEventListener("input", function() {
    const val = String(clampLineWidth(lw.value));
    content.style.paddingLeft = val + "em";
    content.style.paddingRight = val + "em";
    textSettings();
  });

  if (fontPick) {
    fontPick.addEventListener("change", function() {
      const stack = fontStackFor(fontPick.value);
      content.style.fontFamily = stack;
      preview.style.fontFamily = stack;
      textSettings();
    });
  }

  theme.addEventListener("click", function() {
    safeSet("TextCove-theme", currentThemeMode() === "night" ? "light" : "night");
    applyTheme();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", function() {
      resetTextSettings();
    });
  }

  saveStatus.addEventListener("click", function() {
    if (saveStatus.textContent.indexOf("undo") !== -1 && (lastTrash || getTrash().length)) undoLastDelete();
    else if (saveStatus.textContent.indexOf("Export") !== -1) exportData();
  });
  try { storeStatus.addEventListener("click", function() { exportData(); }); } catch (err) {}
  try { storeStatus.style.cursor = "pointer"; } catch (err) {}
  saveStatus.style.cursor = "pointer";
  saveStatus.dataset.tooltip = "Click to undo delete when available";
  try { if (trashToggle) trashToggle.addEventListener("click", function() { renderTrash(); trashList.hidden = !trashList.hidden; }); } catch (err) {}
  try { if (trashEmpty) trashEmpty.addEventListener("click", function() { showConfirm("Empty trash forever?", { ok: "YES", cancel: "NO" }).then(function(yes) { if (yes) { setTrash([]); lastTrash = null; } }); }); } catch (err) {}

  document.addEventListener("click", function(e) {
    const inNotes = notesMenu.contains(e.target) || notesBtn.contains(e.target);
    const inSettings = setMenu.contains(e.target) || settings.contains(e.target);
    if (!inNotes) {
      notesMenu.classList.remove("notes-menu--open");
      notesBtn.classList.remove("notes-btn--active");
    }
    if (!inSettings) {
      setMenu.classList.remove("settings-menu--open");
      settings.classList.remove("settings-btn--active");
    }
  });

  content.addEventListener("click", function() {
    setMenu.classList.remove("settings-menu--open");
    settings.classList.remove("settings-btn--active");
    notesMenu.classList.remove("notes-menu--open");
    notesBtn.classList.remove("notes-btn--active");
  });

  start.addEventListener("click", function() {
    safeSet("TextCove-seen", "1");
    home.classList.remove("active");
    content.focus();
  });

  info.addEventListener("click", function() {
    home.classList.add("active");
  });

  exportBtn.addEventListener("click", function() {
    setMenu.classList.remove("settings-menu--open");
    settings.classList.remove("settings-btn--active");
    exportData();
  });

  importBtn.addEventListener("click", function() {
    setMenu.classList.remove("settings-menu--open");
    settings.classList.remove("settings-btn--active");
    fileInput.click();
  });

  fileInput.addEventListener("change", function() {
    handleImportFile(fileInput.files[0]);
    fileInput.value = "";
  });

  document.addEventListener("dragover", function(e) {
    e.preventDefault();
  });

  document.addEventListener("drop", function(e) {
    if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
    e.preventDefault();
    handleDroppedFile(e.dataTransfer.files[0]);
  });

  previewBtn.addEventListener("click", function() {
    togglePreview();
  });

  window.addEventListener("beforeprint", function() {
    try {
      if (printTitle) printTitle.textContent = title.value || currentNote || "TextCove";
    } catch (err) {}
  });

  copyBtn.addEventListener("click", function() {
    if (content.value === "") {
      showAlert("There is nothing to copy yet. Write something first.");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(content.value).then(function() {
        setStatus("saved", "Copied to clipboard");
      }).catch(function() {
        content.focus();
        content.select();
        showAlert("Copy failed. Please press Ctrl+C to copy the selected text.");
      });
    } else {
      content.focus();
      content.select();
      showAlert("Copy is not available. Please press Ctrl+C to copy the selected text.");
    }
  });

  try {
    if (!safeGet("TextCove-seen")) home.classList.add("active");
    else home.classList.remove("active");
  } catch (err) {}

  // Custom tooltip (YouTube-style) for elements carrying title/data-tooltip.
  const appTooltip = document.getElementById("appTooltip");
  let tooltipTimer = null;
  let tooltipTarget = null;
  function positionTooltip(el) {
    if (!appTooltip) return;
    const rect = el.getBoundingClientRect();
    const tw = appTooltip.offsetWidth;
    const th = appTooltip.offsetHeight;
    let left = rect.left + (rect.width - tw) / 2;
    let top = rect.top - th - 8;
    if (left < 8) left = 8;
    if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8;
    if (top < 8) top = rect.bottom + 8;
    appTooltip.style.left = left + "px";
    appTooltip.style.top = top + "px";
  }
  function showTooltipFor(el) {
    if (!appTooltip || !el) return;
    const text = el.getAttribute("data-tooltip") || el.getAttribute("title") || "";
    if (!text) return;
    tooltipTarget = el;
    if (tooltipTimer) clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(function() {
      if (tooltipTarget !== el) return;
      appTooltip.textContent = text;
      appTooltip.removeAttribute("hidden");
      void appTooltip.offsetWidth;
      positionTooltip(el);
      appTooltip.classList.add("is-visible");
    }, 300);
  }
  function hideTooltipNow() {
    tooltipTarget = null;
    if (tooltipTimer) { clearTimeout(tooltipTimer); tooltipTimer = null; }
    if (appTooltip) {
      appTooltip.classList.remove("is-visible");
      setTimeout(function() { if (appTooltip && !appTooltip.classList.contains("is-visible")) appTooltip.hidden = true; }, 120);
    }
  }
  function bindTooltipTo(el) {
    if (!el || el._tooltipBound) return;
    const text = el.getAttribute("data-tooltip") || el.getAttribute("title");
    if (!text) return;
    if (el.getAttribute("title") && !el.getAttribute("data-tooltip")) {
      el.setAttribute("data-tooltip", el.getAttribute("title"));
      el.removeAttribute("title");
    }
    el._tooltipBound = true;
  }
  function bindTooltipTree(root) {
    if (!root || !root.querySelectorAll) return;
    const nodes = root.querySelectorAll("[title], [data-tooltip]");
    nodes.forEach(bindTooltipTo);
    const btns = root.querySelectorAll("button[aria-label], a[aria-label], [role='button'][aria-label]");
    btns.forEach(function(b) {
      if (b.getAttribute("data-tooltip")) return;
      const label = b.getAttribute("aria-label");
      if (label) {
        b.setAttribute("data-tooltip", label);
        bindTooltipTo(b);
      }
    });
  }
  function tooltipTargetFor(node) {
    if (!node || !node.closest) return null;
    return node.closest("[data-tooltip]");
  }
  document.addEventListener("mouseover", function(e) {
    const t = tooltipTargetFor(e.target);
    if (t) showTooltipFor(t);
    else hideTooltipNow();
  });
  document.addEventListener("mouseout", function(e) {
    const t = tooltipTargetFor(e.target);
    const rt = tooltipTargetFor(e.relatedTarget);
    if (rt !== tooltipTarget) hideTooltipNow();
  });
  document.addEventListener("focusin", function(e) {
    const t = tooltipTargetFor(e.target);
    if (t) showTooltipFor(t);
  });
  document.addEventListener("focusout", function(e) {
    const rt = tooltipTargetFor(e.relatedTarget);
    if (rt !== tooltipTarget) hideTooltipNow();
  });

  bindTooltipTree(document);
  try {
    const mo = new MutationObserver(function(muts) {
      muts.forEach(function(m) {
        m.addedNodes.forEach(function(n) {
          if (n.nodeType === 1) bindTooltipTree(n);
        });
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (err) {}

  const mdHint = document.getElementById("mdHint");
  const mdHintTry = document.getElementById("mdHintTry");
  const mdHintDismiss = document.getElementById("mdHintDismiss");
  function looksLikeMarkdown(text) {
    const t = (text || "").trim();
    if (t.length < 8) return false;
    return (
      /^#{1,6}\s/m.test(t) ||
      /```/.test(t) ||
      /\*\*[^*]+\*\*/.test(t) ||
      /~~[^~]+~~/.test(t) ||
      /^\s*[-*+]\s/m.test(t) ||
      /^\s*\d+\.\s/m.test(t) ||
      /^>\s/m.test(t) ||
      /\[[^\]]+\]\([^)]+\)/.test(t)
    );
  }
  function setMdHintVisible(on) {
    if (!mdHint) return;
    mdHint.classList.toggle("is-visible", !!on);
    mdHint.setAttribute("aria-hidden", on ? "false" : "true");
  }
  let mdHintTimer = null;
  function updateMdHint() {
    if (!mdHint) return;
    const text = content.value || "";
    if (previewOpen || !looksLikeMarkdown(text)) {
      setMdHintVisible(false);
      return;
    }
    setMdHintVisible(true);
  }
  if (content) {
    content.addEventListener("input", function() {
      const text = content.value || "";
      if (!looksLikeMarkdown(text)) {
        setMdHintVisible(false);
        if (mdHintTimer) { clearTimeout(mdHintTimer); mdHintTimer = null; }
        return;
      }
      if (mdHintTimer) clearTimeout(mdHintTimer);
      mdHintTimer = setTimeout(updateMdHint, 600);
    });
  }
  if (mdHintTry) {
    mdHintTry.addEventListener("click", function() {
      togglePreview(true);
      setMdHintVisible(false);
    });
  }
  function dismissMdHint() {
    if (mdHintTimer) { clearTimeout(mdHintTimer); mdHintTimer = null; }
    setMdHintVisible(false);
  }
  if (mdHintDismiss) {
    mdHintDismiss.addEventListener("click", function(e) {
      e.stopPropagation();
      dismissMdHint();
    });
  }
  if (mdHint) {
    mdHint.addEventListener("click", function(e) {
      if (e.target === mdHint || e.target.tagName === "SPAN") dismissMdHint();
    });
  }
  // also re-evaluate when preview toggles
  const _togglePreviewOrig = togglePreview;
  // wrap not needed; updateMdHint called via input. Call once after load.
  setTimeout(updateMdHint, 1000);

  try { window.addEventListener("resize", function() { applyLayout(); if (previewOpen) refreshPreview(); }); } catch (err) {}
  applyTheme();

  updateCounters();
});
