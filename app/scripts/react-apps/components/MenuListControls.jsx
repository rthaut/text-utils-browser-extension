import React from "react";
import PropTypes from "prop-types";

import { GetDefaultMenuTitle } from "scripts/helpers/menus";

import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";

const MenuListControls = ({ id, menu, updateMenuProp, disabled = false }) => {
  const updateMenuTitle = (title) => updateMenuProp("title", title);

  const resetMenuTitle = () => updateMenuTitle(GetDefaultMenuTitle(id));

  const updateMenuContexts = (contexts) =>
    updateMenuProp("enabledContexts", contexts);

  const MenuContextsSelect = () => {
    const label = browser.i18n.getMessage(
      menu.enabledContexts.length < 1
        ? "SelectContextsToEnable"
        : "EnabledContextsLabel"
    );

    const renderEnabledContexts = (contexts) =>
      contexts
        .sort()
        .map((context) => browser.i18n.getMessage(`ContextTitle_${context}`))
        .join(", ");

    return (
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel id={`select-${id}-label`}>{label}</InputLabel>
        <Select
          labelId={`select-${id}-label`}
          id={`select-${id}`}
          multiple
          value={menu.enabledContexts}
          onChange={(evt) => updateMenuContexts(evt.target.value)}
          input={<OutlinedInput label={label} />}
          renderValue={renderEnabledContexts}
        >
          {menu.possibleContexts.sort().map((context) => (
            <MenuItem key={context} value={context} disableGutters>
              <Checkbox checked={menu.enabledContexts.includes(context)} />
              <ListItemText
                primary={browser.i18n.getMessage(`ContextTitle_${context}`)}
              />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      spacing={2}
    >
      <Grid item xs={12} sm={8} md={9}>
        <TextField
          disabled={disabled}
          fullWidth
          label={id}
          type="text"
          size="small"
          value={menu.title}
          error={menu.title === ""}
          helperText={
            menu.title === ""
              ? browser.i18n.getMessage("Error_MenuTitleRequired")
              : null
          }
          onChange={(evt) => updateMenuTitle(evt.target.value)}
          InputProps={{
            endAdornment: !disabled && (
              <InputAdornment position="end">
                <Tooltip
                  title={browser.i18n.getMessage(
                    "OptionsButtonResetMenuTitleTooltip"
                  )}
                  placement="top"
                >
                  <IconButton onClick={(_evt) => resetMenuTitle()} size="large">
                    <SettingsBackupRestoreIcon />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12} sm={4} md={3}>
        <MenuContextsSelect />
      </Grid>
    </Grid>
  );
};

MenuListControls.propTypes = {
  id: PropTypes.string.isRequired,
  menu: PropTypes.shape({
    title: PropTypes.string.isRequired,
    enabledContexts: PropTypes.arrayOf(PropTypes.string).isRequired,
    possibleContexts: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  updateMenuProp: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default MenuListControls;
