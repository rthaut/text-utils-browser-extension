import { pathCase } from "text-case";

import { removeInWordApostrophes } from "./lib/apostrophes";

export default (text) => pathCase(removeInWordApostrophes(text));

export const contexts = ["editable", "selection"];
export const group = "change-case";
export const version = "1.0.0";
