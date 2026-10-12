import { describe, expect, it } from "vitest";

import ConvertToCamelCase from "../../utilities/ConvertToCamelCase";
import ConvertToCapitalCase from "../../utilities/ConvertToCapitalCase";
import ConvertToConstantCase from "../../utilities/ConvertToConstantCase";
import ConvertToDotCase from "../../utilities/ConvertToDotCase";
import ConvertToHeaderCase from "../../utilities/ConvertToHeaderCase";
import ConvertToLowerCase from "../../utilities/ConvertToLowerCase";
import ConvertToLowerCaseFirst from "../../utilities/ConvertToLowerCaseFirst";
import ConvertToParamCase from "../../utilities/ConvertToParamCase";
import ConvertToPascalCase from "../../utilities/ConvertToPascalCase";
import ConvertToPathCase from "../../utilities/ConvertToPathCase";
import ConvertToSarcasm from "../../utilities/ConvertToSarcasm";
import ConvertToSentenceCase from "../../utilities/ConvertToSentenceCase";
import ConvertToSnakeCase from "../../utilities/ConvertToSnakeCase";
import ConvertToTitleCase from "../../utilities/ConvertToTitleCase";
import ConvertToTitleCaseAPStyle from "../../utilities/ConvertToTitleCaseAPStyle";
import ConvertToUpperCase from "../../utilities/ConvertToUpperCase";
import ConvertToUpperCaseFirst from "../../utilities/ConvertToUpperCaseFirst";
import SwapCase from "../../utilities/SwapCase";

// each row is [input, expected]; inputs cover space-separated words,
// camelCase, an acronym followed by words, mixed separators, and non-ASCII letters
const cases = {
  ConvertToCamelCase: [
    ConvertToCamelCase,
    [
      ["hello world", "helloWorld"],
      ["Hello World", "helloWorld"],
      ["XMLHttpRequest", "xmlHttpRequest"],
      ["foo_bar-baz.qux", "fooBarBazQux"],
      ["Ünïcödé text", "ünïcödéText"],
    ],
  ],
  ConvertToCapitalCase: [
    ConvertToCapitalCase,
    [
      ["hello world", "Hello World"],
      ["helloWorld", "Hello World"],
      ["XMLHttpRequest", "Xml Http Request"],
      ["foo_bar-baz.qux", "Foo Bar Baz Qux"],
    ],
  ],
  ConvertToConstantCase: [
    ConvertToConstantCase,
    [
      ["hello world", "HELLO_WORLD"],
      ["helloWorld", "HELLO_WORLD"],
      ["XMLHttpRequest", "XML_HTTP_REQUEST"],
      ["foo_bar-baz.qux", "FOO_BAR_BAZ_QUX"],
      ["Ünïcödé text", "ÜNÏCÖDÉ_TEXT"],
    ],
  ],
  ConvertToDotCase: [
    ConvertToDotCase,
    [
      ["hello world", "hello.world"],
      ["helloWorld", "hello.world"],
      ["foo_bar-baz.qux", "foo.bar.baz.qux"],
    ],
  ],
  ConvertToHeaderCase: [
    ConvertToHeaderCase,
    [
      ["hello world", "Hello-World"],
      ["contentType", "Content-Type"],
      ["XMLHttpRequest", "Xml-Http-Request"],
    ],
  ],
  ConvertToLowerCase: [
    ConvertToLowerCase,
    [
      ["Hello World", "hello world"],
      ["XMLHttpRequest", "xmlhttprequest"],
      // separators and surrounding whitespace are kept
      ["  FOO_BAR-Baz ", "  foo_bar-baz "],
      ["ÜNÏCÖDÉ", "ünïcödé"],
    ],
  ],
  ConvertToLowerCaseFirst: [
    ConvertToLowerCaseFirst,
    [
      ["Hello World", "hello World"],
      ["XMLHttpRequest", "xMLHttpRequest"],
      ["hello", "hello"],
    ],
  ],
  ConvertToParamCase: [
    ConvertToParamCase,
    [
      ["hello world", "hello-world"],
      ["helloWorld", "hello-world"],
      ["XMLHttpRequest", "xml-http-request"],
      ["foo_bar-baz.qux", "foo-bar-baz-qux"],
    ],
  ],
  ConvertToPascalCase: [
    ConvertToPascalCase,
    [
      ["hello world", "HelloWorld"],
      ["helloWorld", "HelloWorld"],
      ["XMLHttpRequest", "XmlHttpRequest"],
      ["foo_bar-baz.qux", "FooBarBazQux"],
    ],
  ],
  ConvertToPathCase: [
    ConvertToPathCase,
    [
      ["hello world", "hello/world"],
      ["helloWorld", "hello/world"],
      ["foo_bar-baz.qux", "foo/bar/baz/qux"],
    ],
  ],
  ConvertToSentenceCase: [
    ConvertToSentenceCase,
    [
      ["hello world", "Hello world"],
      ["helloWorld", "Hello world"],
      ["HELLO WORLD", "Hello world"],
      ["foo_bar-baz", "Foo bar baz"],
    ],
  ],
  ConvertToSnakeCase: [
    ConvertToSnakeCase,
    [
      ["hello world", "hello_world"],
      ["helloWorld", "hello_world"],
      ["XMLHttpRequest", "xml_http_request"],
      ["foo-bar.baz", "foo_bar_baz"],
    ],
  ],
  ConvertToTitleCase: [
    ConvertToTitleCase,
    [
      ["hello world", "Hello World"],
      ["helloWorld", "Hello World"],
      ["foo_bar-baz", "Foo Bar Baz"],
    ],
  ],
  ConvertToUpperCase: [
    ConvertToUpperCase,
    [
      ["hello world", "HELLO WORLD"],
      // separators and surrounding whitespace are kept
      ["  foo_bar-baz ", "  FOO_BAR-BAZ "],
      ["ünïcödé", "ÜNÏCÖDÉ"],
    ],
  ],
  ConvertToUpperCaseFirst: [
    ConvertToUpperCaseFirst,
    [
      ["hello world", "Hello world"],
      ["helloWorld", "HelloWorld"],
      ["ünïcödé", "Ünïcödé"],
    ],
  ],
  SwapCase: [
    SwapCase,
    [
      ["Hello World", "hELLO wORLD"],
      ["XMLHttpRequest", "xmlhTTPrEQUEST"],
      ["abc-123_XYZ", "ABC-123_xyz"],
      ["Ünïcödé", "üNÏCÖDÉ"],
    ],
  ],
};

describe.each(Object.entries(cases))("%s", (_name, [utility, rows]) => {
  it.each(rows)("converts %j to %j", (input, expected) => {
    expect(utility(input)).toBe(expected);
  });
});

describe("ConvertToTitleCaseAPStyle", () => {
  it("lowercases short articles, conjunctions, and prepositions", () => {
    expect(
      ConvertToTitleCaseAPStyle("the lord of the rings: return of the king"),
    ).toBe("The Lord of the Rings: Return of the King");
  });

  it("capitalizes prepositions of four or more letters", () => {
    expect(ConvertToTitleCaseAPStyle("a letter from the past")).toBe(
      "A Letter From the Past",
    );
  });

  it("keeps runs of spaces", () => {
    expect(ConvertToTitleCaseAPStyle("a  tale   of two")).toBe(
      "A  Tale   of Two",
    );
  });
});

describe("ConvertToSarcasm", () => {
  it("alternates letter case by position, starting lowercase", () => {
    expect(ConvertToSarcasm("hello world")).toBe("hElLo wOrLd");
    expect(ConvertToSarcasm("HELLO")).toBe("hElLo");
  });

  it("leaves digits and punctuation unchanged", () => {
    expect(ConvertToSarcasm("abc, 123!")).toBe("aBc, 123!");
  });
});
