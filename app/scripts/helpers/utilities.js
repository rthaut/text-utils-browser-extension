const utilityModules = import.meta.glob("../../../utilities/*.js", {
  eager: true,
});

export const GetUtilities = () => {
  const utilities = {};

  Object.entries(utilityModules).forEach(([path, module]) => {
    const name = path.split("/").pop().replace(/\.[^.]+$/, "");
    const { default: fn, ...utility } = module;
    utilities[name] = { fn, ...utility };
  });

  // console.log("GetUtilities()", utilities);
  return utilities;
};

export default GetUtilities();
