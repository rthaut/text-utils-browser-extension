export const SETTINGS_STORAGE_KEY = "settings";

export const DEFAULT_SETTINGS = {
  EditableApplyToSelectedTextOnly: true,
};

export const GetSetting = async (key) => {
  const { [SETTINGS_STORAGE_KEY]: settings } = await browser.storage.sync.get({
    [SETTINGS_STORAGE_KEY]: DEFAULT_SETTINGS,
  });

  return settings?.[key];
};
