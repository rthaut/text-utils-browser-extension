import { describe, expect, it } from "vitest";

import Base64Decode from "../../utilities/Base64Decode";
import Base64DecodeURLSafe from "../../utilities/Base64DecodeURLSafe";
import Base64Encode from "../../utilities/Base64Encode";
import Base64EncodeURLSafe from "../../utilities/Base64EncodeURLSafe";

// [text, standard Base64 (RFC 4648 section 4), URL-safe Base64 without padding (section 5)]
// expected values were produced independently with Node's Buffer
const vectors = [
  ["", "", ""],
  ["M", "TQ==", "TQ"],
  ["Ma", "TWE=", "TWE"],
  ["Man", "TWFu", "TWFu"],
  ["Hello World", "SGVsbG8gV29ybGQ=", "SGVsbG8gV29ybGQ"],
  ["héllo wörld", "aMOpbGxvIHfDtnJsZA==", "aMOpbGxvIHfDtnJsZA"],
  ["日本語", "5pel5pys6Kqe", "5pel5pys6Kqe"],
  ["😀 ok", "8J+YgCBvaw==", "8J-YgCBvaw"],
  // these inputs produce "+" and "/" in the standard alphabet
  ["<<???>>", "PDw/Pz8+Pg==", "PDw_Pz8-Pg"],
  ["ÿÿÿ", "w7/Dv8O/", "w7_Dv8O_"],
];

describe("Base64Encode", () => {
  it.each(vectors)("encodes %j as UTF-8", (text, standard) => {
    expect(Base64Encode(text)).toBe(standard);
  });
});

describe("Base64EncodeURLSafe", () => {
  it.each(vectors)(
    "encodes %j with the URL-safe alphabet and no padding",
    (text, _standard, urlSafe) => {
      expect(Base64EncodeURLSafe(text)).toBe(urlSafe);
    },
  );
});

describe("Base64Decode", () => {
  it.each(vectors)("decodes the encoding of %j", (text, standard) => {
    expect(Base64Decode(standard)).toBe(text);
  });

  it("decodes unpadded input", () => {
    expect(Base64Decode("SGVsbG8gV29ybGQ")).toBe("Hello World");
  });

  // the cases below record current behavior for invalid or non-standard
  // input as a baseline; they are not a statement of desired behavior

  it("accepts the URL-safe alphabet", () => {
    expect(Base64Decode("8J-YgCBvaw")).toBe("😀 ok");
  });

  it("ignores embedded whitespace", () => {
    expect(Base64Decode("SGVs bG8g\nV29y bGQ=")).toBe("Hello World");
  });

  it("throws on characters outside the alphabet", () => {
    expect(() => Base64Decode("!!!")).toThrow();
  });

  it("throws on too much padding", () => {
    expect(() => Base64Decode("SGVsbG8hIQ===")).toThrow();
  });

  it("throws on a truncated single character", () => {
    expect(() => Base64Decode("a")).toThrow();
  });

  it("returns bytes that are not valid UTF-8 as Latin-1 characters", () => {
    // "abc" decodes to bytes 0x69 0xB7; "/w==" decodes to byte 0xFF
    expect(Base64Decode("abc")).toBe("i·");
    expect(Base64Decode("/w==")).toBe("ÿ");
  });
});

describe("Base64DecodeURLSafe", () => {
  it.each(vectors)(
    "decodes the URL-safe encoding of %j",
    (text, _standard, urlSafe) => {
      expect(Base64DecodeURLSafe(urlSafe)).toBe(text);
    },
  );

  // the cases below record current behavior for invalid or non-standard
  // input as a baseline; they are not a statement of desired behavior

  it("accepts the standard alphabet and padding", () => {
    expect(Base64DecodeURLSafe("8J+YgCBvaw==")).toBe("😀 ok");
  });

  it("throws on embedded whitespace", () => {
    expect(() => Base64DecodeURLSafe("SGVs bG8g")).toThrow();
  });

  it("throws on characters outside the alphabet", () => {
    expect(() => Base64DecodeURLSafe("!!!")).toThrow();
  });

  it("throws on a truncated single character", () => {
    expect(() => Base64DecodeURLSafe("a")).toThrow();
  });

  it("throws URIError on bytes that are not valid UTF-8", () => {
    expect(() => Base64DecodeURLSafe("abc")).toThrow(URIError);
    expect(() => Base64DecodeURLSafe("_w")).toThrow(URIError);
  });
});
