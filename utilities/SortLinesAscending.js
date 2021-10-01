export default (text) => text.split(/\r?\n/).sort().join("\n");

export const contexts = ["editable", "selection"];
export const group = "sort";
export const version = "1.0.0";
