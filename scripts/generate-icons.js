const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

const sizes = [16, 19, 24, 32, 38, 48, 64, 96, 128];
const inputFile = path.resolve("resources/logo.svg");
const outputDir = path.resolve("public/images/");

const input = fs.readFileSync(inputFile);

sizes.forEach((size) => {
  const resvg = new Resvg(input, { fitTo: { mode: "width", value: size } });
  const output = resvg.render().asPng();

  const outputFilename = "icon-" + size.toString() + ".png";
  fs.writeFileSync(path.join(outputDir, outputFilename), output, {
    flag: "w",
  });
  console.log("Created", outputFilename, "in", outputDir);
});
