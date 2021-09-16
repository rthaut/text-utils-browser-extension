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

  browser.menus = {
    ...(browser.menus ?? {}),
    getTargetElement: function () {
      clearMenuTargetIfInvalid();
      return menuTarget;
    },
  };
}
