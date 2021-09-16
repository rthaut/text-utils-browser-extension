export const MSG_ACTION_CONVERT_EDITABLE = "ConvertEditableElementCase";
export const MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD =
  "CopyPlainTextToClipboard";
export const MSG_ACTION_COPY_HTML_TO_CLIPBOARD = "CopyHtmlToClipboard";

export const ConvertEditableText = (tabId, frameId, elementId, utilityId) =>
  browser.tabs.sendMessage(
    tabId,
    {
      action: MSG_ACTION_CONVERT_EDITABLE,
      data: {
        elementId,
        utilityId,
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
