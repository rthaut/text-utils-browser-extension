export default (text) => text.replace(/^\s+/g, "");

export const contexts = ["editable", "selection"];
export const group = "whitespace";
export const version = "1.0.0";
