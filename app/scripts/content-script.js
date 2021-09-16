require("scripts/polyfills/menus.getTargetElement.js");

import {
  MSG_ACTION_CONVERT_EDITABLE,
  MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD,
  MSG_ACTION_COPY_HTML_TO_CLIPBOARD,
} from "scripts/helpers/messages";

import { ApplyUtilityToEditableElement } from "scripts/helpers/editable-helper";

browser.runtime.onMessage.addListener((message) => {
  switch (message.action) {
    case MSG_ACTION_CONVERT_EDITABLE:
      ApplyUtilityToEditableElement(
        message.data.elementId,
        message.data.utilityId
      );
      break;

    case MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD:
      navigator.clipboard.writeText(message.data.text);
      break;

    case MSG_ACTION_COPY_HTML_TO_CLIPBOARD:
      navigator.clipboard.writeText(message.data.html);
      break;

    default:
      break;
  }
});
