import React from "react";

import { useChromeStorageSync as useBrowserStorageSync } from "use-chrome-storage";

import {
  CONFIG_STORAGE_KEY,
  GetDefaultMenuConfigs,
  GetDefaultMenuTitle,
  GetMenuConfigsFromStorage,
  GetMenusWithConfigs,
} from "scripts/menus";

import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";

import MenuList from "./MenuList";

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
      setMenus(await GetMenusWithConfigs());
      setConfigs(await GetMenuConfigsFromStorage());
    })();
  }, []);

  const updateMenus = (newMenus) => {
    // update the full menu structure to keep the UI in sync
    setMenus({
      ...newMenus,
    });

    // update the configs structure in storage
    setConfigs({
      ...Object.fromEntries(
        Object.values(newMenus).map(
          ({ id, enabledContexts, order, title, ...menu }) => [
            id,
            {
              enabledContexts,
              order,
              title: title !== GetDefaultMenuTitle(id) ? title : null,
            },
          ]
        )
      ),
    });
  };

  const resetMenus = async () => {
    const defaultConfigs = GetDefaultMenuConfigs();
    setConfigs({
      ...defaultConfigs,
    });

    setMenus(await GetMenusWithConfigs());
  };

  return (
    <>
      <MenuList menus={menus} updateMenus={updateMenus} />
      <Box display="flex" justifyContent="center" mb={2} p={1}>
        <ThemeProvider theme={resetButtonTheme}>
          <Button
            variant="contained"
            color="primary"
            fullWidth={false}
            size="large"
            startIcon={<SettingsBackupRestoreIcon />}
            onClick={(_evt) => resetMenus()}
          >
            {browser.i18n.getMessage("OptionsButtonResetMenusText")}
          </Button>
        </ThemeProvider>
      </Box>
    </>
  );
}
