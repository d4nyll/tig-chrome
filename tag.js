export function getInternalIDFromURL(url) {
  // Get only the main part of the URL, not the scheme nor fragment
  const parsedURL = new URL(url);
  return `${parsedURL.host}/${parsedURL.pathname}${parsedURL.search}`;
}

export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    return null;
  }
  return { id: tab.id, internalId: getInternalIDFromURL(tab.url) };
}

export async function getTag(internalId) {
  const stored = await chrome.storage.local.get(internalId);
  return stored[internalId] || {};
}
