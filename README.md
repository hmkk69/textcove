# SimpleJot

[![PWA](https://img.shields.io/badge/PWA-ready-brightgreen)](https://jot.2nul.dpdns.org/)
[![No dependencies](https://img.shields.io/badge/dependencies-zero-blue)](package.json)
[![Tests](https://img.shields.io/badge/tests-35%20passing-brightgreen)](tests/)
[![License](https://img.shields.io/badge/license-non--commercial-lightgrey)](LICENSE)

A fast, private, offline-ready notepad. No accounts, no tracking, no WYSIWYG clutter. Your notes live in your browser (IndexedDB + localStorage recovery) until you decide to delete or download them.

**Live demo:** https://jot.2nul.dpdns.org/

![SimpleJot screenshot](screenshot-wide.png)

## Features

- Instant autosave with a visible status (`Saving...` / `Saved • 12:03` / error states)
- Multiple notes with search, sort (last edited / A-Z), pins, snippets and edit dates
- Markdown preview: headings, **bold**, *italic*, `code`, fenced code blocks, checklists, quotes
- One-click `.txt` download, full JSON export, JSON file import, drag-and-drop import
- Copy-to-clipboard and print stylesheet
- Keyboard shortcuts: `Ctrl+S` save, `Ctrl+N` new note, `Ctrl+K` search, `Tab` indent
- Offline-first PWA: installable, custom icons, app shortcuts
- Online, the page checks for a newer service worker on load and on reconnect, then swaps to it automatically; offline, the newest cached copy is served
- Theming: manual toggle plus automatic `prefers-color-scheme` support
- Accessible: labelled controls, native `<dialog>`, live-region save status, `prefers-reduced-motion`

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl`/`Cmd` + `S` | Download current note as `.txt` |
| `Ctrl`/`Cmd` + `N` | New note |
| `Ctrl`/`Cmd` + `K` | Search notes |
| `Tab` (in editor) | Indent two spaces |

## Technology stack

- HTML5, CSS3, vanilla JavaScript — zero runtime dependencies
- IndexedDB for notes, localStorage for settings and crash recovery
- Native `<dialog>`, native `a[download]` + Blob URLs, hand-written word counter
- IBM Plex Mono for readability

## File structure

```
simplejot/
├── index.html          # App shell, SEO tags, native dialog
├── app.css             # Styling, responsive, print, reduced-motion
├── app.js              # Application logic, no dependencies
├── sw.js               # Service worker (cache name stamped by npm run build)
├── manifest.webmanifest# PWA manifest with icons and app shortcuts
├── icon.svg            # Source icon
├── icon-192.png        # PWA icon
├── icon-512.png        # PWA icon
├── icon-maskable-512.png
├── robots.txt
├── sitemap.xml
├── package.json        # build / test / check scripts
├── scripts/build.mjs   # Stamps a content hash into sw.js
└── tests/              # node:test suites (no extra dependencies)
```

## Development

```bash
npm run dev     # serve locally at http://localhost:8080 (required: service workers and PWA install do not work over file://)
npm run build   # stamp a content hash into the service-worker cache name
npm test        # run the test suites
npm run check   # syntax-check the JavaScript
```

## Credits

Based on the original [TextPad](https://github.com/syndicatefx/TextPad) project by Paulo Nunes.
The previously vendored FileSaver.js, Smoke.js and Countable.js helpers were replaced with small native implementations.

## License

[SimpleJot Non-Commercial Attribution License](https://github.com/2nul/simplejot/blob/main/LICENSE)
