import { debounce } from "debounce";

import {
  CONFIG_STORAGE_KEY,
  GetDefaultMenuConfigs,
  RebuildMenus,
} from "scripts/menus";

browser.runtime.onInstalled.addListener((details) => {
  console.log("Installation details", details);

  // TODO: this needs to be smarter: it should remove invalid items, and add missing items, but not change any valid items
  browser.storage.sync.set({ [CONFIG_STORAGE_KEY]: GetDefaultMenuConfigs() });
});

// browser.browserAction.onClicked.addListener(() => {
//   if (browser.runtime.openOptionsPage) {
//     browser.runtime.openOptionsPage();
//   } else {
//     browser.management
//       .getSelf()
//       .then(({ optionsUrl: url }) =>
//         browser.windows.create({ url, type: "popup" })
//       );
//   }
// });

browser.browserAction.onClicked.addListener(() =>
  browser.management
    .getSelf()
    .then(({ optionsUrl: url }) => browser.tabs.create({ url }))
);

browser.storage.onChanged.addListener(
  debounce((changes, area) => {
    if (area === "sync" && Object.keys(changes).includes(CONFIG_STORAGE_KEY)) {
      RebuildMenus();
    }
  }, 1000)
);

RebuildMenus();
