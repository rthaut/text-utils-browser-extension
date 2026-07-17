import { browser } from "wxt/browser";
import { defineContentScript } from "wxt/utils/define-content-script";

import {
  MSG_ACTION_CONVERT_EDITABLE,
  MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD,
  MSG_ACTION_COPY_HTML_TO_CLIPBOARD,
  MSG_ACTION_PING,
} from "scripts/helpers/messages";

import { ApplyUtilityToEditableElement } from "scripts/helpers/editable-helper";

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  matchAboutBlank: true,
  runAt: "document_end",
  // Firefox (MV2) declares the content script in the manifest;
  // Chrome/Edge (MV3) inject it on demand via `scripting.executeScript()`
  // using the `activeTab` grant from the context menu click, which avoids
  // requesting persistent access to all sites
  registration: import.meta.env.FIREFOX ? "manifest" : "runtime",
  main() {
    const polyfillReady = import(
      "scripts/polyfills/menus.getTargetElement.js"
    );

    // the message listener must be registered synchronously so it is
    // guaranteed to exist by the time `scripting.executeScript()` resolves
    // (the background sends a message immediately after injecting)
    browser.runtime.onMessage.addListener((message) => {
      switch (message.action) {
        case MSG_ACTION_PING:
          return Promise.resolve(true);

        case MSG_ACTION_CONVERT_EDITABLE:
          polyfillReady.then(() =>
            ApplyUtilityToEditableElement(
              message.data.elementId,
              message.data.utilityId
            )
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
