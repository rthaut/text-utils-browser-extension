import React from "react";

import { useChromeStorageSync as useBrowserStorageSync } from "use-chrome-storage";

import {
  CONFIG_STORAGE_KEY,
  GetDefaultMenuConfigs,
  GetDefaultMenuTitle,
  GetMenuConfigsFromStorage,
  GetMenusWithConfigs,
} from "scripts/menus";

import {
  createTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { red } from "@material-ui/core/colors";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";

import MenuList from "./MenuList";

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderBottom: "1px solid " + theme.palette.grey[400],
    paddingLeft: theme.spacing(9),
  },
}));

const resetButtonTheme = createTheme({
  palette: {
    primary: red,
  },
});

const MenusEditor = () => {
  const classes = useStyles();

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
    setMenus(Object.fromEntries(newMenus.map(({ id, ...menu }) => [id, menu])));

    // update the configs structure in storage
    setConfigs({
      ...Object.fromEntries(
        newMenus.map(({ id, enabledContexts, order, title }) => [
          id,
          {
            enabledContexts,
            order,
            title:
              title !== GetDefaultMenuTitle(id) && title !== "" ? title : null,
          },
        ])
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
    <Box border={1} borderColor="grey.400" width="auto">
      {Object.keys(menus).length ? (
        <>
          <AppBar
            className={classes.appBar}
            color="default"
            position="sticky"
            elevation={0}
            variant="elevation"
            square
          >
            <Toolbar disableGutters>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={12} sm={8} md={9}>
                  <Typography color="textPrimary" variant="subtitle1" noWrap>
                    <b>{browser.i18n.getMessage("MenuTitleLabel")}</b>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={3}>
                  <Typography color="textPrimary" variant="subtitle1" noWrap>
                    <b>{browser.i18n.getMessage("EnabledContextsLabel")}</b>
                  </Typography>
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
          <MenuList
            menus={Object.entries(menus).map(([id, menu]) => ({ id, ...menu }))}
            updateMenus={updateMenus}
          />
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          m={1}
          p={1}
          width="auto"
        >
          <CircularProgress size={120} color="secondary" />
        </Box>
      )}
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
    </Box>
  );
};

export default MenusEditor;
