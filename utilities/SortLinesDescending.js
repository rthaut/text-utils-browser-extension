import sortLines from "./lib/sort-lines";

export default (text) => sortLines(text, true);

export const contexts = ["editable", "selection"];
export const group = "sort";
export const version = "1.0.0";
