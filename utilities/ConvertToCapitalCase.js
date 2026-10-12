import { capitalCase } from "text-case";

import { keepInWordApostrophes } from "./lib/apostrophes";

export default (text) => capitalCase(text, keepInWordApostrophes);

export const contexts = ["editable", "selection"];
export const group = "change-case";
export const version = "1.0.0";
