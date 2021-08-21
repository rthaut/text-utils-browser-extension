import React from "react";

import { useChromeStorageSync as useBrowserStorageSync } from "use-chrome-storage";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

export default function AdvancedTab() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography color="error">TODO</Typography>
    </div>
  );
}
