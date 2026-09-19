import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const sources = ["index.html", "app.css", "app.js"];
const hash = createHash("sha256");
for (const file of sources) {
  hash.update(readFileSync(file));
}
const stamp = hash.digest("hex").slice(0, 8);
const path = "sw.js";
const original = readFileSync(path, "utf8");
const updated = original.replace(/const cacheName = "simplejot-[^"]*";/, `const cacheName = "simplejot-${stamp}";`);
if (updated === original && !original.includes(`simplejot-${stamp}`)) {
  throw new Error("cacheName pattern not found in sw.js");
}
writeFileSync(path, updated);
console.log(`sw.js cache stamped: simplejot-${stamp}`);
