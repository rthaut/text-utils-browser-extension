import React from "react";

import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY } from "scripts/utils/settings";

import { useChromeStorageSync as useBrowserStorageSync } from "use-chrome-storage";

import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import SettingsIcon from "@material-ui/icons/Settings";

import TabPanelHeader from "../components/TabPanelHeader";

export default function SettingsTab() {
  const [settings, setSettings] = useBrowserStorageSync(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);

  const handleChange = (event) => {
    setSettings((prevState) => {
      return {
        ...prevState,
        [event.target.name]: event.target.checked,
      };
    });
  };

  return (
    <Box>
      <TabPanelHeader
        icon={<SettingsIcon />}
        title={browser.i18n.getMessage("OptionsHeadingSettings")}
      />
      <Box marginTop={1} marginBottom={2}>
        <FormControl>
          <FormControlLabel
            label={browser.i18n.getMessage(
              "Setting_EditableApplyToSelectedTextOnly_Name"
            )}
            control={
              <Switch
                name="EditableApplyToSelectedTextOnly"
                color="primary"
                checked={settings.EditableApplyToSelectedTextOnly}
                onChange={handleChange}
              />
            }
          />
          <Typography
            color="textSecondary"
            dangerouslySetInnerHTML={{
              __html: browser.i18n.getMessage(
                "Setting_EditableApplyToSelectedTextOnly_Description"
              ),
            }}
          />
        </FormControl>
      </Box>
    </Box>
  );
}
