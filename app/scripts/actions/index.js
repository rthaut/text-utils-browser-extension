const context = require.context("../actions/", true, /\.js$/);

export const GetActions = () => {
  const actions = {};

  context.keys().forEach((path, ...args) => {
    const name = path.replace(/(?:^[.\/]*\/|\.[^.]+$)/g, "");
    const group = name.substr(0, name.indexOf("/")).replace(/\//g, "-");
    const file = name.replace(/\//g, "-");

    if (!(group === "" && file === "index")) {
      Object.entries(context(path, ...args)).forEach(([id, func]) => {
        actions[id] = { func, group };
      });
    }
  });

  console.log("GetActions()", actions);
  return actions;
};

export default GetActions();
