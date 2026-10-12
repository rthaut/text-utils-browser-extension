import { describe, expect, it } from "vitest";

import Reverse from "../../utilities/Reverse";
import ReverseKeepDirectionalCharacters from "../../utilities/ReverseKeepDirectionalCharacters";

describe.each([
  ["Reverse", Reverse],
  ["ReverseKeepDirectionalCharacters", ReverseKeepDirectionalCharacters],
])("%s", (_name, reverse) => {
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
    expect(reverse("mañana")).toBe("anañam");
    // stacked marks: "e" + U+0301 + U+0323
    expect(reverse("aẹ́b")).toBe("bẹ́a");
  });

  it("keeps astral symbols (surrogate pairs) intact", () => {
    expect(reverse("a\u{1D306}b")).toBe("b\u{1D306}a");
    expect(reverse("💩 x")).toBe("x 💩");
  });

  // Known bug (issue #59): esrever reverses by code point, so ZWJ sequences
  // and regional-indicator flags get scrambled. These document the correct
  // grapheme-aware result and will start passing once that is fixed, at
  // which point `it.fails` should become `it`.
  it.fails("keeps emoji ZWJ sequences intact", () => {
    expect(reverse("👨‍👩‍👧 hi")).toBe("ih 👨‍👩‍👧");
  });

  it.fails("keeps flag emoji intact", () => {
    expect(reverse("🇺🇸🇫🇷")).toBe("🇫🇷🇺🇸");
  });

  it.fails("keeps emoji skin-tone modifiers attached", () => {
    expect(reverse("👍🏽!")).toBe("!👍🏽");
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
