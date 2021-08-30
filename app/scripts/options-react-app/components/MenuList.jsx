import React from "react";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Tooltip from "@material-ui/core/Tooltip";

import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import DragHandleIcon from "@material-ui/icons/DragHandle";

import { GetDefaultMenuTitle } from "scripts/menus";

const ReorderItemInList = (list, sourceIndex, targetIndex) => {
  const result = Array.from(list);
  const [item] = result.splice(sourceIndex, 1);
  result.splice(targetIndex, 0, item);
  return result;
};

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

export default function MenuList({ menus, updateMenus }) {
  const classes = useStyles();
  const theme = useTheme();

  const getListItemStyle = (isDragging, draggableStyle) => ({
    ...draggableStyle,
    ...(isDragging && {
      background: theme.palette.action.selected,
    }),
  });

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    // reorder the menu, then update the ".order" property of each item to match the new order
    const reorderedMenus = ReorderItemInList(
      menus,
      result.source.index,
      result.destination.index
    ).map((value, index) => ({
      ...value,
      order: index + 1,
    }));

    updateMenus(reorderedMenus);
  };

  const updateMenuProp = (id, prop, value) => {
    menus[id][prop] = value;
    updateMenus(menus);
  };

  const updateMenuTitle = (id, title) => updateMenuProp(id, "title", title);

  const resetMenuTitle = (id) => updateMenuTitle(id, GetDefaultMenuTitle(id));

  const updateMenuContexts = (id, context) =>
    updateMenuProp(id, "enabledContexts", context);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(droppableProvided) => (
          <List className={classes.root} ref={droppableProvided.innerRef}>
            {Object.entries(menus).map(([id, menu], index) => (
              <Draggable key={id} draggableId={id} index={index}>
                {(draggableProvided, draggableSnapshot) => (
                  <ListItem
                    // disabled={!menu.enabled}
                    disabled={!menu.enabledContexts.length}
                    divider
                    ContainerComponent="li"
                    ref={draggableProvided.innerRef}
                    {...draggableProvided.draggableProps}
                    style={getListItemStyle(
                      draggableSnapshot.isDragging,
                      draggableProvided.draggableProps.style
                    )}
                  >
                    <ListItemIcon {...draggableProvided.dragHandleProps}>
                      <DragHandleIcon />
                    </ListItemIcon>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8} md={9}>
                        <FormControl fullWidth>
                          <InputLabel>{menu.id}</InputLabel>
                          <Input
                            fullWidth
                            type="text"
                            size="small"
                            value={menu.title}
                            onChange={(evt) =>
                              updateMenuTitle(menu.id, evt.target.value)
                            }
                            endAdornment={
                              <InputAdornment position="end">
                                <Tooltip
                                  title={browser.i18n.getMessage(
                                    "OptionsButtonResetMenuTitleTooltip"
                                  )}
                                  placement="top"
                                >
                                  <IconButton
                                    onClick={(_evt) => resetMenuTitle(menu.id)}
                                  >
                                    <SettingsBackupRestoreIcon />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            }
                          />
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth variant="outlined" size="small">
                          <InputLabel htmlFor={`select-${menu.id}`}>
                            Enabled Contexts
                          </InputLabel>
                          <Select
                            multiple
                            label="Enabled Contexts"
                            name={`select-${menu.id}`}
                            value={menu.enabledContexts}
                            onChange={(evt) =>
                              updateMenuContexts(menu.id, evt.target.value)
                            }
                            renderValue={(selected) =>
                              selected.sort().join(", ")
                            }
                          >
                            {menu.possibleContexts.map((context) => (
                              <MenuItem
                                key={context}
                                value={context}
                                disableGutters
                              >
                                <Checkbox
                                  checked={menu.enabledContexts.includes(
                                    context
                                  )}
                                />
                                <ListItemText primary={context} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </ListItem>
                )}
              </Draggable>
            ))}
            {droppableProvided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
}
