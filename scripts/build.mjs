import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const sources = ["index.html", "404.html", "app.css", "app.js", "boot.js", "manifest.webmanifest", "assets/icon.svg", "assets/icon-192.png", "assets/icon-512.png", "assets/icon-maskable-512.png", "assets/IBMPlexMono-Regular.woff2"];
const hash = createHash("sha256");
for (const file of sources) {
  const raw = readFileSync(file).toString("binary");
  hash.update(Buffer.from(raw.replace(/\r\n/g, "\n"), "binary"));
}
const stamp = hash.digest("hex").slice(0, 8);
const path = "sw.js";
const original = readFileSync(path, "utf8");
const updated = original.replace(/const cacheName = "textcove-[^"]*";/, `const cacheName = "textcove-${stamp}";`);
if (updated === original && !original.includes(`textcove-${stamp}`)) {
  throw new Error("cacheName pattern not found in sw.js");
}
writeFileSync(path, updated);
console.log(`sw.js cache stamped: textcove-${stamp}`);
