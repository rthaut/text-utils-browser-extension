import { createChromeStorageStateHookSync as createBrowserStorageStateHookSync } from "use-chrome-storage";
import { CONFIG_STORAGE_KEY, GetDefaultMenuConfigs } from "scripts/helpers/menus";

export const useConfigsStore = createBrowserStorageStateHookSync(
  CONFIG_STORAGE_KEY,
  GetDefaultMenuConfigs()
);

export default useConfigsStore;
