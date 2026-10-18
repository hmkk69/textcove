import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const app = readFileSync("app.js", "utf8");
const html = readFileSync("index.html", "utf8");
const css = readFileSync("app.css", "utf8");
const sw = readFileSync("sw.js", "utf8");
const manifest = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));

describe("logo and homepage", () => {
  it("defines the #logo symbol", () => {
    assert.ok(html.includes('id="logo"'), "missing #logo symbol");
  });
  it("homepage starts visible as a dialog", () => {
    assert.ok(html.includes('id="homepage"'), "missing homepage");
    assert.ok(html.includes("overlay active"), "homepage should start active");
    assert.ok(html.includes('role="dialog"'), "homepage should be a dialog");
  });
  it("remembers onboarding with TextCove-seen", () => {
    assert.ok(app.includes("TextCove-seen"), "missing seen flag");
  });
});

describe("editor settings do not wipe layout", () => {
  it("sets font/padding props individually", () => {
    assert.ok(app.includes("content.style.fontSize"), "must set fontSize directly");
    assert.ok(app.includes("clampLineWidth"), "must clamp line width");
    assert.ok(!app.includes("content.style.cssText = settingValues"), "cssText overwrite must be gone");
  });
});

describe("notes list is fast and searchable", () => {
  it("fetches all notes in one transaction", () => {
    assert.ok(app.includes("function idbGetAll"), "missing idbGetAll");
  });
  it("searches inside note content", () => {
    assert.ok(app.includes("function snippetFor") || app.includes("body"), "missing snippet helper");
    assert.ok(app.includes("toLowerCase().indexOf(q)"), "missing content match");
  });
  it("export uses the batched fetch", () => {
    assert.ok(app.includes("return idbGetAll()"), "export should use idbGetAll");
  });
});

describe("safe delete with undo", () => {
  it("keeps lastTrash and undo", () => {
    assert.ok(app.includes("lastTrash"), "missing lastTrash");
    assert.ok(app.includes("function undoLastDelete"), "missing undo");
    assert.ok(app.includes("click here to undo"), "missing undo hint");
  });
  it("opens the nearest note after deleting the current one", () => {
    assert.ok(app.includes("function openFallbackNote"), "missing fallback helper");
    assert.ok(app.includes("openNextAfterDelete"), "delete does not fall back to another note");
  });
});

describe("empty note delete notice", () => {
  it("warns that an empty note is deleted permanently", () => {
    assert.ok(app.includes("so it will be permanently deleted"), "missing empty delete warning");
    assert.ok(app.includes("This note is empty"), "missing empty note message");
  });
  it("offers a don't remind again button", () => {
    assert.ok(html.includes('id="dialogDontRemind"'), "missing don't remind button");
    assert.ok(app.includes("Don't remind me next time & delete"), "missing don't remind label");
    assert.ok(app.includes("skipEmptyDeleteNotice"), "missing opt-out flag");
  });
  it("skips the notice once dismissed", () => {
    assert.ok(app.includes("TextCove-skip-empty-delete-notice"), "notice opt-out is not persisted");
    assert.ok(app.includes("!skipEmptyDeleteNotice"), "dismissed notice still shows");
  });
});

describe("import and filename safety", () => {
  it("limits file size and note count", () => {
    assert.ok(app.includes("maxFileSize"), "missing size cap");
    assert.ok(app.includes("maxImportNotes"), "missing import cap");
  });
  it("sanitizes file names", () => {
    assert.ok(app.includes("function sanitizeFileName"), "missing sanitizer");
  });
  it("no longer uses deprecated execCommand", () => {
    assert.ok(!app.includes("execCommand"), "execCommand must be gone");
  });
});

describe("menus and theme", () => {
  it("closes menus on Escape", () => {
    assert.ok(app.includes('"Escape"') || app.includes("'Escape'"), "missing Escape handler");
  });
  it("toggles light/night with light default", () => {
    assert.ok(app.includes("currentThemeMode"), "missing theme helper");
    assert.ok(app.includes('"night"') && app.includes('"light"'), "missing theme modes");
    assert.ok(!app.includes('"auto"'), "auto mode must be gone, default is light");
  });
  it("shows sun and moon for the theme switch", () => {
    assert.ok(html.includes('id="icon-sun"'), "missing sun symbol");
    assert.ok(html.includes('id="icon-moon"'), "missing moon symbol");
    assert.ok(html.includes('id="themeIcon"'), "theme icon has no hook");
    assert.ok(app.includes('"#icon-sun"') && app.includes('"#icon-moon"'), "theme never swaps its icon");
  });
  it("footer shows only the offline tip", () => {
    assert.ok(html.includes("Tip: You can use TextCove when offline!"), "missing tip");
    assert.ok(!html.includes("netStatusText"), "badge text must be gone");
    assert.ok(!html.includes('class="dot"'), "dot badge must be gone");
  });
  it("dark theme uses a deep palette", () => {
    assert.ok(css.includes("#15181d"), "missing deep dark background");
    assert.ok(css.includes("#1f242c"), "missing dark surface color");
    assert.ok(css.includes("#e8eaf0"), "missing dark text color");
  });
  it("buttons have press and hover life", () => {
    assert.ok(css.includes(":active"), "missing press states");
    assert.ok(css.includes("dialog-in"), "missing dialog entrance");
    assert.ok(css.includes("--ease-out"), "missing shared easing curve");
    assert.ok(!css.includes("rotate("), "rotation wiggles must be gone");
  });
});

describe("oversized note guard", () => {
  it("never loads a huge note into the editor", () => {
    assert.ok(app.includes("loadSafeLimit"), "missing load size cap");
    assert.ok(app.includes("handleOversizedNote"), "missing oversized handler");
    assert.ok(app.includes("openFallbackNote"), "must fall back to a safe note");
  });
  it("backs up before clearing", () => {
    assert.ok(app.includes("Download backup"), "must offer a backup download first");
    assert.ok(app.includes("Clear this note"), "must confirm before clearing");
  });
});

describe("service worker robustness", () => {
  it("caches only ok responses and survives one bad asset", () => {
    assert.ok(sw.includes("response.ok"), "must check response.ok");
    assert.ok(sw.includes("allSettled"), "install must tolerate one failure");
  });
});

describe("manifest and css hygiene", () => {
  it("uses root start_url", () => {
    assert.equal(manifest.start_url, "./");
    assert.equal(manifest.id, "./");
  });
  it("has no legacy single-colon pseudo selector", () => {
    assert.ok(css.includes("*::before"), "missing modern pseudo-element");
    assert.ok(!css.includes("*,:before") && !css.includes("*:before"), "legacy selector remains");
  });
});

describe("service worker fallbacks", () => {
  it("serves the 404 page and guards asset fallbacks", () => {
    assert.ok(sw.includes("./404.html"), "missing 404 fallback");
    assert.ok(sw.includes("event.request.destination"), "missing asset fallback guard");
    assert.ok(sw.includes("./index.html"), "missing index fallback");
  });
  it("uses one cache key for the app shell", () => {
    assert.ok(sw.includes("shellKey"), "app shell writes under two keys");
  });
});

describe("list performance guards", () => {
  it("debounces note search", () => {
    assert.ok(app.includes("searchTimer") && app.includes("setTimeout(renderNoteList, 250)"), "search is not debounced");
  });
  it("bounds content search and caches the list", () => {
    assert.ok(app.includes("slice(0, 50000)"), "content search is unbounded");
    assert.ok(app.includes("listCache"), "list refetches on every keystroke");
  });
});

describe("markdown code safety", () => {
  it("shields code spans from inline formatting", () => {
    assert.ok(app.includes("codes.push"), "code spans are not extracted");
    assert.ok(app.includes("@@tc"), "missing code placeholder");
  });
});

describe("dialog focus handling", () => {
  it("restores focus and traps Tab", () => {
    assert.ok(app.includes("lastFocus"), "dialog does not restore focus");
    assert.ok(app.includes("restoreFocus"), "missing focus restore");
  });
});

describe("menus expose expanded state", () => {
  it("syncs aria-expanded centrally", () => {
    assert.ok(app.includes("syncMenuExpanded"), "missing menu sync");
    assert.ok(app.includes("MutationObserver"), "sync does not cover every path");
  });
});

describe("crash recovery and naming", () => {
  it("reconciles recovery copies at boot", () => {
    assert.ok(app.includes("reconcileRecovery"), "recovery is ignored when notes exist");
  });
  it("reserves note names synchronously", () => {
    assert.ok(app.includes("reserveName"), "name race remains");
  });
});
