import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT) || 6969;
const lockFile = path.join(root, ".dev-server.lock");

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function isAlive(pid) {
  if (!pid || pid === process.pid) return false;
  try { process.kill(pid, 0); return true; } catch (err) { return false; }
}

async function claimLock() {
  if (fs.existsSync(lockFile)) {
    let oldPid = 0;
    try { oldPid = parseInt(fs.readFileSync(lockFile, "utf8").trim(), 10) || 0; } catch (err) { oldPid = 0; }
    if (oldPid && isAlive(oldPid)) {
      console.log("Another dev server is already running (PID " + oldPid + "). Asking it to step down...");
      // Try graceful HTTP shutdown first.
      try {
        await new Promise((resolve) => {
          const req = http.get("http://127.0.0.1:" + port + "/__textcove_shutdown", (r) => { r.resume(); r.on("end", resolve); });
          req.on("error", resolve);
          req.setTimeout(1000, () => { req.destroy(); resolve(); });
        });
      } catch (err) {}
      for (let i = 0; i < 30; i++) {
        await sleep(100);
        if (!isAlive(oldPid)) break;
      }
      // Fallback: force kill if still alive.
      if (isAlive(oldPid)) {
        try { process.kill(oldPid); } catch (err) {}
        await sleep(300);
      }
    }
    try { fs.unlinkSync(lockFile); } catch (err) {}
  }
  fs.writeFileSync(lockFile, String(process.pid));
}

process.on("SIGTERM", () => {
  console.log("Another dev server instance has taken over. This session is ending.");
  try { fs.unlinkSync(lockFile); } catch (err) {}
  process.exit(0);
});
process.on("SIGINT", () => {
  try { fs.unlinkSync(lockFile); } catch (err) {}
  process.exit(0);
});
process.on("exit", () => {
  try { fs.unlinkSync(lockFile); } catch (err) {}
});

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon"
};

const clients = new Set();

function broadcast() {
  for (const res of clients) {
    try { res.write("data: reload\n\n"); } catch (err) {}
  }
}

let debounceTimer = null;
function scheduleReload() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    broadcast();
  }, 120);
}

try {
  fs.watch(root, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (filename.includes("node_modules")) return;
    if (filename.startsWith(".")) return;
    if (filename.includes(".dev-server.lock")) return;
    scheduleReload();
  });
} catch (err) {
  console.error("fs.watch failed:", err);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/__textcove_reload") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*"
    });
    res.write("retry: 1000\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }

  if (url.pathname === "/__textcove_shutdown") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    res.end("shutting down");
    console.log("Another dev server instance has taken over. This session is ending.");
    setTimeout(() => {
      try { fs.unlinkSync(lockFile); } catch (err) {}
      process.exit(0);
    }, 100);
    return;
  }

  let filePath = path.join(root, decodeURIComponent(url.pathname));
  if (url.pathname === "/") filePath = path.join(root, "index.html");
  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-store",
      "Content-Length": stat.size
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

await claimLock();

server.listen(port, () => {
  console.log("TextCove dev server at http://localhost:" + port);
});

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    console.error("Port " + port + " is still in use. Retrying in 1s...");
    setTimeout(() => server.listen(port), 1000);
  } else {
    console.error(err);
    process.exit(1);
  }
});
