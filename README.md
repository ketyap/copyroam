# Copyroam

[日本語](./README.ja.md)

A browser extension that restores copy, cut, paste, right-click, and text selection on pages that block them — no popup, no settings, just a toolbar toggle.

## Why

Some sites disable the clipboard, the context menu, and text selection with JavaScript or CSS to discourage copying. Copyroam neutralizes those restrictions on demand, per session, without permanently changing anything about the page.

## Features

- One click to toggle on/off — no popup UI, the toolbar icon itself shows the state (gray = off, green = on)
- Restores `copy`, `cut`, `paste`, right-click, and manual text selection
- Also unblocks selection blocked via `mousedown`, keyboard shortcuts (Ctrl/Cmd+C/X/V/A), inline event handler attributes, and CSS `user-select`
- Off by default; toggling reloads the current tab to apply the change immediately

## Install (development)

```bash
npm install
npm run dev
```

This opens a browser with the extension loaded and hot-reloads on file changes.

## Build

```bash
npm run build
```

Outputs an unpacked extension to `.output/chrome-mv3/`. Load it via your browser's "load unpacked extension" developer option.

## How it works

The toggle registers a `MAIN`-world content script at `document_start` (via `chrome.scripting.registerContentScripts`) that:

- Makes `Event.prototype.preventDefault()` a no-op for the specific event types pages use to block copying (`copy`, `cut`, `paste`, `contextmenu`, `selectstart`, `mousedown`) — every other listener still runs, only the cancellation is defused
- Stops propagation of `keydown`/`keyup` for Ctrl/Cmd+C/X/V/A specifically, leaving all other keyboard shortcuts untouched
- Neutralizes inline handler properties (`onmousedown="return false"` and similar)
- Injects a stylesheet that forces `user-select: text` and a normal cursor

No page data is read, modified, or sent anywhere.

## Tech stack

Built with [WXT](https://wxt.dev) and TypeScript.

## Author

[Ketyap](https://ketyap.me) — questions or issues: [me@ketyap.me](mailto:me@ketyap.me)

## License

[MIT](./LICENSE) — this applies to the source code only. The icons in [`public/icon/`](./public/icon) are not covered; see the [notice](./public/icon/NOTICE.md) there.
