import ConvertToLowerCase from "./ConvertToLowerCase";
import apStyleTitleCase from "ap-style-title-case";

export default (text) =>
  apStyleTitleCase(ConvertToLowerCase(text), { keepSpaces: true });

export const contexts = ["editable", "selection"];
export const group = "change-case";
export const version = "1.0.0";
