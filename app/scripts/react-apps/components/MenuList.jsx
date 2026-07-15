import React from "react";
import PropTypes from "prop-types";

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { useTheme } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import DragHandleIcon from "@mui/icons-material/DragHandle";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

import MenuListControls from "./MenuListControls";

const ReorderItemInList = (list, sourceIndex, targetIndex) => {
  const result = Array.from(list);
  const [item] = result.splice(sourceIndex, 1);
  result.splice(targetIndex, 0, item);
  return result;
};

const MenuListItem = ({ id, menu, index, isDraggingOver, updateMenuProp }) => {
  const theme = useTheme();

  const [isHovered, setIsHovered] = React.useState(false);

  const getListItemStyle = React.useCallback(
    (draggableStyle, isDragging, isDisabled) => ({
      ...draggableStyle,
      ...(isDisabled && {
        background: theme.palette.action.disabledBackground,
      }),
      ...(isDragging && {
        background: theme.palette.action.hover,
        border: "1px solid",
        borderColor: theme.palette.primary.main,
      }),
    }),
    [theme]
  );

  return (
    <Draggable draggableId={id} index={index}>
      {(draggableProvided, draggableSnapshot) => (
        <ListItem
          divider
          ref={draggableProvided.innerRef}
          {...draggableProvided.draggableProps}
          style={getListItemStyle(
            draggableProvided.draggableProps.style,
            draggableSnapshot.isDragging,
            !menu.enabledContexts.length
          )}
          sx={{ height: (theme) => theme.spacing(8) }}
        >
          <ListItemIcon
            {...draggableProvided.dragHandleProps}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isHovered || draggableSnapshot.isDragging ? (
              <DragHandleIcon fontSize="large" color="secondary" />
            ) : (
              <UnfoldMoreIcon fontSize="large" color="disabled" />
            )}
          </ListItemIcon>
          {isDraggingOver ? (
            <ListItemText
              primary={menu.title}
              sx={{
                color:
                  menu.enabledContexts.length > 0
                    ? "text.primary"
                    : "text.disabled",
              }}
            />
          ) : (
            <MenuListControls
              id={id}
              menu={menu}
              updateMenuProp={updateMenuProp}
              disabled={!menu.enabledContexts.length}
            />
          )}
        </ListItem>
      )}
    </Draggable>
  );
};

MenuListItem.propTypes = {
  id: PropTypes.string.isRequired,
  menu: PropTypes.shape({
    title: PropTypes.string.isRequired,
    enabledContexts: PropTypes.arrayOf(PropTypes.string).isRequired,
    possibleContexts: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  index: PropTypes.number.isRequired,
  isDraggingOver: PropTypes.bool,
  updateMenuProp: PropTypes.func.isRequired,
};

const MenuList = ({ menus, updateMenus }) => {
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

  const updateMenuProp = (id) => (prop, value) => {
    menus.forEach((menu) => {
      if (menu.id === id) {
        menu[prop] = value;
      }
    });
    updateMenus(menus);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(droppableProvided, droppableSnapshot) => (
          <List disablePadding ref={droppableProvided.innerRef}>
            {menus
              .sort((a, b) => a.order - b.order)
              .map(({ id, ...menu }, index) => (
                <MenuListItem
                  key={id}
                  id={id}
                  menu={menu}
                  index={index}
                  isDraggingOver={droppableSnapshot.isDraggingOver}
                  updateMenuProp={updateMenuProp(id)}
                />
              ))}
            {droppableProvided.placeholder}
          </List>
        )}
      </Droppable>
    </DragDropContext>
  );
};

MenuList.propTypes = {
  menus: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      enabledContexts: PropTypes.arrayOf(PropTypes.string).isRequired,
      possibleContexts: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ),
  updateMenus: PropTypes.func.isRequired,
};

export default MenuList;
