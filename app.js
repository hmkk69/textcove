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
  const noteList = document.getElementById("noteList");
  const newNote = document.getElementById("newNote");
  const searchInput = document.getElementById("noteSearch");
  const sortSelect = document.getElementById("noteSort");
  const fs = document.getElementById("fs");
  const lh = document.getElementById("lh");
  const lw = document.getElementById("lw");
  const theme = document.getElementById("theme");
  const reset = document.getElementById("reset");
  const info = document.getElementById("info");
  const chars = document.getElementById("charCounter");
  const words = document.getElementById("wordCounter");
  const saveStatus = document.getElementById("saveStatus");
  const exportBtn = document.getElementById("exportData");
  const importBtn = document.getElementById("importData");
  const fileInput = document.getElementById("fileInput");
  const previewBtn = document.getElementById("previewToggle");
  const preview = document.getElementById("preview");
  const previewBody = document.getElementById("previewBody");
  const copyBtn = document.getElementById("copyNote");
  const dialog = document.getElementById("appDialog");
  const dialogMessage = document.getElementById("dialogMessage");
  const dialogInput = document.getElementById("dialogInput");
  const dialogOk = document.getElementById("dialogOk");
  const dialogCancel = document.getElementById("dialogCancel");

  let dialogResolve = null;

  function finishDialog(value) {
    if (dialog.open) dialog.close();
    const resolve = dialogResolve;
    dialogResolve = null;
    if (resolve) resolve(value);
  }

  function openDialog(mode, message, options) {
    const opts = options || {};
    return new Promise(function(resolve) {
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
    const counter = countText(content.value);
    words.textContent = counter.words + " words";
    chars.textContent = counter.all + " chars";
  }

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (err) { return null; }
  }

  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      return false;
    }
  }

  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (err) {}
  }

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

  function setStatus(state, text) {
    saveStatus.dataset.state = state;
    saveStatus.textContent = text;
  }

  function markSaving() {
    setStatus("saving", "Saving...");
  }

  function markSaved() {
    setStatus("saved", "Saved \u2022 " + formatTime(Date.now()));
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

  const notesPrefix = "SimpleJot-note:";
  const recoveryPrefix = "SimpleJot-recovery:";
  const noteExportVersion = "1.0";
  const defaultNoteBase = "New note";
  const pinKey = "SimpleJot-pins";
  const metaKey = "SimpleJot-meta";
  let currentNote = "";
  const idbName = "SimpleJot";
  const idbStore = "notes";
  const SAVE_DELAY = 250;
  const recoveryThrottle = 1500;
  let _dbPromise = null;
  let namesCache = [];
  let saveTimer = null;
  let lastRecoveryWrite = 0;
  let listToken = 0;
  let previewOpen = false;
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
    meta[name] = Date.now();
    saveMeta();
  }

  let useIdb = typeof indexedDB !== "undefined";

  function lsKeys() {
    const keys = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.indexOf(notesPrefix) === 0) keys.push(key.slice(notesPrefix.length));
      }
    } catch (err) {}
    return keys;
  }

  function lsGetItem(name) {
    try {
      const v = localStorage.getItem(notesPrefix + name);
      return v === null ? null : v;
    } catch (err) {
      return null;
    }
  }

  function lsPutItem(name, value) {
    try {
      localStorage.setItem(notesPrefix + name, value || "");
    } catch (err) {
      return Promise.reject(err);
    }
    if (namesCache.indexOf(name) === -1) namesCache.push(name);
    touchMeta(name);
    return Promise.resolve();
  }

  function lsDelItem(name) {
    try {
      localStorage.removeItem(notesPrefix + name);
    } catch (err) {}
    dropFromCaches(name);
    return Promise.resolve();
  }

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

  function idbPut(name, value) {
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
    if (!useIdb) return lsDelItem(name);
    return idbTx("readwrite", function(s) { return s.delete(name); }).then(function() {
      dropFromCaches(name);
    }).catch(function(err) {
      if (isQuotaError(err)) throw err;
      useIdb = false;
      return lsDelItem(name);
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

  function flushSave() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    if (!currentNote) return Promise.resolve();
    const val = content.value;
    return idbPut(currentNote, val).then(function() {
      clearRecovery(currentNote);
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
    markSaving();
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, SAVE_DELAY);
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

  function ensureCurrentNote() {
    if (currentNote) return Promise.resolve(currentNote);
    const autoName = generateNoteName(defaultNoteBase);
    currentNote = autoName;
    safeSet("SimpleJot-current", autoName);
    title.value = autoName;
    return idbPut(autoName, content.value).then(function() {
      markSaved();
      renderNoteList();
      return autoName;
    }).catch(function(err) {
      if (isQuotaError(err)) markError("Save failed: storage is full");
      return autoName;
    });
  }

  let openSeq = 0;

  function openNote(name) {
    const mySeq = ++openSeq;
    const prevName = currentNote;
    const prevVal = content.value;
    if (prevName && prevName !== name) {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      idbPut(prevName, prevVal).then(function() {
        clearRecovery(prevName);
      }).catch(function() {
        safeSet(recoveryPrefix + prevName, prevVal);
      });
    } else if (saveTimer) {
      clearTimeout(saveTimer); saveTimer = null;
    }
    currentNote = name;
    safeSet("SimpleJot-current", name);
    title.value = name;
    if (previewOpen) togglePreview(false);
    let rec = null;
    try { rec = localStorage.getItem(recoveryPrefix + name); } catch (err) {}
    if (rec !== null && rec !== undefined) {
      content.value = rec;
      updateCounters();
      idbPut(name, rec).then(function() { clearRecovery(name); }).catch(function() {});
      markSaved();
      renderNoteList();
      return Promise.resolve(name);
    }
    return idbGet(name).then(function(v) {
      if (mySeq !== openSeq || currentNote !== name) return;
      content.value = (v === null || v === undefined) ? "" : v;
      updateCounters();
      renderNoteList();
    }).catch(function() {
      if (mySeq !== openSeq || currentNote !== name) return;
      content.value = "";
      updateCounters();
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
    const firstLine = String(text === null || text === undefined ? "" : text).split("\n")[0].trim().slice(0, 60);
    return firstLine === "" ? "Empty note" : firstLine;
  }

  function renderNoteList() {
    const q = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const myToken = ++listToken;
    const paint = function(all) {
      if (myToken !== listToken) return;
      noteList.innerHTML = "";
      let names = sortedNames(getNoteNames());
      if (q !== "") {
        names = names.filter(function(n) {
          if (n.toLowerCase().indexOf(q) !== -1) return true;
          const body = (n === currentNote) ? content.value : (all[n] || "");
          return String(body).toLowerCase().indexOf(q) !== -1;
        });
      }
      if (!names.length) {
        const empty = document.createElement("li");
        empty.className = "notes-empty";
        empty.textContent = q ? "No notes match your search." : "No notes yet.";
        noteList.appendChild(empty);
        return;
      }
      names.forEach(function(name) {
        const li = document.createElement("li");
        if (name === currentNote) li.className = "note--current";
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
        pinBtn.title = pins.indexOf(name) !== -1 ? "Unpin note" : "Pin note";
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
        delBtn.title = "Delete note";
        delBtn.setAttribute("aria-label", "Delete note " + name);
        delBtn.setAttribute("data-note", name);
        delBtn.textContent = "\u00d7";
        delBtn.addEventListener("click", function() {
          trashNote(this.getAttribute("data-note"));
        });
        li.appendChild(main);
        li.appendChild(pinBtn);
        li.appendChild(delBtn);
        noteList.appendChild(li);
      });
    };
    idbGetAll().then(paint).catch(function() {
      const fallback = {};
      if (currentNote) fallback[currentNote] = content.value;
      paint(fallback);
    });
  }

  function trashNote(name) {
    showConfirm("Delete note \u201c" + name + "\u201d? It will be removed from this browser.", { ok: "YES", cancel: "NO" }).then(function(yes) {
      if (!yes) return;
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      idbGet(name).then(function(v) {
        lastTrash = { name: name, value: String(v === null || v === undefined ? "" : v), pin: pins.indexOf(name) !== -1, updated: meta[name] || 0 };
      }).catch(function() {
        lastTrash = { name: name, value: "", pin: false, updated: 0 };
      }).then(function() {
        return idbDel(name);
      }).then(function() {
        clearRecovery(name);
        if (name === currentNote) {
          currentNote = "";
          safeRemove("SimpleJot-current");
          title.value = "";
          content.value = "";
          updateCounters();
        }
        setStatus("saved", "Deleted \u201c" + name + "\u201d \u2022 click here to undo");
        renderNoteList();
      }).catch(function() {
        renderNoteList();
      });
    });
  }

  function migrateFromLocalStorage() {
    const batch = [];
    try {
      if (localStorage.getItem("SimpleJot-title") !== null || localStorage.getItem("SimpleJot-content") !== null) {
        const legacyTitle = localStorage.getItem("SimpleJot-title") || "Untitled";
        const legacyContent = localStorage.getItem("SimpleJot-content") || "";
        batch.push({ k: legacyTitle, v: legacyContent });
        localStorage.removeItem("SimpleJot-title");
        localStorage.removeItem("SimpleJot-content");
        safeSet("SimpleJot-current", legacyTitle);
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
        toRemove.forEach(function(k) { safeRemove(k); });
        safeSet("SimpleJot-migrated-idb-v1", "1");
      });
    } catch (err) { return Promise.resolve(); }
  }

  function inlineMd(s) {
    let out = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|\W)\*([^*\n]+)\*/g, "$1<em>$2</em>");
    out = out.replace(/(^|\W)_([^_\n]+)_/g, "$1<em>$2</em>");
    out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, "<a href=\"$2\" target=\"_blank\" rel=\"noopener\">$1</a>");
    return out;
  }

  function renderMarkdown(src) {
    const lines = escapeHtml(src).split("\n");
    let html = "";
    let inList = false;
    let inCode = false;
    const closeList = function() {
      if (inList) {
        html += "</ul>";
        inList = false;
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
      const heading = /^(#{1,6})\s+(.*)/.exec(line);
      if (heading) {
        closeList();
        const level = heading[1].length;
        html += "<h" + level + ">" + inlineMd(heading[2]) + "</h" + level + ">";
        continue;
      }
      const task = /^\s*-\s+\[([ xX])\]\s+(.*)/.exec(line);
      if (task) {
        if (!inList) { html += "<ul>"; inList = true; }
        const checked = task[1].toLowerCase() === "x" ? " checked disabled" : " disabled";
        html += "<li class=\"task\"><input type=\"checkbox\"" + checked + "><span>" + inlineMd(task[2]) + "</span></li>";
        continue;
      }
      const bullet = /^\s*-\s+(.*)/.exec(line);
      if (bullet) {
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

  function togglePreview(force) {
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
    const keys = Object.keys(noteObj).slice(0, MAX_IMPORT_NOTES);
    if (Object.keys(noteObj).length > MAX_IMPORT_NOTES) {
      showAlert("Backup has too many notes. Only the first " + MAX_IMPORT_NOTES + " will be imported.");
    }
    let chain = Promise.resolve();
    keys.forEach(function(key) {
      chain = chain.then(function() {
        const raw = String(noteObj[key] === null || noteObj[key] === undefined ? "" : noteObj[key]);
        const value = raw.length > MAX_TEXT_LEN ? raw.slice(0, MAX_TEXT_LEN) : raw;
        const cleanKey = sanitizeFileName(key);
        let noteName;
        if (key && key.trim() !== "") {
          noteName = getNoteNames().indexOf(cleanKey) !== -1 ? generateNoteName(cleanKey) : cleanKey;
        } else {
          noteName = generateNoteName(defaultNoteBase);
        }
        return idbPut(noteName, value).then(function() { importedCount++; });
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
    if (file.size && file.size > MAX_FILE_SIZE) {
      showAlert("File is too large (max 5MB), so nothing was imported.");
      return;
    }
    readFileAsText(file).then(function(text) {
      if (String(text).length > MAX_TEXT_LEN) {
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
    if (file.size && file.size > MAX_FILE_SIZE) {
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
      if (str.length > MAX_TEXT_LEN) {
        showAlert("File is too large (max ~1M characters).");
        return;
      }
      const rawBase = name.replace(/\.[a-z0-9]+$/i, "") || defaultNoteBase;
      const base = sanitizeFileName(rawBase);
      const noteName = getNoteNames().indexOf(base) !== -1 ? generateNoteName(base) : base;
      const prevName = currentNote;
      const prevVal = content.value;
      if (prevName) {
        if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
        idbPut(prevName, prevVal).catch(function() {});
      }
      currentNote = noteName;
      safeSet("SimpleJot-current", noteName);
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
      const exportObj = {
        version: noteExportVersion,
        exportedAt: new Date().toISOString(),
        notes: notes
      };
      const exportStr = JSON.stringify(exportObj, null, 2);
      downloadBlob(new Blob([exportStr], { type: "application/json;charset=utf-8" }), "simplejot-export-" + Date.now() + ".json");
    }).catch(function(err) {
      if (isQuotaError(err)) showAlert("Storage is full, so the export could not be prepared.");
    });
  }

  function createNewNote() {
    const prevName = currentNote;
    const prevVal = content.value;
    if (prevName) {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      idbPut(prevName, prevVal).then(function() { clearRecovery(prevName); }).catch(function() {
        safeSet(recoveryPrefix + prevName, prevVal);
      });
    }
    const autoName = generateNoteName(defaultNoteBase);
    currentNote = autoName;
    safeSet("SimpleJot-current", autoName);
    title.value = autoName;
    content.value = "";
    if (previewOpen) togglePreview(false);
    updateCounters();
    setStatus("ready", "Ready");
    idbPut(autoName, "").then(function() {
      markSaved();
      renderNoteList();
    }).catch(function(err) {
      if (isQuotaError(err)) markError("Save failed: storage is full");
      renderNoteList();
    });
    notesMenu.classList.remove("notes-menu--open");
    notesBtn.classList.remove("notes-btn--active");
    content.focus();
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
      showAlert("A note named \u201c" + newName + "\u201d already exists. Please choose another name.");
      title.value = currentNote;
      title.focus();
      return;
    }
    const oldName = currentNote;
    const val = content.value;
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    currentNote = newName;
    safeSet("SimpleJot-current", newName);
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
        currentNote = oldName;
        title.value = oldName || "";
        safeSet("SimpleJot-current", oldName || "");
      }
    });
  }

  var MAX_LINE_PADDING_EM = 12;
  var MAX_FILE_SIZE = 5 * 1024 * 1024;
  var MAX_TEXT_LEN = 1000000;
  var MAX_IMPORT_NOTES = 200;
  var lastTrash = null;

  function clampLineWidth(v) {
    const n = parseFloat(v);
    if (isNaN(n)) return 10;
    return Math.min(MAX_LINE_PADDING_EM, Math.max(1, n));
  }

  function sanitizeFileName(name) {
    const cleaned = String(name || "").replace(/[\\/:*?"<>|]/g, "-").trim().slice(0, 120);
    return cleaned || defaultNoteBase;
  }

  function undoLastDelete() {
    if (!lastTrash) {
      showAlert("Nothing to undo.");
      return Promise.resolve(false);
    }
    const t = lastTrash;
    lastTrash = null;
    const target = getNoteNames().indexOf(t.name) !== -1 ? generateNoteName(t.name) : t.name;
    return idbPut(target, t.value).then(function() {
      if (t.pin && pins.indexOf(target) === -1) {
        pins.push(target);
        savePins();
      }
      if (t.updated) {
        meta[target] = t.updated;
        saveMeta();
      }
      if (!currentNote) {
        return openNote(target);
      }
      renderNoteList();
      setStatus("saved", "Undo: restored \u201c" + target + "\u201d");
      return true;
    }).catch(function() {
      showAlert("Undo failed. Storage may be full.");
      return false;
    });
  }

  function textSettings() {
    const fsValue = fs.value;
    const lhValue = lh.value;
    const lwValue = String(clampLineWidth(lw.value));
    const settingValues = "font-size:" + fsValue + "em;line-height:" + lhValue + ";padding-left:" + lwValue + "em;padding-right:" + lwValue + "em;";
    content.style.fontSize = fsValue + "em";
    content.style.lineHeight = String(lhValue);
    content.style.paddingLeft = lwValue + "em";
    content.style.paddingRight = lwValue + "em";
    if (previewOpen) {
      preview.style.fontSize = fsValue + "em";
      preview.style.lineHeight = String(lhValue);
      preview.style.paddingLeft = lwValue + "em";
      preview.style.paddingRight = lwValue + "em";
    }
    safeSet("SimpleJot-settings", settingValues);
    safeSet("SimpleJot-settings-fs", fsValue);
    safeSet("SimpleJot-settings-lh", lhValue);
    safeSet("SimpleJot-settings-lw", lwValue);
  }

  function applyStoredSettings() {
    const fsv = safeGet("SimpleJot-settings-fs");
    if (fsv) fs.value = fsv;
    const lhv = safeGet("SimpleJot-settings-lh");
    if (lhv) lh.value = lhv;
    const lwv = safeGet("SimpleJot-settings-lw");
    if (lwv) lw.value = lwv;
    const stored = safeGet("SimpleJot-settings");
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

  const rootEl = document.documentElement;

  function currentThemeMode() {
    return safeGet("SimpleJot-theme") === "night" ? "night" : "light";
  }

  function applyTheme() {
    const night = currentThemeMode() === "night";
    rootEl.classList.toggle("night", night);
    if (theme) {
      theme.title = night ? "Switch to light theme" : "Switch to dark theme";
      theme.setAttribute("aria-label", night ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  if (hasStorage() === true) {
    try {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function() {});
    } catch (err) {}

    applyTheme();

    applyStoredSettings();

    content.addEventListener("input", function() {
      updateCounters();
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
        setMenu.classList.remove("settings-menu--open");
        settings.classList.remove("settings-btn--active");
        notesMenu.classList.remove("notes-menu--open");
        notesBtn.classList.remove("notes-btn--active");
        notesBtn.setAttribute("aria-expanded", "false");
        settings.setAttribute("aria-expanded", "false");
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
      flushSave();
    }

    document.addEventListener("visibilitychange", function() {
      if (document.hidden) handleHide();
    });
    window.addEventListener("pagehide", handleHide);
    window.addEventListener("beforeunload", function() { writeRecoverySync(); });

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
      searchInput.addEventListener("input", renderNoteList);
    }
    if (sortSelect) {
      const storedSort = safeGet("SimpleJot-sort");
      if (storedSort === "name" || storedSort === "updated") sortSelect.value = storedSort;
      sortSelect.addEventListener("change", function() {
        safeSet("SimpleJot-sort", sortSelect.value);
        renderNoteList();
      });
    }

    function bootFromIDB() {
      const migrated = safeGet("SimpleJot-migrated-idb-v1");
      const startP = migrated ? Promise.resolve() : migrateFromLocalStorage();
      return startP.then(refreshNames).then(function() {
        const unnamed = getNoteNames().filter(function(n) { return n.trim() === ""; });
        let chain = Promise.resolve();
        unnamed.forEach(function(bad) {
          chain = chain.then(function() {
            const fixedName = generateNoteName(defaultNoteBase);
            return idbGet(bad).then(function(v) {
              return idbPut(fixedName, v || "").then(function() { return idbDel(bad); }).then(function() {
                if (safeGet("SimpleJot-current") === bad) safeSet("SimpleJot-current", fixedName);
                clearRecovery(bad);
              });
            });
          });
        });
        return chain;
      }).then(refreshNames).then(function() {
        if (!getNoteNames().length) {
          const firstNote = generateNoteName(defaultNoteBase);
          return idbPut(firstNote, "").then(function() {
            safeSet("SimpleJot-current", firstNote);
          }).then(refreshNames);
        }
      }).then(function() {
        let wanted = null;
        try {
          const params = new URLSearchParams(window.location.search);
          wanted = params.get("share") || params.get("note");
        } catch (err) {}
        const savedNote = safeGet("SimpleJot-current");
        if (wanted && getNoteNames().indexOf(wanted) !== -1) {
          return openNote(wanted);
        } else if (savedNote !== null && getNoteNames().indexOf(savedNote) !== -1) {
          return openNote(savedNote);
        } else if (getNoteNames().length) {
          return openNote(sortedNames(getNoteNames())[0]);
        }
      }).then(function() {
        renderNoteList();
        setStatus("ready", "Ready");
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

    bootFromIDB();
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
        const finalName = getNoteNames().indexOf(existingName) !== -1 ? generateNoteName(existingName) : existingName;
        currentNote = finalName;
        safeSet("SimpleJot-current", finalName);
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
        finalName = generateNoteName(finalName);
      }
      const oldName = currentNote;
      const val = content.value;
      currentNote = finalName;
      safeSet("SimpleJot-current", finalName);
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

  clear.addEventListener("click", function() {
    if (content.value === "" && title.value === "") {
      showAlert("There is nothing to delete. Go ahead and write something first.");
      return;
    }
    const doomedLabel = currentNote || title.value.trim() || "this note";
    showConfirm("Delete \u201c" + doomedLabel + "\u201d? It will be removed from this browser.", { ok: "YES", cancel: "NO" }).then(function(yes) {
      if (!yes) return;
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      const doomed = currentNote;
      const doomedVal = content.value;
      const wasPinned = doomed ? pins.indexOf(doomed) !== -1 : false;
      const wasUpdated = doomed ? (meta[doomed] || 0) : 0;
      const done = function() {
        if (doomed) {
          lastTrash = { name: doomed, value: doomedVal, pin: wasPinned, updated: wasUpdated };
          clearRecovery(doomed);
        }
        safeRemove("SimpleJot-current");
        currentNote = "";
        title.value = "";
        content.value = "";
        if (previewOpen) togglePreview(false);
        updateCounters();
        setStatus("saved", doomed ? "Deleted \u201c" + doomed + "\u201d \u2022 click here to undo" : "Ready");
        renderNoteList();
      };
      if (doomed) { idbDel(doomed).then(done).catch(done); }
      else done();
    });
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

  theme.addEventListener("click", function() {
    safeSet("SimpleJot-theme", currentThemeMode() === "night" ? "light" : "night");
    applyTheme();
  });

  reset.addEventListener("click", function() {
    safeRemove("SimpleJot-settings");
    safeRemove("SimpleJot-settings-fs");
    safeRemove("SimpleJot-settings-lh");
    safeRemove("SimpleJot-settings-lw");
    content.removeAttribute("style");
    preview.removeAttribute("style");
    fs.value = 1;
    lh.value = 1.9;
    lw.value = 10;
  });

  saveStatus.addEventListener("click", function() {
    if (saveStatus.textContent.indexOf("undo") !== -1 && lastTrash) {
      undoLastDelete();
    }
  });
  saveStatus.style.cursor = "pointer";
  saveStatus.title = "Click to undo delete when available";

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
    safeSet("SimpleJot-seen", "1");
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
    if (!safeGet("SimpleJot-seen")) home.classList.add("active");
    else home.classList.remove("active");
  } catch (err) {}
  applyTheme();

  updateCounters();
});
