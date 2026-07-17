import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";
import { debounce } from "debounce";

import {
  CONFIG_STORAGE_KEY,
  OnMenuClicked,
  RebuildMenus,
  SoftResetStoredMenuConfigs,
} from "scripts/helpers/menus";

export default defineBackground({
  main() {
    // all listeners must be registered synchronously so they are
    // re-attached whenever the (non-persistent) background restarts
    browser.contextMenus.onClicked.addListener(OnMenuClicked);

    browser.runtime.onInstalled.addListener(async (details) => {
      console.log("Installation Details", details);

      await SoftResetStoredMenuConfigs();
    });

    // MV3 exposes `action`; MV2 (Firefox) still uses `browserAction`
    (browser.action ?? browser.browserAction).onClicked.addListener(() => {
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
        if (
          area === "sync" &&
          Object.keys(changes).includes(CONFIG_STORAGE_KEY)
        ) {
          RebuildMenus();
        }
      }, 1000)
    );

    RebuildMenus();
  },
});
