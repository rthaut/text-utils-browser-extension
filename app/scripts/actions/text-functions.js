const apStyleTitleCase = require("ap-style-title-case");
const sarcastify = require("sarcastify");
const slugify = require("slugify");

export const ConvertToHyphenCase = (text) =>
  text.replace(/\s+/g, "-").replace(/\-\-/g, "-");

export const ConvertToLowerCase = (text) =>
  typeof String.prototype.toLocaleLowerCase === "function"
    ? text.toLocaleLowerCase()
    : text.toLowerCase();

export const ConvertToUpperCase = (text) =>
  typeof String.prototype.toLocaleUpperCase === "function"
    ? text.toLocaleUpperCase()
    : text.toUpperCase();

export const ConvertToTitleCase = (text) =>
  text.replace(
    /\b\w+/g,
    (word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
  );

export const ConvertToTitleCaseAPStyle = (text) =>
  apStyleTitleCase(text, { keepSpaces: true });

export const ConvertToSlug = (text) =>
  slugify(text, { lower: true, strict: true });

export const ConvertToSlugPreserveCase = (text) =>
  slugify(text, { lower: false, strict: true });

export const ConvertToSarcasm = (text) => sarcastify(text);

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

export const SwapCase = (text) => {
  var newText = "";
  for (var i = 0; i < text.length; i++) {
    if (text[i] === text[i].toLowerCase()) {
      newText += text[i].toUpperCase();
    } else if (text[i] === text[i].toUpperCase()) {
      newText += text[i].toLowerCase();
    } else {
      newText += text[i];
    }
  }

  return newText;
};

export const TrimLeadingWhitespace = (text) => text.replace(/^\s+/g, "");

export const TrimTrailingWhitespace = (text) => text.replace(/\s+$/g, "");

export const TrimWhitespace = (text) => text.replace(/(?:^\s+|\s+$)/g, "");
