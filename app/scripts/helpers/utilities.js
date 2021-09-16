const context = require.context("../../../utilities/", true, /\.js$/);

export const GetUtilities = () => {
  const utilities = {};

  context.keys().forEach((path, ...args) => {
    const name = path.replace(/(?:^[.\/]*\/|\.[^.]+$)/g, "");
    const { default: fn, ...utility } = context(path, ...args);
    utilities[name] = { fn, ...utility };
  });

  // console.log("GetUtilities()", utilities);
  return utilities;
};

export default GetUtilities();
