import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const app = readFileSync("app.js", "utf8");

describe("vendored libraries are gone", () => {
  it("contains no FileSaver code", () => {
    assert.ok(!app.includes("saveAs||"), "FileSaver blob found");
    assert.ok(!app.includes("webkitRequestFileSystem"), "FileSaver blob found");
  });
  it("contains no Smoke dialog code", () => {
    assert.ok(!app.includes("smoke-out-"), "Smoke blob found");
    assert.ok(!app.includes("smoketimeout"), "Smoke blob found");
    assert.ok(!app.match(/(^|[^a-zA-Z])smoke\./), "smoke.* call found");
  });
  it("contains no Countable code", () => {
    assert.ok(!app.includes("Countable"), "Countable reference found");
  });
  it("downloads with a native anchor and Blob URL", () => {
    assert.ok(app.includes("createObjectURL"), "missing createObjectURL");
    assert.ok(app.includes("revokeObjectURL"), "missing revokeObjectURL");
  });
});

describe("correctness fixes", () => {
  it("uses strict mode", () => {
    assert.ok(app.startsWith('"use strict";'), "missing top-level use strict");
  });
  it("declares settings variables instead of leaking globals", () => {
    for (const name of ["fsValue", "lhValue", "settingValues"]) {
      assert.ok(!new RegExp(`^\\s*${name} =`, "m").test(app), `${name} leaks to global scope`);
    }
  });
  it("never saves the placeholder text", () => {
    assert.ok(!app.includes("content.placeholder"), "placeholder is still used as file content");
  });
  it("renders note names with textContent, never innerHTML", () => {
    assert.ok(!app.includes("openBtn.innerHTML"), "unsafe innerHTML on note name");
    assert.ok(app.includes("dialogMessage.textContent"), "dialog must use textContent");
  });
  it("counts words with a single native implementation", () => {
    assert.ok(app.includes("function countText"), "missing countText");
    const live = (app.match(/addEventListener\("input"/g) || []).length;
    assert.ok(live >= 1, "no input listener for counters");
  });
  it("renames on change, not on every keystroke", () => {
    assert.ok(app.includes('title.addEventListener("change", commitRename)'), "rename must run on change");
    assert.ok(!app.includes('title.addEventListener("input"'), "rename must not run on input");
  });
  it("falls back to localStorage when IndexedDB is blocked", () => {
    assert.ok(app.includes("let useIdb"), "missing storage backend flag");
    assert.ok(app.includes("function lsPutItem"), "missing localStorage put fallback");
    assert.ok(app.includes("function lsGetItem"), "missing localStorage get fallback");
    assert.ok(app.includes("function lsKeys"), "missing localStorage keys fallback");
  });
  it("shows save status and handles quota errors", () => {
    assert.ok(app.includes("saveStatus"), "missing save status element wiring");
    assert.ok(app.includes("QuotaExceededError"), "missing quota handling");
  });
  it("imports through a real file picker", () => {
    assert.ok(app.includes("fileInput.click()"), "import must open the file picker");
    assert.ok(!app.includes("importFromClipboard"), "dead clipboard import must be gone");
  });
});

describe("notes, markdown, shortcuts, sharing", () => {
  it("supports search, sort and pins", () => {
    assert.ok(app.includes("noteSearch") || app.includes("searchInput"), "missing search wiring");
    assert.ok(app.includes("sortedNames"), "missing sorting");
    assert.ok(app.includes("pins"), "missing pins");
  });
  it("renders markdown safely", () => {
    assert.ok(app.includes("function renderMarkdown"), "missing markdown renderer");
    assert.ok(app.includes("function escapeHtml"), "markdown must escape HTML first");
  });
  it("supports keyboard shortcuts and tab indent", () => {
    assert.ok(app.includes('"s"') || app.includes("'s'"), "missing Ctrl+S");
    assert.ok(app.includes("selectionStart"), "missing Tab indent handling");
  });
  it("has no share feature left", () => {
    assert.ok(!app.includes("shareNote"), "share button wiring remains");
    assert.ok(!app.includes("navigator.share"), "Web Share code remains");
    assert.ok(!app.includes("buildShareLink"), "share link builder remains");
  });
});

describe("project files", () => {
  const required = [
    "index.html",
    "app.css",
    "app.js",
    "sw.js",
    "manifest.webmanifest",
    "icon.svg",
    "icon-192.png",
    "icon-512.png",
    "icon-maskable-512.png",
    "robots.txt",
    "sitemap.xml",
    "package.json"
  ];
  for (const file of required) {
    it(`${file} exists`, () => {
      assert.ok(existsSync(file), `missing ${file}`);
    });
  }
  it("has no leftover test/ ignore rule", () => {
    const ignore = readFileSync(".gitignore", "utf8");
    assert.ok(!ignore.includes("test/"), ".gitignore still ignores test/");
  });
});
