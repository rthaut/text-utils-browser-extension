const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

/**
 * Sorts the lines of `text` in natural, case-insensitive, locale-aware order.
 * A trailing line break stays at the end, and the result uses CRLF if the
 * input did.
 * @param {string} text
 * @param {boolean} [descending]
 * @returns {string}
 */
export default function sortLines(text, descending = false) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = text.split(/\r?\n/);

  const hasTrailingBreak = lines.length > 1 && lines[lines.length - 1] === "";
  if (hasTrailingBreak) {
    lines.pop();
  }

  lines.sort((a, b) =>
    descending ? collator.compare(b, a) : collator.compare(a, b),
  );

  return lines.join(eol) + (hasTrailingBreak ? eol : "");
}
