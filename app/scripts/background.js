import { debounce } from "debounce";

import {
  CONFIG_STORAGE_KEY,
  RebuildMenus,
  SoftResetStoredMenuConfigs,
} from "scripts/menus";

browser.runtime.onInstalled.addListener(async (details) => {
  console.log("Installation Details", details);

  await SoftResetStoredMenuConfigs();
});

browser.browserAction.onClicked.addListener(() => {
  if (browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage();
  } else {
    browser.management
      .getSelf()
      .then(({ optionsUrl: url }) =>
        browser.windows.create({ url, type: "popup" })
      );
  }
});

browser.storage.onChanged.addListener(
  debounce((changes, area) => {
    if (area === "sync" && Object.keys(changes).includes(CONFIG_STORAGE_KEY)) {
      RebuildMenus();
    }
  }, 1000)
);

RebuildMenus();
