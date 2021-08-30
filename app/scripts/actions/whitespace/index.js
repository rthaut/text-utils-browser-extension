export const TrimLeadingWhitespace = (text) => text.replace(/^\s+/g, "");

export const TrimTrailingWhitespace = (text) => text.replace(/\s+$/g, "");

export const TrimWhitespace = (text) => text.replace(/(?:^\s+|\s+$)/g, "");
