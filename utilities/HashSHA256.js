import { digest } from "./lib/hash";

export default (text) => digest("SHA-256", text);

export const contexts = ["editable", "selection"];
export const group = "hash";
export const version = "1.0.0";
