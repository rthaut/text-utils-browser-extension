import React from "react";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
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
    menus.forEach((menu) => {
      if (menu.id === id) {
        menu[prop] = value;
      }
    });

    updateMenus(menus);
  };

  const toggleMenuEnabled = (id, isChecked) =>
    updateMenuProp(id, "enabled", isChecked);

  const updateMenuTitle = (id, title) => updateMenuProp(id, "title", title);

  const resetMenuTitle = (id) => updateMenuTitle(id, GetDefaultMenuTitle(id));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(droppableProvided, droppableSnapshot) => (
          <List className={classes.root} ref={droppableProvided.innerRef}>
            {Object.entries(menus).map(([id, menu], index) => (
              <Draggable key={id} draggableId={id} index={index}>
                {(draggableProvided, draggableSnapshot) => (
                  <ListItem
                    disabled={!menu.enabled}
                    divider
                    ContainerComponent="li"
                    ContainerProps={{ ref: draggableProvided.innerRef }}
                    {...draggableProvided.draggableProps}
                    style={getListItemStyle(
                      draggableSnapshot.isDragging,
                      draggableProvided.draggableProps.style
                    )}
                  >
                    <ListItemIcon {...draggableProvided.dragHandleProps}>
                      <DragHandleIcon />
                    </ListItemIcon>
                    {draggableSnapshot.isDragging ? (
                      <ListItemText primary={menu.title} />
                    ) : (
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
                    )}
                    <ListItemSecondaryAction>
                      {!droppableSnapshot.isDraggingOver && (
                        <Checkbox
                          edge="end"
                          onChange={(evt) =>
                            toggleMenuEnabled(menu.id, evt.target.checked)
                          }
                          checked={menu.enabled}
                        />
                      )}
                    </ListItemSecondaryAction>
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
