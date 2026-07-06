import { browser } from "wxt/browser";
import { defineContentScript } from "wxt/utils/define-content-script";

import {
  MSG_ACTION_CONVERT_EDITABLE,
  MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD,
  MSG_ACTION_COPY_HTML_TO_CLIPBOARD,
} from "scripts/helpers/messages";

import { ApplyUtilityToEditableElement } from "scripts/helpers/editable-helper";

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  matchAboutBlank: true,
  runAt: "document_end",
  async main() {
    await import("scripts/polyfills/menus.getTargetElement.js");

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
  },
});
