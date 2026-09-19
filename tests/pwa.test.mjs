import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync("index.html", "utf8");
const manifest = JSON.parse(readFileSync("manifest.webmanifest", "utf8"));
const sw = readFileSync("sw.js", "utf8");

describe("PWA manifest", () => {
  it("has 192, 512 and maskable icons", () => {
    const sizes = manifest.icons.map((i) => `${i.sizes}|${i.purpose || "any"}`);
    assert.ok(sizes.some((s) => s.startsWith("192x192")), "missing 192 icon");
    assert.ok(sizes.some((s) => s.startsWith("512x512")), "missing 512 icon");
    assert.ok(sizes.some((s) => s.includes("maskable")), "missing maskable icon");
  });
  it("has screenshots, categories and shortcuts", () => {
    assert.ok(manifest.screenshots && manifest.screenshots.length > 0, "missing screenshots");
    assert.ok(manifest.categories && manifest.categories.length > 0, "missing categories");
    assert.ok(manifest.shortcuts && manifest.shortcuts.length > 0, "missing shortcuts");
  });
});

describe("service worker", () => {
  it("activates updates immediately and cleans old caches", () => {
    assert.ok(/simplejot-[0-9a-f]{8}/.test(sw), "cache name is not build-stamped");
    assert.ok(!sw.includes("__BUILD_HASH__"), "placeholder was not replaced");
    assert.ok(sw.includes("SKIP_WAITING"), "missing instant-update handshake");
    assert.ok(sw.includes("skipWaiting"), "missing skipWaiting");
    assert.ok(sw.includes("clients.claim"), "missing clients.claim");
    assert.ok(sw.includes("caches.delete"), "missing old-cache cleanup");
  });
  it("registers safely and polls for updates", () => {
    assert.ok(html.includes("reg.update()"), "page never polls for a newer worker");
    assert.ok(html.includes("controllerchange"), "page never swaps to the new worker");
    assert.ok(html.includes("https:"), "worker must only register on http(s)");
  });
});

describe("SEO and accessibility", () => {
  it("has social and canonical tags", () => {
    assert.ok(html.includes("og:title"), "missing Open Graph tags");
    assert.ok(html.includes("twitter:card"), "missing Twitter card");
    assert.ok(html.includes('rel="canonical"'), "missing canonical link");
  });
  it("labels interactive controls", () => {
    assert.ok(html.includes('aria-label="Save note as text file"'), "save button has no label");
    assert.ok(html.includes('for="fs"'), "font-size slider has no label");
    assert.ok(html.includes("<dialog"), "missing native dialog");
    assert.ok(html.includes('aria-live="polite"'), "save status is not a live region");
  });
  it("keeps the same visual style", () => {
    const css = readFileSync("app.css", "utf8");
    assert.ok(css.includes("IBM Plex Mono"), "font changed");
    assert.ok(css.includes(".settings-menu"), "settings menu styles lost");
    assert.ok(!css.includes(".smoke-base"), "dead Smoke styles remain");
  });
  it("centers the native dialog", () => {
    const css = readFileSync("app.css", "utf8");
    assert.ok(/\.app-dialog\s*\{[^}]*margin:\s*auto/.test(css), "dialog lost its centering margin");
  });
});
