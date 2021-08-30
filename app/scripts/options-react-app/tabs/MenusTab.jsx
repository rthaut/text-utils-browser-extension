import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import MenusEditor from "../components/MenusEditor";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

export default function MenusTab() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <MenusEditor />
    </div>
  );
}
