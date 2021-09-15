import React from "react";

import useSettingsStore from "../hooks/useSettingsStore";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import HelpIcon from "@mui/icons-material/HelpCenter";
import SettingsIcon from "@mui/icons-material/Settings";

import TabPanelHeader from "../components/TabPanelHeader";

const manifest = browser.runtime.getManifest();

export default function SettingsTab() {
  const [settings, setSettings] = useSettingsStore();

  const handleChange = (event) => {
    setSettings((prevState) => {
      return {
        ...prevState,
        [event.target.name]: event.target.checked,
      };
    });
  };

  return (
    <>
      <TabPanelHeader
        icon={<SettingsIcon />}
        title={browser.i18n.getMessage("OptionsHeadingSettings")}
      />
      <Box marginTop={1} marginBottom={2}>
        <List disablePadding>
          {["EditableApplyToSelectedTextOnly", "ForceDarkMode"].map(
            (setting) => (
              <ListItem key={setting} divider disableGutters>
                <FormControl component="fieldset" variant="standard">
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings[setting]}
                          name={setting}
                          onChange={handleChange}
                        />
                      }
                      label={browser.i18n.getMessage(
                        `Setting_${setting}_Name`
                      )}
                    />
                  </FormGroup>
                  <FormHelperText>
                    {browser.i18n.getMessage(
                      `Setting_${setting}_Description`
                    )}
                  </FormHelperText>
                </FormControl>
              </ListItem>
            )
          )}
          <ListItem disableGutters>
            <ListItemIcon>
              <HelpIcon sx={{ color: "primary.main", fontSize: 48 }} />
            </ListItemIcon>
            <ListItemText disableTypography>
              <Typography>
                {browser.i18n.getMessage("BugEnhancementTitle")}
              </Typography>
              <Link
                href={manifest.homepage_url.replace(/\/$/, "") + "/issues"}
                target="_blank"
              >
                {browser.i18n.getMessage("BugEnhancementLinkText")}
              </Link>
            </ListItemText>
          </ListItem>
        </List>
      </Box>
    </>
  );
}
