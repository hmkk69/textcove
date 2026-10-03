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
  it("remembers onboarding with SimpleJot-seen", () => {
    assert.ok(app.includes("SimpleJot-seen"), "missing seen flag");
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
});

describe("import and filename safety", () => {
  it("limits file size and note count", () => {
    assert.ok(app.includes("MAX_FILE_SIZE"), "missing size cap");
    assert.ok(app.includes("MAX_IMPORT_NOTES"), "missing import cap");
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
  it("footer shows only the offline tip", () => {
    assert.ok(html.includes("Tip: You can use SimpleJot when offline!"), "missing tip");
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
