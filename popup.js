// 报文转 Text - Popup Script

document.addEventListener("DOMContentLoaded", async () => {
  const filenameInput = document.getElementById("filename");
  const contentInput = document.getElementById("content");
  const btnExport = document.getElementById("btnExport");
  const btnClear = document.getElementById("btnClear");

  // 加载上次保存的内容
  const saved = await chrome.storage.local.get(["savedFilename", "savedContent"]).catch(() => ({}));
  if (saved.savedFilename) filenameInput.value = saved.savedFilename;
  if (saved.savedContent) contentInput.value = saved.savedContent;

  // 自动保存输入内容（防抖）
  let saveTimer;
  const autoSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      chrome.storage.local.set({
        savedFilename: filenameInput.value,
        savedContent: contentInput.value,
      }).catch(() => {});
    }, 500);
  };

  filenameInput.addEventListener("input", autoSave);
  contentInput.addEventListener("input", autoSave);

  // 导出按钮
  btnExport.addEventListener("click", async () => {
    const content = contentInput.value.trim();
    if (!content) {
      showToast("请先粘贴报文内容", true);
      contentInput.focus();
      return;
    }

    let filename = filenameInput.value.trim();
    if (!filename) {
      filename = `request_${formatDateTime(new Date())}`;
    }
    filename = sanitizeFilename(filename) + ".txt";

    try {
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const dataUrl = await blobToDataUrl(blob);

      await chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: true,
      });

      showToast(`已导出: ${filename}`, false, true);
    } catch (err) {
      showToast("导出失败: " + err.message, true);
    }
  });

  // 清空按钮
  btnClear.addEventListener("click", () => {
    if (!contentInput.value.trim() && !filenameInput.value.trim()) {
      showToast("已经是空的了");
      return;
    }
    if (confirm("确定清空所有内容吗？")) {
      filenameInput.value = "";
      contentInput.value = "";
      chrome.storage.local.remove(["savedFilename", "savedContent"]).catch(() => {});
      showToast("已清空");
    }
  });

  // 快捷键：Ctrl+Enter 导出
  contentInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      btnExport.click();
    }
  });
});

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^[._]+|[._]+$/g, "")
    .substring(0, 200);
}

function formatDateTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function showToast(message, isError, isSuccess) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast" +
    (isError ? " error" : "") +
    (isSuccess ? " success" : "");
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
