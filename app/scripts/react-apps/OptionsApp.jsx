import React from "react";

import useTheme from "./hooks/useTheme";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import AppBar from "@mui/material/AppBar";
import Paper from "@mui/material/Paper";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";

import MenusTab from "./tabs/MenusTab";
import SettingsTab from "./tabs/SettingsTab";

export default function OptionsApp() {
  const theme = useTheme();

  React.useEffect(() => {
    document.title = browser.i18n.getMessage("OptionsPageTitle");
  }, []);

  const tabs = {
    menus: <MenusTab />,
    settings: <SettingsTab />,
  };

  const [tabValue, setTabValue] = React.useState(Object.keys(tabs)[0]);

  const handleTabChange = (_evt, tabValue) => {
    setTabValue(tabValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Paper elevation={0} square variant="outlined">
        <TabContext value={tabValue}>
          <AppBar position="static" color="default">
            <TabList onChange={handleTabChange} variant="fullWidth">
              {Object.keys(tabs).map((name) => (
                <Tab
                  label={browser.i18n.getMessage(`OptionsTabName${name}`)}
                  value={name}
                  key={name}
                />
              ))}
            </TabList>
          </AppBar>
          {Object.entries(tabs).map(([name, panel]) => (
            <TabPanel value={name} key={name}>
              {panel}
            </TabPanel>
          ))}
        </TabContext>
      </Paper>
    </ThemeProvider>
  );
}
