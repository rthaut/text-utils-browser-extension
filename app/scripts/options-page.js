import React from "react";
import ReactDOM from "react-dom";

import OptionsReactApp from "./react-apps/OptionsApp.jsx";

ReactDOM.render(<OptionsReactApp />, document.querySelector("#root"));

const params = new URL(document.location).searchParams;
const vendor = params.get("vendor");
if (vendor) {
  document.documentElement.classList.add(`browser-${vendor}`);
}
