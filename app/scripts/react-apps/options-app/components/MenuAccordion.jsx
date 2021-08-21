import React from "react";

import { useChromeStorageSync as useBrowserStorageSync } from "use-chrome-storage";

import {
  CONFIG_STORAGE_KEY,
  GetDefaultMenuConfigs,
  GetDefaultMenuTitle,
  GetMenuConfigsFromStorage,
  GetMenusAsConfigured,
} from "scripts/menus";

import {
  createTheme,
  withStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import MuiAccordion from "@material-ui/core/Accordion";
import MuiAccordionSummary from "@material-ui/core/AccordionSummary";
import MuiAccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";

import MenuList from "./MenuList";

const Accordion = withStyles((theme) => ({
  root: {
    border: "1px solid",
    borderColor: theme.palette.divider,
    boxShadow: "none",
    "&:not(:last-child)": {
      borderBottom: 0,
      marginBottom: -1,
    },
    "&:before": {
      display: "none",
    },
    "&$expanded": {
      margin: "auto",
    },
  },
  expanded: {},
}))(MuiAccordion);

const AccordionSummary = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    borderBottom: "1px solid",
    borderBottomColor: theme.palette.divider,
    marginBottom: 0,
    minHeight: 56,
    "&$expanded": {
      minHeight: 56,
    },
  },
  content: {
    "&$expanded": {
      margin: theme.spacing(1, 0),
    },
    display: "flex",
    flexDirection: "column",
    margin: theme.spacing(1, 0),
  },
  expanded: {},
}))(MuiAccordionSummary);

const AccordionDetails = withStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    padding: 0,
  },
}))(MuiAccordionDetails);

const resetButtonTheme = createTheme({
  palette: {
    primary: red,
  },
});

export default function MenuAccordion() {
  const [menus, setMenus] = React.useState({});
  const [_, setConfigs] = useBrowserStorageSync(
    CONFIG_STORAGE_KEY,
    GetDefaultMenuConfigs()
  );

  React.useEffect(() => {
    (async () => {
      setMenus(await GetMenusAsConfigured());
      setConfigs(await GetMenuConfigsFromStorage());
    })();
  }, []);

  const updateMenus = (group) => (newMenus) => {
    // update the full menu structure to keep the UI in sync
    setMenus((prevMenus) => ({
      ...prevMenus,
      [group]: newMenus,
    }));

    // update the configs structure in storage
    setConfigs((prevConfigs) => ({
      ...prevConfigs,
      [group]: Object.fromEntries(
        newMenus.map(({ id, enabled, order, title, ...menu }) => [
          id,
          {
            enabled,
            order,
            title: title !== GetDefaultMenuTitle(id) ? title : null,
          },
        ])
      ),
    }));
  };

  const resetMenusForGroup = async (group) => {
    const defaultConfigs = GetDefaultMenuConfigs();
    setConfigs((prevConfigs) => ({
      ...prevConfigs,
      [group]: defaultConfigs[group],
    }));

    setMenus(await GetMenusAsConfigured());
  };

  return (
    <>
      {Object.keys(menus).map((group, index) => (
        <Accordion key={index} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color="textPrimary" variant="subtitle1">
              {browser.i18n.getMessage(
                `MenuGroup_${group.replace(/\-/g, "")}_Title`
              )}
            </Typography>
            <Typography color="textSecondary" variant="subtitle2">
              {browser.i18n.getMessage(
                `MenuGroup_${group.replace(/\-/g, "")}_Description`
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <MenuList menus={menus[group]} updateMenus={updateMenus(group)} />
            <Box display="flex" justifyContent="center" mb={2} p={1}>
              <ThemeProvider theme={resetButtonTheme}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth={false}
                  size="large"
                  startIcon={<SettingsBackupRestoreIcon />}
                  onClick={(_evt) => resetMenusForGroup(group)}
                >
                  {browser.i18n.getMessage(
                    "OptionsButtonResetMenusTextWithGroupNamePlaceholder",
                    browser.i18n.getMessage(
                      `MenuGroup_${group.replace(/\-/g, "")}_Title`
                    )
                  )}
                </Button>
              </ThemeProvider>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}
