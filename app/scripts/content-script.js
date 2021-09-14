require("./polyfills/contextMenus.getTargetElement");

import {
  MSG_ACTION_CONVERT_EDITABLE,
  MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD,
  MSG_ACTION_COPY_HTML_TO_CLIPBOARD,
} from "scripts/utils/messages";

import {
  CopyPlainTextToClipboard,
  CopyHtmlToClipboard,
} from "scripts/utils/clipboard-helper";

import { ConvertEditableElementCase } from "scripts/utils/editable-helper";

// eslint-disable-next-line no-unused-vars
browser.runtime.onMessage.addListener((message, _sender) => {
  switch (message.action) {
    case MSG_ACTION_CONVERT_EDITABLE:
      ConvertEditableElementCase(
        message.data.targetElementId,
        message.data.action
      );
      break;

    case MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD:
      CopyPlainTextToClipboard(message.data.text);
      break;

    case MSG_ACTION_COPY_HTML_TO_CLIPBOARD:
      CopyHtmlToClipboard(message.data.html);
      break;

    default:
      break;
  }
});
