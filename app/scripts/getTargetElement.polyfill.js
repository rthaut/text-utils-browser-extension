if (typeof browser.contextMenus?.getTargetElement !== "function") {
  console.info("using contextMenus.getTargetElement() polyfill");
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

  browser.contextMenus = {
    ...(browser.contextMenus ?? {}),
    getTargetElement: function () {
      clearMenuTargetIfInvalid();
      console.info("contextMenus.getTargetElement() menu target", menuTarget);
      return menuTarget;
    },
  };
}
