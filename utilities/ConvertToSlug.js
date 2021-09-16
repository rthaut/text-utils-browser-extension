const slugify = require("slugify");

export default (text) => slugify(text, { lower: true, strict: true });

export const contexts = ["editable", "selection"];
export const group = "url";
export const version = "1.0.0";
