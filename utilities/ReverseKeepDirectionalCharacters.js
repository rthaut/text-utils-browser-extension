import Reverse from "./Reverse";

export default (text) => Reverse(text)
  .replace(/[\<\>\[\]\{\}\(\)]/g, (char) => {
    switch (char) {
      case "<": return ">"
      case ">": return "<"
      case "[": return "]"
      case "]": return "["
      case "{": return "}"
      case "}": return "{"
      case "(": return ")"
      case ")": return "("
      default: return char;
    }
  });

export const contexts = ["editable", "selection"];
export const group = "reverse";
export const version = "1.0.0";
