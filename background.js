import { getInternalIDFromURL, getTag } from "./tag.js";

// Every listener already knows which tab changed, so paint that tab rather
// than whichever tab chrome.tabs.query calls active
async function paintIcon(tabId, url) {
  const { color = "default" } = await getTag(getInternalIDFromURL(url));
  chrome.action.setIcon(
    {
      tabId,
      path: {
        16: `icons/${color}_16.png`,
        32: `icons/${color}_32.png`,
        48: `icons/${color}_48.png`,
        96: `icons/${color}_96.png`,
      },
    },
    // The tab can close while Chrome decodes the icon files, and reading the
    // error here is what keeps Chrome from logging it as unchecked
    () => chrome.runtime.lastError,
  );
}

chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab?.url) {
      return;
    }
    paintIcon(tabId, tab.url);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    paintIcon(tabId, changeInfo.url);
  }
});

// The popup writes the tag, so the icon is stale on every tab showing that page
chrome.storage.onChanged.addListener(async (changes) => {
  for (const tab of await chrome.tabs.query({})) {
    if (tab.url && changes[getInternalIDFromURL(tab.url)]) {
      paintIcon(tab.id, tab.url);
    }
  }
});
