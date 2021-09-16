const slugify = require("slugify");

export default (text) => slugify(text, { lower: false, strict: true });

export const contexts = ["editable", "selection"];
export const group = "url";
export const version = "1.0.0";
