export const Reverse = (text) => text.split("").reverse().join("");

// TODO: there are many more unicode characters, like arrows, angled brackets, quote marks
// TODO: it would be nice to maintain the list just once; i.e. generate the Regex and the replacement logic from a different structure
export const ReverseKeepDirectionalCharacters = (text) =>
  Reverse(text).replace(/[\<\>\[\]\{\}\(\)\‘\’\“\”\‛\‚\‟\„]/g, (char) => {
    switch (char) {
      case "<": return ">"
      case ">": return "<"
      case "[": return "]"
      case "]": return "["
      case "{": return "}"
      case "}": return "{"
      case "(": return ")"
      case ")": return "("
      case "‘": return "’"
      case "’": return "‘"
      case "“": return "”"
      case "”": return "“"
      case "‛": return "‚"
      case "‚": return "‛"
      case "‟": return "„"
      case "„": return "‟"
      default: return char;
    }
  });
