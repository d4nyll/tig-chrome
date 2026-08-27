const PHRASE = "delete all tags";

const confirmInput = document.getElementById("confirm");
const clearButton = document.getElementById("clear");
const backupCheckbox = document.getElementById("backup");
const message = document.getElementById("message");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.remove("hidden");
  message.classList.toggle("error", isError);
}

async function showCount() {
  const count = Object.keys(await chrome.storage.local.get(null)).length;
  document.getElementById("count").textContent =
    count === 1 ? "You have tagged 1 page." : `You have tagged ${count} pages.`;
}

// Chrome can finish or cancel a download before chrome.downloads.download()
// resolves, so ask for the state rather than listen for the change
async function whenDownloadFinishes(downloadId) {
  for (;;) {
    const [download] = await chrome.downloads.search({ id: downloadId });
    if (!download) {
      throw new Error("Chrome lost the download");
    }
    if (download.state === "complete") {
      return;
    }
    if (download.state === "interrupted") {
      throw new Error(
        download.error === "USER_CANCELED" ? "you canceled it" : download.error,
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

// Resolves once the file is on disk, so the caller can erase the tags safely
async function saveBackup(tags) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(tags, null, 2)], { type: "application/json" }),
  );
  const date = new Date().toISOString().slice(0, 10);
  try {
    const downloadId = await chrome.downloads.download({
      url,
      filename: `tig-backup-${date}.json`,
      saveAs: true,
    });
    await whenDownloadFinishes(downloadId);
  } finally {
    URL.revokeObjectURL(url);
  }
}

confirmInput.addEventListener("input", () => {
  clearButton.disabled = confirmInput.value.trim() !== PHRASE;
});

clearButton.addEventListener("click", async () => {
  clearButton.disabled = true;
  const tags = await chrome.storage.local.get(null);
  const count = Object.keys(tags).length;

  if (backupCheckbox.checked) {
    showMessage("Saving your backup…");
    try {
      await saveBackup(tags);
    } catch (error) {
      showMessage(`Kept your tags, because the backup failed: ${error.message}`, true);
      clearButton.disabled = false;
      return;
    }
  }

  await chrome.storage.local.clear();
  confirmInput.value = "";
  showMessage(count === 1 ? "Cleared 1 tag." : `Cleared ${count} tags.`);
  showCount();
});

showCount();
