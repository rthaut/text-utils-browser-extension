require("scripts/polyfills/contextMenus.getTargetElement");

import {
  MSG_ACTION_CONVERT_EDITABLE,
  MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD,
  MSG_ACTION_COPY_HTML_TO_CLIPBOARD,
  MSG_ACTION_TOGGLE_OVERLAY_FRAME,
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

    case MSG_ACTION_TOGGLE_OVERLAY_FRAME:
      ToggleOverlayFrame();
      break;

    default:
      break;
  }
});

const OVERLAY_FRAME_ID = "overlay-frame";

const InitOverlayFrame = (url = "pages/quick-actions-overlay.html") => {
  const id = OVERLAY_FRAME_ID;
  let iframe = document.getElementById(id);
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.setAttribute("id", id);
    iframe.setAttribute("role", "dialog");
    iframe.setAttribute("src", browser.runtime.getURL(url));
    Object.assign(iframe.style, {
      display: "none",
      zIndex: 9999,
      margin: 0,
      padding: 0,
      background: "transparent",
      border: "none",
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
    });
    document.body.prepend(iframe);
  }
};

const ShowOverlayFrame = (url = null) => {
  const iframe = document.getElementById(OVERLAY_FRAME_ID);
  if (iframe) {
    if (url) {
      iframe.setAttribute("src", browser.runtime.getURL(url));
    }
    document.documentElement.style.overflowY = "hidden";
    document.body.style.overflowY = "hidden";
    iframe.style.display = "block";
  }
};

const HideOverlayFrame = () => {
  const iframe = document.getElementById(OVERLAY_FRAME_ID);
  if (iframe) {
    iframe.style.display = "none";
    document.body.style.overflowY = "";
    document.documentElement.style.overflowY = "";
  }
};

const ToggleOverlayFrame = () => {
  const iframe = document.getElementById(OVERLAY_FRAME_ID);
  if (iframe) {
    if (iframe.style.display === "block") {
      iframe.style.display = "none";
      document.body.style.overflowY = "";
      document.documentElement.style.overflowY = "";
    } else {
      document.documentElement.style.overflowY = "hidden";
      document.body.style.overflowY = "hidden";
      iframe.style.display = "block";
    }
  }
};

(async () => {
  InitOverlayFrame();
})();
