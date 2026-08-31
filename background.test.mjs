import assert from "node:assert/strict";

const YELLOW_KEY = "example.com//docs/manage-sensitive-data/ephemeral";

const tabs = {
  1: { id: 1, url: "https://example.com/docs/manage-sensitive-data" },
  2: { id: 2, url: "https://example.com/docs/manage-sensitive-data/ephemeral" },
};
const listeners = {};
const painted = [];

globalThis.chrome = {
  action: {
    setIcon: ({ tabId, path }, done) => {
      painted.push([tabId, path[16]]);
      done();
    },
  },
  runtime: { lastError: undefined },
  storage: {
    local: {
      get: async (key) =>
        key === YELLOW_KEY ? { [key]: { color: "yellow" } } : {},
    },
    onChanged: { addListener: (fn) => (listeners.changed = fn) },
  },
  tabs: {
    get: (id, done) => done(tabs[id]),
    query: async () => Object.values(tabs),
    onActivated: { addListener: (fn) => (listeners.activated = fn) },
    onUpdated: { addListener: (fn) => (listeners.updated = fn) },
  },
};

await import("./background.js");

// paintIcon runs unawaited inside each listener, so let its promises settle
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// Switching to the tagged tab and back leaves the untagged tab's icon untagged
listeners.activated({ tabId: 2 });
listeners.activated({ tabId: 1 });
await flush();
assert.deepEqual(painted, [
  [2, "icons/yellow_16.png"],
  [1, "icons/default_16.png"],
]);

// A tab that closed before Chrome answered gets no icon and no crash
painted.length = 0;
chrome.runtime.lastError = { message: "No tab with id: 3" };
listeners.activated({ tabId: 3 });
chrome.runtime.lastError = undefined;
await flush();
assert.deepEqual(painted, []);

// Tagging a page repaints only the tabs showing it
painted.length = 0;
await listeners.changed({ [YELLOW_KEY]: {} });
await flush();
assert.deepEqual(painted, [[2, "icons/yellow_16.png"]]);

console.log("background.js ✓");
