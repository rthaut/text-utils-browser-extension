import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import amber from "@material-ui/core/colors/amber";
import indigo from "@material-ui/core/colors/indigo";

import AppBar from "@material-ui/core/AppBar";
import Paper from "@material-ui/core/Paper";
import Tab from "@material-ui/core/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";

import MenusTab from "./tabs/MenusTab";
import AdvancedTab from "./tabs/AdvancedTab";

export default function OptionsApp() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: prefersDarkMode
          ? {
              type: "dark",
              primary: amber,
              secondary: amber,
            }
          : {
              type: "light",
              primary: indigo,
              secondary: indigo,
            },
      }),
    [prefersDarkMode]
  );

  React.useEffect(() => {
    document.title = browser.i18n.getMessage("OptionsPageTitle");
  }, []);

  const tabs = {
    menus: <MenusTab />,
    advanced: <AdvancedTab />,
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
