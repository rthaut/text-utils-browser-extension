import { useMemo } from "react";

import useDarkMode from "./useDarkMode";

import { createTheme } from "@mui/material/styles";
import { amber, indigo } from "@mui/material/colors";

export const useTheme = () => {
  const darkMode = useDarkMode();
  const theme = useMemo(
    () =>
      createTheme({
        palette: darkMode
          ? {
              mode: "dark",
              primary: amber,
              secondary: amber,
            }
          : {
              mode: "light",
              primary: indigo,
              secondary: indigo,
            },
      }),
    [darkMode]
  );

  return theme;
};

export default useTheme;
