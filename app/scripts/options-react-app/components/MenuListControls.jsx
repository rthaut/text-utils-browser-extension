import React from "react";
import PropTypes from "prop-types";

import { GetDefaultMenuTitle } from "scripts/menus";

import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Tooltip from "@material-ui/core/Tooltip";

import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";

const MenuListControls = ({ id, menu, updateMenuProp, disabled = false }) => {
  const updateMenuTitle = (id, title) => updateMenuProp(id, "title", title);

  const resetMenuTitle = (id) => updateMenuTitle(id, GetDefaultMenuTitle(id));

  const updateMenuContexts = (id, contexts) =>
    updateMenuProp(id, "enabledContexts", contexts);

  const MenuContextsSwitches = () => {
    const handleChange = (evt) => {
      const contexts = Array.from(menu.enabledContexts).filter(
        (context) => context !== evt.target.name
      );
      if (evt.target.checked) {
        contexts.push(evt.target.name);
      }
      updateMenuContexts(id, contexts.sort());
    };

    return (
      <FormControl component="fieldset" fullWidth>
        <FormGroup row>
          {menu.possibleContexts.sort().map((context) => (
            <FormControlLabel
              key={context}
              control={
                <Switch
                  checked={menu.enabledContexts.includes(context)}
                  onChange={handleChange}
                  name={context}
                  size="small"
                />
              }
              label={browser.i18n.getMessage(`ContextTitle_${context}`)}
            />
          ))}
        </FormGroup>
      </FormControl>
    );
  };

  const MenuContextsSelect = () => {
    const renderEnabledContexts = (contexts) =>
      contexts
        .sort()
        .map((context) => browser.i18n.getMessage(`ContextTitle_${context}`))
        .join(", ");

    return (
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel htmlFor={`select-${id}`}>
          {browser.i18n.getMessage(
            menu.enabledContexts.length < 1
              ? "SelectContextsToEnable"
              : "EnabledContextsLabel"
          )}
        </InputLabel>
        {/* TODO: prevent the select menu from closing when checking/un-checking an option */}
        <Select
          multiple
          label={browser.i18n.getMessage("EnabledContextsLabel")}
          name={`select-${id}`}
          value={menu.enabledContexts}
          onChange={(evt) => updateMenuContexts(id, evt.target.value)}
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
          onChange={(evt) => updateMenuTitle(id, evt.target.value)}
          InputProps={{
            endAdornment: !disabled && (
              <InputAdornment position="end">
                <Tooltip
                  title={browser.i18n.getMessage(
                    "OptionsButtonResetMenuTitleTooltip"
                  )}
                  placement="top"
                >
                  <IconButton onClick={(_evt) => resetMenuTitle(id)}>
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
        {/* <MenuContextsSwitches /> */}
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
