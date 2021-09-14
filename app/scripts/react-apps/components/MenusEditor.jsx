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
  ThemeProvider,
  StyledEngineProvider,
} from "@mui/material/styles";
import { red } from "@mui/material/colors";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";

import MenuList from "./MenuList";

const redButtonTheme = createTheme({
  palette: {
    primary: red,
  },
});

const MenusEditor = () => {
  const [showResetConfirmationDialog, setShowResetConfirmationDialog] =
    React.useState(false);
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
    setShowResetConfirmationDialog(false);
  };

  return (
    <>
      <Box border={1} borderColor="divider" width="auto">
        {Object.keys(menus).length ? (
          <>
            <AppBar
              color="default"
              position="sticky"
              elevation={0}
              variant="elevation"
              square
            >
              <Toolbar
                disableGutters
                sx={{ marginLeft: (theme) => theme.spacing(10) }}
              >
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
              menus={Object.entries(menus).map(([id, menu]) => ({
                id,
                ...menu,
              }))}
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
        <Box display="flex" justifyContent="center" my={2} p={1}>
          <ThemeProvider theme={redButtonTheme}>
            <Button
              variant="contained"
              color="primary"
              fullWidth={false}
              size="large"
              startIcon={<SettingsBackupRestoreIcon />}
              onClick={(_evt) => setShowResetConfirmationDialog(true)}
            >
              {browser.i18n.getMessage("OptionsButtonResetMenusText")}
            </Button>
          </ThemeProvider>
        </Box>
      </Box>
      <Dialog
        fullWidth
        open={showResetConfirmationDialog}
        onClose={(_evt) => setShowResetConfirmationDialog(false)}
      >
        <DialogContent>
          <Typography gutterBottom>
            {browser.i18n.getMessage("OptionsResetConfirmationText")}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            color="inherit"
            fullWidth={false}
            onClick={(_evt) => setShowResetConfirmationDialog(false)}
            autoFocus
          >
            {browser.i18n.getMessage(
              "OptionsResetConfirmationButtonDeclineText"
            )}
          </Button>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={redButtonTheme}>
              <Button
                variant="text"
                color="primary"
                fullWidth={false}
                onClick={(_evt) => resetMenus()}
              >
                {browser.i18n.getMessage(
                  "OptionsResetConfirmationButtonAcceptText"
                )}
              </Button>
            </ThemeProvider>
          </StyledEngineProvider>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MenusEditor;
