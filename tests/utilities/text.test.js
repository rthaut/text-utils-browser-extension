import { describe, expect, it } from "vitest";

import ConvertToSlug from "../../utilities/ConvertToSlug";
import ConvertToSlugPreserveCase from "../../utilities/ConvertToSlugPreserveCase";
import DecodeURI from "../../utilities/DecodeURI";
import EncodeURI from "../../utilities/EncodeURI";
import SortLinesAscending from "../../utilities/SortLinesAscending";
import SortLinesDescending from "../../utilities/SortLinesDescending";
import TrimLeadingWhitespace from "../../utilities/TrimLeadingWhitespace";
import TrimTrailingWhitespace from "../../utilities/TrimTrailingWhitespace";
import TrimWhitespace from "../../utilities/TrimWhitespace";

describe("ConvertToSlug", () => {
  it("lowercases, strips punctuation, and transliterates accents", () => {
    expect(ConvertToSlug("Hello, World! Ünïcödé & more")).toBe(
      "hello-world-unicode-and-more",
    );
  });

  it("collapses whitespace and trims the ends", () => {
    expect(ConvertToSlug("  Many   Spaces  ")).toBe("many-spaces");
  });
});

describe("ConvertToSlugPreserveCase", () => {
  it("strips punctuation and transliterates accents without lowercasing", () => {
    expect(ConvertToSlugPreserveCase("Hello, World! Ünïcödé & more")).toBe(
      "Hello-World-Unicode-and-more",
    );
  });
});

describe("EncodeURI", () => {
  it("percent-encodes spaces and non-ASCII as UTF-8, keeping URL structure", () => {
    expect(EncodeURI("https://example.com/a b?q=é&x=1#frag")).toBe(
      "https://example.com/a%20b?q=%C3%A9&x=1#frag",
    );
  });

  it("encodes astral symbols as four UTF-8 bytes", () => {
    expect(EncodeURI("😀")).toBe("%F0%9F%98%80");
  });
});

describe("DecodeURI", () => {
  it("decodes percent-encoded UTF-8", () => {
    expect(DecodeURI("https://example.com/a%20b?q=%C3%A9&x=1#frag")).toBe(
      "https://example.com/a b?q=é&x=1#frag",
    );
    expect(DecodeURI("%F0%9F%98%80")).toBe("😀");
  });

  it("throws on a malformed escape sequence", () => {
    expect(() => DecodeURI("%E0%A4%A")).toThrow(URIError);
  });
});

describe("SortLinesAscending", () => {
  it("sorts lines alphabetically", () => {
    expect(SortLinesAscending("banana\napple\ncherry")).toBe(
      "apple\nbanana\ncherry",
    );
  });

  it("keeps CRLF line endings", () => {
    expect(SortLinesAscending("banana\r\napple\r\ncherry")).toBe(
      "apple\r\nbanana\r\ncherry",
    );
  });

  it("keeps a trailing line break at the end", () => {
    expect(SortLinesAscending("b\na\n")).toBe("a\nb\n");
    expect(SortLinesAscending("b\r\na\r\n")).toBe("a\r\nb\r\n");
  });

  it("ignores case", () => {
    expect(SortLinesAscending("b\nC\na")).toBe("a\nb\nC");
  });

  it("sorts accented letters with their base letter", () => {
    expect(SortLinesAscending("zebra\néclair\napple")).toBe(
      "apple\néclair\nzebra",
    );
  });

  it("sorts numbers by value", () => {
    expect(SortLinesAscending("item10\nitem9\nitem1")).toBe(
      "item1\nitem9\nitem10",
    );
  });

  it("keeps duplicate lines", () => {
    expect(SortLinesAscending("b\na\nb")).toBe("a\nb\nb");
  });

  it("sorts blank lines between other lines first", () => {
    expect(SortLinesAscending("b\n\na")).toBe("\na\nb");
  });

  it("leaves a single line or empty text unchanged", () => {
    expect(SortLinesAscending("only")).toBe("only");
    expect(SortLinesAscending("")).toBe("");
  });
});

describe("SortLinesDescending", () => {
  it("sorts lines in reverse alphabetical order", () => {
    expect(SortLinesDescending("banana\napple\ncherry")).toBe(
      "cherry\nbanana\napple",
    );
  });

  it("keeps CRLF line endings", () => {
    expect(SortLinesDescending("banana\r\napple\r\ncherry")).toBe(
      "cherry\r\nbanana\r\napple",
    );
  });

  it("keeps a trailing line break at the end", () => {
    expect(SortLinesDescending("a\nb\n")).toBe("b\na\n");
  });

  it("ignores case", () => {
    expect(SortLinesDescending("b\nC\na")).toBe("C\nb\na");
  });

  it("sorts accented letters with their base letter", () => {
    expect(SortLinesDescending("apple\néclair\nzebra")).toBe(
      "zebra\néclair\napple",
    );
  });

  it("sorts numbers by value", () => {
    expect(SortLinesDescending("item1\nitem10\nitem9")).toBe(
      "item10\nitem9\nitem1",
    );
  });
});

describe("whitespace trimming", () => {
  const input = " \t hello   world \n ";

  it("TrimWhitespace removes whitespace from both ends only", () => {
    expect(TrimWhitespace(input)).toBe("hello   world");
  });

  it("TrimLeadingWhitespace removes whitespace from the start only", () => {
    expect(TrimLeadingWhitespace(input)).toBe("hello   world \n ");
  });

  it("TrimTrailingWhitespace removes whitespace from the end only", () => {
    expect(TrimTrailingWhitespace(input)).toBe(" \t hello   world");
  });

  it("treats the text as one block, keeping indentation of inner lines", () => {
    expect(TrimWhitespace("  a\n  b  ")).toBe("a\n  b");
    expect(TrimLeadingWhitespace("  a\n  b")).toBe("a\n  b");
    expect(TrimTrailingWhitespace("a  \nb  ")).toBe("a  \nb");
  });

  it("turns whitespace-only text into an empty string", () => {
    expect(TrimWhitespace(" \n\t ")).toBe("");
    expect(TrimLeadingWhitespace(" \n\t ")).toBe("");
    expect(TrimTrailingWhitespace(" \n\t ")).toBe("");
  });
});
