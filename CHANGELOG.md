# Changelog

All notable changes to TextCove are documented here, newest first.
Dates follow the project commit history.

## 2026-10-16

- UX: editor font picker in settings with IBM Plex Mono (Recommended), System Mono, Consolas/Menlo, System Sans and Georgia Serif; applies to editor plus preview, saved per device and covered by reset.
- UX: empty notes delete normally when more than one note exists; the "empty note" notice plus Shift-click hint only shows for the last remaining note.
- UX: added a user-friendly Changelog page, info dialog links to it instead of the raw markdown; `CHANGELOG.md` stays in git but stays hidden on the live Vercel site.

## 2026-10-15

- Reliability: notes list cache invalidates on save/delete, reserved names blocked, control chars stripped.
- Markdown: ordered lists, strikethrough and hr, ordered and bullet lists no longer mix.
- UX/a11y: skip link, menu aria-controls, OS theme changes apply when no manual theme is stored.
- PWA/perf: font preload, referrer policy, maskable icon uses any maskable, build hash covers manifest plus icons and font.
- Housekeeping: check covers boot.js, CI verifies fresh sw.js stamp, README points to scripts server only.
- UX: delete moves straight to Trash, Shift-click asks then deletes permanently.
- Reliability: delete is locked while running, empty notes skip Trash, single empty note cannot spam Trash.
- UX: rename conflict offers the next free name like "name (1)" instead of only blocking.
- UX: deleting an empty note explains it is empty instead of silently doing nothing; Shift-click still removes it permanently.
- UX: header logo no longer overlaps the brand text and keeps one icon gray in both themes.
- Housekeeping: removed `renamed.html` and its cache, build and test references.
- UX: backup with no content explains there is nothing to back up yet instead of downloading an empty file.
- Housekeeping: pin LF line endings and normalize the build hash input so the `sw.js` stamp matches on Windows and CI.

## 2026-10-10

- UX: footer status is plain text (green while saving or saved, red on error), install notice removed.
- Perf: debounced search, 2s list cache, content search capped at 50k chars per note.
- Reliability: boot reconciles crash-recovery copies, note names reserved synchronously, large backup asks before export.
- PWA: worker serves 404.html on 404s, empty 404 for images/fonts offline, single cache key for the app shell, update poll relaxed to 15 minutes.
- UX/a11y: first-run theme follows the OS, centralized aria-expanded sync, dialog focus restore plus Tab trap, print shows the note title, JSON-LD metadata.
- Markdown: code spans shielded from bold/italic/link formatting.
- Housekeeping: legacy placeholder selectors and duplicate CSS removed, CI runs test plus syntax check.

## 2026-10-09

- Desktop PWA install: open `.txt` files straight into the app (`file_handlers`), receive shared text/links (`share_target`), handle `web+textcove` links (`protocol_handlers`) and reuse the open window (`launch_handler`).
- Subtle "App available" notice in the footer instead of a button. It triggers the native install prompt when the browser offers one, otherwise it explains how to install manually. The notice hides itself once the app runs installed.
- Shared text and launched files open as new notes.

## 2026-10-07

- Ownership transferred from 2nul to hmkk69; repo links and site domain updated (`tc.hmkkk.qzz.io`).

## 2026-10-04

- **Breaking:** renamed SimpleJot to TextCove across UI, manifest, PWA cache, docs and links.
- Existing notes carry over: IndexedDB and localStorage keys migrate from `SimpleJot-*` to `TextCove-*`.
- Dismissible rename banner plus a `renamed.html` landing page.
- Oversized-note guard: backup-before-clear flow so a huge note can no longer freeze the page.

## 2026-10-03

- Storage: race-safe note switching, persistent trash with 30-day expiry and click-to-undo, one-tap backup with free-space status.
- UX: shared ease-out motion curve, deep-slate dark mode with light default, footer keeps only the offline tip.
- Notes list loads in a single IndexedDB pass and searches titles plus content; file names sanitized, import size/count capped.
- Hardened service worker caching and manifest `start_url`.

## 2026-09-20

- Fixed service worker auto-update: online clients check for a newer worker on load and reconnect, then swap to it.

## 2026-09-19

- Rewrote the note engine: dropped FileSaver/Smoke/Countable for native download, native `<dialog>` and a hand-written counter.
- Added search, sort, pins, markdown preview, keyboard shortcuts and JSON import/export.
- localStorage fallback when IndexedDB is blocked; installable offline-first PWA with build-stamped service worker cache.
- License changed to non-commercial attribution (see `LICENSE`).

## 2026-09-16

- Migrated notes from localStorage to IndexedDB with realtime autosave.
- Offline use via service worker cache.
- New notes default to "New note" so empty titles can no longer lose data.

## 2026-09-12

- Multi-note management: notes panel, per-note autosave, rename via title field, per-note delete, last-open note restored; legacy single-note data auto-migrated.
- Note naming warning on startup.
- Initial commit.
