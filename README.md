# TextCove

> Ownership: Originally created by 2nul, who no longer wishes to continue development. Ownership has been transferred to hmkk69.

### Formerly known as [SimpleJot](https://github.com/2nul/simplejot)

[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen)](https://tc.hmkkk.qzz.io/)
[![No dependencies](https://img.shields.io/badge/dependencies-zero-blue)](package.json)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](tests/)
[![License](https://img.shields.io/badge/license-non--commercial-lightgrey)](LICENSE)

A fast, private, offline-ready notepad. Write notes in your browser; they auto-save locally. No accounts, no tracking. Your notes stay on this device until you delete or download them.

**Website:** https://tc.hmkkk.qzz.io/

![TextCove screenshot](assets/screenshot-2026-10-03.png)

## Features

- Instant autosave with a visible status (`Saving...` / `Saved at 12:03` / error states)
- Multiple notes with search (title + content), sort (last edited / A-Z), pins, snippets and edit dates
- Tags: create, filter, autocomplete suggestions, delete from every note
- Delete moves straight to Trash with click-to-undo in the status bar; Shift-click deletes permanently (with confirm)
- Trash: restore, delete forever, empty, auto-prune after 30 days
- Markdown preview: headings, bold, italic, strikethrough, inline code, fenced code blocks, bullets, ordered lists, task lists, quotes, horizontal rules
- Built-in formatting toolbar and shortcuts (Ctrl+B bold, Ctrl+I italic)
- Hint when your text looks like Markdown, offering to open preview
- One-click `.txt` download, full JSON export/import, drag-and-drop import
- Oversized note guard: notes over ~1 MB are not auto-loaded; offer "Download backup" then "Clear this note"
- Copy-to-clipboard and print stylesheet (prints the note title)
- Keyboard shortcuts: Ctrl+S save, Ctrl+N new note, Ctrl+K search, Tab indent
- Offline-first PWA: installable, custom icons, app shortcuts, auto-updating service worker
- Theming: manual light/dark toggle (defaults to light), deep-slate dark mode, follows OS when unset
- Accessible: labelled controls, native `<dialog>` with focus restore and Tab trap, live-region save status, `prefers-reduced-motion`
- Storage: IndexedDB primary with localStorage fallback + crash recovery; OPFS background backup; storage usage shown in footer
- Safety: sanitized file names, reserved-name protection, quota handling, import caps (5 MB file, 200 notes)

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl`/`Cmd` + `S` | Download current note as `.txt` |
| `Ctrl`/`Cmd` + `N` | New note |
| `Ctrl`/`Cmd` + `K` | Search notes |
| `Ctrl`/`Cmd` + `B` | Bold (Markdown) |
| `Ctrl`/`Cmd` + `I` | Italic (Markdown) |
| `Tab` (in editor) | Indent two spaces |
| `Esc` | Close menus / dialogs |

## Technology stack

- HTML5, CSS3, vanilla JavaScript - zero runtime dependencies
- IndexedDB for notes, localStorage for settings and crash recovery, OPFS for background backup
- Native `<dialog>`, native `a[download]` + Blob URLs, hand-written word counter
- IBM Plex Mono for readability

## File structure

```
textcove/
|-- index.html          # App shell, SEO tags, native dialog, SVG icons
|-- 404.html            # Not-found page
|-- app.css             # Styling, responsive, print, reduced-motion
|-- app.js              # Application logic, no dependencies
|-- boot.js             # Service-worker registration, theme, dev reload
|-- sw.js               # Service worker (cache name stamped by npm run build)
|-- manifest.webmanifest# PWA manifest with icons, screenshots, shortcuts
|-- assets/             # Icons, screenshots, webfont
|-- robots.txt
|-- sitemap.xml
|-- CHANGELOG.md        # Release history, newest first
|-- package.json        # build / test / check scripts
|-- scripts/
|   |-- build.mjs       # Stamps a content hash into sw.js
|   `-- serve-local.mjs # Dev server used by npm run dev
`-- tests/              # node:test suites (no extra dependencies)
```

## Development

```bash
npm run dev     # serve locally at http://localhost:6969 (required: SW and PWA need HTTP, not file://)
npm run build   # stamp a content hash into the service-worker cache name
npm test        # run the test suites
npm run check   # syntax-check the JavaScript
```

Notes:
- `npm run dev` must use HTTP; service workers and PWA install do not work over `file://`.
- Run `npm run build` after touching any hashed file, before commit/deploy, or CI (`git diff --exit-code sw.js`) fails.
- Root `serve-local.mjs` is legacy and gitignored; use `scripts/serve-local.mjs`.

## Privacy

TextCove runs entirely in your browser. Notes are stored locally (IndexedDB + localStorage recovery). No accounts, no analytics, no network requests except loading the page and its assets. Export/backup is manual (JSON or `.txt`).

## Credits

Based on the original [TextPad](https://github.com/syndicatefx/TextPad) project by Paulo Nunes.
The previously vendored FileSaver.js, Smoke.js and Countable.js helpers were replaced with small native implementations.

## License

[TextCove Non-Commercial Attribution License](https://github.com/hmkk69/textcove/blob/main/LICENSE)