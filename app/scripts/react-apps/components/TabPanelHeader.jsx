import React from "react";
import PropTypes from "prop-types";

import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

export default function TabPanelHeader({ title, icon = null }) {
  return (
    <Grid
      container
      wrap="nowrap"
      spacing={1}
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      sx={{ borderBottom: 1, borderColor: "primary.main" }}
    >
      {icon && <Grid>{icon}</Grid>}
      <Grid size="grow">
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      </Grid>
    </Grid>
  );
}

TabPanelHeader.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
};
