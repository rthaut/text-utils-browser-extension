/* eslint-disable no-use-before-define */
import React from "react";

import { GetMenusWithConfigs } from "scripts/menus";

import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import Container from "@material-ui/core/Container";
import Modal from "@material-ui/core/Modal";
import TextField from "@material-ui/core/TextField";

const theme = createTheme({
  palette: {
    type: "dark",
  },
});

export default function QuickActionsOverlayApp() {
  const [options, setOptions] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const actions = await GetMenusWithConfigs();
      const optionsArray = [].concat.apply(
        [],
        Object.values(actions).map((menus) =>
          Object.values(menus).map((menu) => ({
            id: menu.id,
            enabled: menu.enabled,
            order: menu.order,
            title: menu.title,
          }))
        )
      );
      setOptions(optionsArray);
    })();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Modal open>
        <Container maxWidth="md">
          <Autocomplete
            open
            autoComplete
            autoHighlight
            // onClose={handleClose}
            onChange={(evt, value) => {
              console.log(value);
            }}
            disableCloseOnSelect
            disablePortal
            fullWidth
            renderTags={() => null}
            // renderOption={(option, { selected }) => (
            //   <React.Fragment>
            //     <div className={classes.text}>{option.title}</div>
            //   </React.Fragment>
            // )}
            options={options}
            getOptionLabel={(option) => option.title}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                margin="normal"
                variant="filled"
                color="secondary"
                inputProps={{
                  ...params.inputProps,
                  onKeyDown: (event) => {
                    switch (event.key) {
                      case "Tab": {
                        console.log("tab key", event);
                        break;
                      }
                    }
                  },
                }}
              />
            )}
          />
        </Container>
      </Modal>
    </ThemeProvider>
  );
}
