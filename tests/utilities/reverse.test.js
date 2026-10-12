import { afterEach, beforeEach, describe, expect, it } from "vitest";

import Reverse from "../../utilities/Reverse";
import ReverseKeepDirectionalCharacters from "../../utilities/ReverseKeepDirectionalCharacters";

const utilities = [
  ["Reverse", Reverse],
  ["ReverseKeepDirectionalCharacters", ReverseKeepDirectionalCharacters],
];

// Firefox 117-124 has no Intl.Segmenter, so the utilities fall back to
// splitting by code point and combining marks
const withoutSegmenter = () => {
  const { Segmenter } = Intl;
  beforeEach(() => {
    Intl.Segmenter = undefined;
  });
  afterEach(() => {
    Intl.Segmenter = Segmenter;
  });
};

const sharedCases = (reverse) => {
  it("reverses plain text", () => {
    expect(reverse("hello world")).toBe("dlrow olleh");
  });

  it("returns an empty string unchanged", () => {
    expect(reverse("")).toBe("");
  });

  it("keeps precomposed accented letters intact", () => {
    expect(reverse("mañana")).toBe("anañam");
  });

  it("keeps combining marks attached to their base letter", () => {
    // "n" + U+0303 COMBINING TILDE must stay in that order
    expect(reverse("mañana")).toBe("anañam");
    // stacked marks: "e" + U+0301 + U+0323
    expect(reverse("aẹ́b")).toBe("bẹ́a");
  });

  it("keeps astral symbols (surrogate pairs) intact", () => {
    expect(reverse("a\u{1D306}b")).toBe("b\u{1D306}a");
    expect(reverse("💩 x")).toBe("x 💩");
  });
};

describe.each(utilities)("%s", (_name, reverse) => {
  sharedCases(reverse);

  it("keeps emoji ZWJ sequences intact", () => {
    expect(reverse("👨‍👩‍👧 hi")).toBe("ih 👨‍👩‍👧");
  });

  it("keeps flag emoji intact", () => {
    expect(reverse("🇺🇸🇫🇷")).toBe("🇫🇷🇺🇸");
  });

  it("keeps emoji skin-tone modifiers attached", () => {
    expect(reverse("👍🏽!")).toBe("!👍🏽");
  });

  it("keeps CRLF line breaks in order", () => {
    expect(reverse("a\r\nb")).toBe("b\r\na");
  });
});

describe.each(utilities)("%s without Intl.Segmenter", (_name, reverse) => {
  withoutSegmenter();
  sharedCases(reverse);

  it("splits flags apart, showing the fallback is in use", () => {
    // the code-point fallback cannot keep a flag together
    expect(reverse("🇺🇸")).toBe("🇸🇺");
  });
});

describe("Reverse", () => {
  it("reverses brackets along with everything else", () => {
    expect(Reverse("f(x) [y]")).toBe("]y[ )x(f");
  });
});

describe("ReverseKeepDirectionalCharacters", () => {
  it("mirrors brackets so they still open and close correctly", () => {
    expect(ReverseKeepDirectionalCharacters("(a [b] {c} <d>)")).toBe(
      "(<d> {c} [b] a)",
    );
  });

  it("mirrors brackets next to astral symbols", () => {
    expect(ReverseKeepDirectionalCharacters("f(😀)")).toBe("(😀)f");
  });
});
