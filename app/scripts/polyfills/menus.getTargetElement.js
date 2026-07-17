import { browser } from "wxt/browser";

if (typeof browser.menus?.getTargetElement !== "function") {
  let menuTarget = null;

  const clearMenuTargetIfInvalid = () => {
    if (menuTarget && !document.contains(menuTarget)) {
      menuTarget = null;
    }
  };

  document.addEventListener(
    "contextmenu",
    (event) => {
      menuTarget = event.target;
    },
    true
  );

  document.addEventListener("visibilitychange", clearMenuTargetIfInvalid, true);

  const isEditable = (element) =>
    element instanceof HTMLElement &&
    (element.isContentEditable ||
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement);

  browser.menus = {
    ...(browser.menus ?? {}),
    getTargetElement: function () {
      clearMenuTargetIfInvalid();

      if (menuTarget) {
        return menuTarget;
      }

      // when the content script is injected on demand (in response to a
      // context menu click), the `contextmenu` event has already fired,
      // so fall back to the focused element (right-clicking an editable
      // element focuses it)
      if (isEditable(document.activeElement)) {
        return document.activeElement;
      }

      return null;
    },
  };
}
