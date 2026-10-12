/**
 * Splits text into user-perceived characters (grapheme clusters).
 * @param {string} text
 * @returns {string[]}
 */
const splitGraphemes = (text) => {
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: "grapheme",
    });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }

  // Firefox 117-124 has no Intl.Segmenter. Split by code point and keep
  // combining marks with the character before them; emoji sequences such as
  // flags and ZWJ families are not kept together here.
  return text.match(/\P{M}\p{M}*|\p{M}+/gu) ?? [];
};

export default (text) => splitGraphemes(text).reverse().join("");

export const contexts = ["editable", "selection"];
export const group = "reverse";
export const version = "1.0.0";
