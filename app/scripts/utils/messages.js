export const MSG_ACTION_CONVERT_EDITABLE = "ConvertEditableElementCase";
export const MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD =
  "CopyPlainTextToClipboard";
export const MSG_ACTION_COPY_HTML_TO_CLIPBOARD = "CopyHtmlToClipboard";

export const ConvertEditableText = (tabId, frameId, targetElementId, action) =>
  browser.tabs.sendMessage(
    tabId,
    {
      action: MSG_ACTION_CONVERT_EDITABLE,
      data: {
        targetElementId,
        action,
      },
    },
    {
      frameId,
    }
  );

export const CopyPlainTextToClipboard = (tabId, text) =>
  browser.tabs.sendMessage(tabId, {
    action: MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD,
    data: {
      text,
    },
  });

export const CopyHtmlToClipboard = (tabId, html) =>
  browser.tabs.sendMessage(tabId, {
    action: MSG_ACTION_COPY_HTML_TO_CLIPBOARD,
    data: {
      html,
    },
  });
