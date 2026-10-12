// An apostrophe (straight or curly) with a letter or number on both sides, as
// in contractions and possessives: "it's", "don’t", "Ryan's".
const IN_WORD_APOSTROPHE = /(?<=[\p{L}\p{N}])['’](?=[\p{L}\p{N}])/gu;

/**
 * Removes apostrophes inside words so `text-case` keeps each word together
 * for identifier formats ("it's" becomes "its" instead of "it s").
 * @param {string} text
 * @returns {string}
 */
export const removeInWordApostrophes = (text) =>
  text.replace(IN_WORD_APOSTROPHE, "");

/**
 * `text-case` options that strip the same characters as its default, except
 * apostrophes inside words, so formats that keep spaces leave "it's" intact.
 */
export const keepInWordApostrophes = {
  stripRegexp:
    /(?:[^\p{L}\p{N}'’]|(?<![\p{L}\p{N}])['’]|['’](?![\p{L}\p{N}]))+/gu,
};
