import React from "react";
import PropTypes from "prop-types";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import { makeStyles, useTheme } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import DragHandleIcon from "@material-ui/icons/DragHandle";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import UnfoldMoreIcon from "@material-ui/icons/UnfoldMore";

import MenuListControls from "./MenuListControls";

const ReorderItemInList = (list, sourceIndex, targetIndex) => {
  const result = Array.from(list);
  const [item] = result.splice(sourceIndex, 1);
  result.splice(targetIndex, 0, item);
  return result;
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  menuListItem: {
    height: theme.spacing(8),
  },
}));

const MenuList = ({ menus, updateMenus }) => {
  const classes = useStyles();
  const theme = useTheme();

  const getListItemStyle = (draggableStyle, isDragging, isDisabled) => ({
    ...draggableStyle,
    ...(isDisabled && {
      background: theme.palette.background.default,
    }),
    ...(isDragging && {
      background: theme.palette.background.default,
      border: "1px solid",
      borderColor: theme.palette.divider,
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
          <List
            disablePadding
            className={classes.root}
            ref={droppableProvided.innerRef}
          >
            {menus
              .sort((a, b) => a.order - b.order)
              .map(({ id, ...menu }, index) => {
                const [isHovered, setIsHovered] = React.useState();
                return (
                  <Draggable key={id} draggableId={id} index={index}>
                    {(draggableProvided, draggableSnapshot) => (
                      <ListItem
                        divider
                        ContainerComponent="li"
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        style={getListItemStyle(
                          draggableProvided.draggableProps.style,
                          draggableSnapshot.isDragging,
                          !menu.enabledContexts.length
                        )}
                        className={classes.menuListItem}
                      >
                        <ListItemIcon
                          {...draggableProvided.dragHandleProps}
                          onMouseEnter={() => setIsHovered(true)}
                          onMouseLeave={() => setIsHovered(false)}
                        >
                          {/* <DragHandleIcon fontSize="large" color={(isHovered || draggableSnapshot.isDragging) ? "inherit" : "disabled"} /> */}
                          {isHovered || draggableSnapshot.isDragging ? (
                            <DragHandleIcon
                              fontSize="large"
                              color="secondary"
                            />
                          ) : (
                            <UnfoldMoreIcon fontSize="large" color="disabled" />
                          )}
                        </ListItemIcon>
                        {droppableSnapshot.isDraggingOver ? (
                          <ListItemText primary={menu.title} />
                        ) : (
                          <MenuListControls
                            id={id}
                            menu={menu}
                            updateMenuProp={updateMenuProp(id)}
                            disabled={!menu.enabledContexts.length}
                          />
                        )}
                      </ListItem>
                    )}
                  </Draggable>
                );
              })}
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
