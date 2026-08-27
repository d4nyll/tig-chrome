# `tig` for Chrome

`tig` lets you tag pages with a color and some text. This is the Chrome port of [`d4nyll/tig`](https://github.com/d4nyll/tig), which targets Firefox.

`tig` is useful for tagging pages in:

- Large documentation sites as:
  - Read (green)
  - Reading (yellow)
  - Unread (red)
- Revision sites as:
  - Mastered (green)
  - Learnt (yellow)
  - Need Help (orange)
  - Not Learnt (red)

Click the toolbar icon to see the current page's tag and to set one. The icon takes the color of the tag, so you can see the page's state without opening the popup. Tags live in `chrome.storage.local`, keyed by host, path, and query string, so `http` and `https` versions of a page share a tag and a `#fragment` doesn't split one.

## Install it locally

You don't need the Chrome Web Store to run this.

1. Clone or download this folder to somewhere permanent, because Chrome reads it from disk on every start
2. Open `chrome://extensions`
3. Turn on **Developer mode**, top right
4. Click **Load unpacked** and select this folder
5. Click the puzzle-piece icon in the toolbar and pin **Tig**

Chrome keeps the extension across restarts and shows an "extensions in developer mode" warning on each launch. To update, pull the new files and click the reload arrow on the extension's card.

## Package it for someone else

```
$ zip -r tig-chrome.zip . -x '.git/*' '*.zip'
```

The recipient unzips it and follows the install steps above.

## Development

Run the one check on the tag key format:

```
$ node tag.test.mjs
```

The files:

- `manifest.json` declares the popup, the service worker, and the `storage`, `tabs`, and `unlimitedStorage` permissions
- `tag.js` reads the active tab and its tag, and both the popup and the service worker import it
- `background.js` runs as a service worker and repaints the toolbar icon when you switch tabs, navigate, or change a tag
- `popup/` holds the popup, which reads and writes `chrome.storage.local` directly

### What differs from the Firefox version

- The manifest is version 3, which Chrome has required since Chrome 139 dropped Manifest V2. `browser_action` becomes `action`, and the background script becomes a service worker.
- The APIs are `chrome.*` rather than `browser.*`, and they return promises.
- The popup talks to `chrome.storage` itself instead of asking the background script to do it, so the two message commands the Firefox version passes around are gone. The service worker watches `chrome.storage.onChanged` to keep the icon in step.
- The popup loads no remote font. It asks for Nunito and falls back to the system font.
