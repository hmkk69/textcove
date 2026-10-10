# Agents Skill For You - Fits TextCove, I have my own AGENTS.md.. it's actually the same thing :)

Zero-dependency vanilla PWA: `index.html` + `app.css` + `app.js` + `sw.js`. Node is dev-tooling only (no runtime deps, no bundler, no framework).

## Commands

- `npm run dev` → serves repo root at `http://localhost:6969` via `scripts/serve-local.mjs`. Must use HTTP, not `file://` — service worker and PWA install break on `file://`.
- `npm test` → `node --test tests/app.test.mjs tests/pwa.test.mjs tests/fixes.test.mjs`. Static source-assertion suites (read files, check strings); no browser/DOM runner.
- `npm run check` → `node --check` on `app.js`, `sw.js`, `scripts/build.mjs`. Run after JS edits.
- `npm run build` → `node scripts/build.mjs` hashes `index.html`+`app.css`+`app.js` and rewrites `const cacheName = "textcove-<8hex>"` in `sw.js` in place. Run after touching any of those three, before commit/deploy, or `pwa.test.mjs` ("cache name is not build-stamped") fails.

## Architecture / gotchas

- Storage: IndexedDB is primary, `localStorage` (`lsPutItem`/`lsGetItem`/`lsKeys`, `let useIdb` flag in `app.js`) is fallback + crash recovery. Don't remove fallback.
- SW update flow is split across two files: `sw.js` handles `SKIP_WAITING`/`skipWaiting`/`clients.claim`/old-cache delete; the inline `<script>` at end of `index.html` registers `sw.js` with `updateViaCache: "none"`, polls via `reg.update()` (load/online/pageshow/15min interval), and reloads once on `controllerchange`. Keep both sides in sync.
- Native-only replacements are intentional: `a[download]`+`createObjectURL`/`revokeObjectURL` (no FileSaver), native `<dialog>` centered via `.app-dialog { margin: auto }` (no Smoke), hand-written `countText` (no Countable). Tests assert these stay absent.
- Safety invariants asserted by tests — preserve them: note names via `textContent` never `innerHTML`; rename on title `change` event not `input`; never save placeholder text; editor settings set `content.style.fontSize` individually (never `content.style.cssText = settingValues`); delete keeps `lastTrash` + `undoLastDelete` ("click here to undo"); import caps `MAX_FILE_SIZE`/`MAX_IMPORT_NOTES` + `sanitizeFileName`.
- Two dev servers exist: `scripts/serve-local.mjs` (used by `npm run dev`, `Cache-Control: no-store`) and root `serve-local.mjs` (older variant with SSE live-reload on `/__textcove_reload`). Prefer the `scripts/` one.

# Commit message
- When I say: "Write commit message and push", I create a commit message with complete type and description but not too long, then push it for me. If it's just "Write a commit message", then just write the commit message, not push.
