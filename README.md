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

## Clear your tags

The popup can't erase anything. Clearing lives on the options page, which you reach either by clicking **Options** at the bottom of the popup, or by right-clicking the Tig icon and choosing **Options**.

The page tells you how many pages you've tagged, then asks you to type `delete all tags` before it enables the button. **Save a backup file first** stays checked by default. With it checked, Tig writes every tag to a JSON file and only erases the tags once the file reaches your disk. Cancel the save dialog and Tig keeps your tags.

Chrome hands the file to its own download machinery, so the save dialog opens wherever you last saved a download rather than in your home directory. No extension API can preselect a directory. Tig suggests the name `tig-backup-YYYY-MM-DD.json`, and you pick the folder.

The backup is a JSON object mapping each key to its tag:

```json
{
  "example.com//docs/intro?v=2": { "color": "green", "text": "Done" }
}
```

Nothing reads that file back yet. To restore a backup, open the options page, open its DevTools console, and paste the file's contents into this call:

```js
chrome.storage.local.set({ "example.com//docs/intro?v=2": { "color": "green", "text": "Done" } })
```

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

- `manifest.json` declares the popup, the options page, the service worker, and the `downloads`, `storage`, `tabs`, and `unlimitedStorage` permissions
- `tag.js` reads the active tab and its tag, and both the popup and the service worker import it
- `background.js` runs as a service worker and repaints the toolbar icon when you switch tabs, navigate, or change a tag
- `popup/` holds the popup, which reads and writes `chrome.storage.local` directly
- `options/` holds the backup and clearing page, the only place that erases anything

### What differs from the Firefox version

- The manifest is version 3, which Chrome has required since Chrome 139 dropped Manifest V2. `browser_action` becomes `action`, and the background script becomes a service worker.
- The APIs are `chrome.*` rather than `browser.*`, and they return promises.
- The popup talks to `chrome.storage` itself instead of asking the background script to do it, so the two message commands the Firefox version passes around are gone. The service worker watches `chrome.storage.onChanged` to keep the icon in step.
- The popup loads no remote font. It asks for Nunito and falls back to the system font.
- The Firefox version clears everything from a button in the popup. Here the popup only links to the options page, which asks you to type a phrase and offers a backup first.
