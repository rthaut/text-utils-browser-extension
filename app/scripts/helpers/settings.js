export const SETTINGS_STORAGE_KEY = "settings";

export const DEFAULT_SETTINGS = {
  EditableApplyToSelectedTextOnly: true,
  ForceDarkMode: false,
};

export const GetSetting = async (key, defaultValue = undefined) => {
  const { [SETTINGS_STORAGE_KEY]: settings } = await browser.storage.sync.get({
    [SETTINGS_STORAGE_KEY]: { [key]: defaultValue ?? DEFAULT_SETTINGS[key] },
  });

  const value = settings[key] ?? defaultValue ?? DEFAULT_SETTINGS[key];
  // console.log(key, value);
  return value;
};
