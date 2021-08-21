export function CopyPlainTextToClipboard(text) {
  function copyPlainText(event) {
    document.removeEventListener("copy", copyPlainText, true);
    event.stopImmediatePropagation();
    event.preventDefault();
    event.clipboardData.clearData();
    event.clipboardData.setData("text/plain", text);
  }
  document.addEventListener("copy", copyPlainText, true);
  document.execCommand("copy");
}

export function CopyHtmlToClipboard(html) {
  function copyHTML(event) {
    document.removeEventListener("copy", copyHTML, true);
    event.stopImmediatePropagation();
    event.preventDefault();
    event.clipboardData.clearData();
    event.clipboardData.setData("text/html", html);
  }
  document.addEventListener("copy", copyHTML, true);
  document.execCommand("copy");
}
