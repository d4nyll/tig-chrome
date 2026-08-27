import { getActiveTab, getTag } from "../tag.js";

const colors = ["red", "orange", "yellow", "green", "blue", "purple", "grey"];

function updateTag(color, text) {
  const current = document.getElementById("current");
  current.className = color || "unset";
  current.textContent = text || "No Tag Set";
}

function showError(message) {
  document.getElementById("error-content").classList.remove("hidden");
  document.getElementById("error-message").textContent = message;
}

function getColorFromTarget(target) {
  return colors.find((color) => target.classList.contains(color));
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("preset")) {
    const color = getColorFromTarget(e.target);
    const text = e.target.textContent;
    const tab = await getActiveTab();
    if (!tab) {
      showError("Cannot tag this page.");
      return;
    }
    await chrome.storage.local.set({ [tab.internalId]: { color, text } });
    updateTag(color, text);
  } else if (e.target.id === "options") {
    chrome.runtime.openOptionsPage();
  }
});

const tab = await getActiveTab();
if (tab) {
  const { color, text } = await getTag(tab.internalId);
  updateTag(color, text);
} else {
  showError("Cannot tag this page.");
}
