import { getActiveTab, getTag } from "./tag.js";

async function updateIcon() {
  const tab = await getActiveTab();
  if (!tab) {
    return;
  }
  const { color = "default" } = await getTag(tab.internalId);
  chrome.action
    .setIcon({
      tabId: tab.id,
      path: {
        16: `icons/${color}_16.png`,
        32: `icons/${color}_32.png`,
        48: `icons/${color}_48.png`,
        96: `icons/${color}_96.png`,
      },
    })
    // The tab can close before the icon is set
    .catch(() => {});
}

chrome.tabs.onActivated.addListener(updateIcon);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    updateIcon();
  }
});

// The popup writes the tag, so a storage change means the icon is stale
chrome.storage.onChanged.addListener(updateIcon);
