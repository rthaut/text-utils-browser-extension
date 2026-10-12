import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import { ApplyUtilityToEditableElement } from "scripts/helpers/editable-helper";
import { SETTINGS_STORAGE_KEY } from "scripts/helpers/settings";

const ELEMENT_ID = 42;

// the fake browser has no `menus` namespace, so give it one that resolves the
// test element the way Firefox resolves `info.targetElementId`
const setTarget = (element) => {
  fakeBrowser.menus = {
    getTargetElement: vi.fn((id) => (id === ELEMENT_ID ? element : null)),
  };
};

const setSelectionOnly = (value) =>
  fakeBrowser.storage.sync.set({
    [SETTINGS_STORAGE_KEY]: { EditableApplyToSelectedTextOnly: value },
  });

const createField = (tag, value) => {
  const element = document.createElement(tag);
  element.value = value;
  document.body.append(element);
  return element;
};

beforeEach(() => {
  fakeBrowser.reset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  delete fakeBrowser.menus;
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

describe.each(["input", "textarea"])(
  "ApplyUtilityToEditableElement on <%s>",
  (tag) => {
    it("converts the whole value when nothing is selected", async () => {
      const element = createField(tag, "hello world");
      element.setSelectionRange(3, 3);
      setTarget(element);

      await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

      expect(element.value).toBe("HELLO WORLD");
    });

    it("converts only the selection by default", async () => {
      const element = createField(tag, "hello world");
      element.setSelectionRange(6, 11);
      setTarget(element);

      await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

      expect(element.value).toBe("hello WORLD");
    });

    it("converts only the selection when the setting is on", async () => {
      await setSelectionOnly(true);
      const element = createField(tag, "one two three");
      element.setSelectionRange(4, 7);
      setTarget(element);

      await ApplyUtilityToEditableElement(ELEMENT_ID, "Reverse");

      expect(element.value).toBe("one owt three");
    });

    it("converts the whole value when the setting is off", async () => {
      await setSelectionOnly(false);
      const element = createField(tag, "hello world");
      element.setSelectionRange(6, 11);
      setTarget(element);

      await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

      expect(element.value).toBe("HELLO WORLD");
    });

    it.each([true, false])(
      "restores the selection and focus afterward (selection only: %s)",
      async (selectionOnly) => {
        await setSelectionOnly(selectionOnly);
        const element = createField(tag, "hello world");
        element.setSelectionRange(0, 5);
        setTarget(element);

        await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

        expect([element.selectionStart, element.selectionEnd]).toEqual([0, 5]);
        expect(document.activeElement).toBe(element);
      },
    );
  },
);

// happy-dom has no execCommand(), so the tests above cover the fallback path.
// This stands in for the browser: it records what was selected when it ran and
// replaces the selection like a real insertText command would.
const stubExecCommand = (result = true) => {
  const calls = [];
  document.execCommand = vi.fn((command, _showUI, text = "") => {
    const element = document.activeElement;
    if (
      element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement
    ) {
      const { value, selectionStart: start, selectionEnd: end } = element;
      calls.push({ command, text, selected: value.substring(start, end) });
      if (result) {
        element.value = value.substring(0, start) + text + value.substring(end);
      }
    } else {
      const selection = document.getSelection();
      calls.push({ command, text, selected: selection.toString() });
      if (result) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
      }
    }
    return result;
  });
  return calls;
};

describe("ApplyUtilityToEditableElement with execCommand", () => {
  afterEach(() => {
    delete document.execCommand;
  });

  it("inserts the converted selection as typed text", async () => {
    const calls = stubExecCommand();
    const element = createField("textarea", "hello world");
    element.setSelectionRange(6, 11);
    setTarget(element);
    const onInput = vi.fn();
    element.addEventListener("input", onInput);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(calls).toEqual([
      { command: "insertText", text: "WORLD", selected: "world" },
    ]);
    expect(element.value).toBe("hello WORLD");
    // the browser fires `input` itself, so no synthetic event is added
    expect(onInput).not.toHaveBeenCalled();
  });

  it("selects the whole value first when nothing is selected", async () => {
    const calls = stubExecCommand();
    const element = createField("input", "hello world");
    element.setSelectionRange(2, 2);
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(calls).toEqual([
      { command: "insertText", text: "HELLO WORLD", selected: "hello world" },
    ]);
  });

  it("deletes the selection when the result is empty", async () => {
    const calls = stubExecCommand();
    const element = createField("input", "a   b");
    element.setSelectionRange(1, 4);
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "TrimWhitespace");

    expect(calls).toEqual([{ command: "delete", text: "", selected: "   " }]);
  });

  it("falls back to setting the value when execCommand returns false", async () => {
    stubExecCommand(false);
    const element = createField("input", "hello world");
    setTarget(element);
    const onInput = vi.fn();
    element.addEventListener("input", onInput);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(element.value).toBe("HELLO WORLD");
    expect(onInput).toHaveBeenCalledTimes(1);
  });

  it("replaces only the selected text in a contenteditable", async () => {
    const calls = stubExecCommand();
    const host = createRichText("<p>keep <b>this</b> bold</p>");
    const bold = host.querySelector("b");
    selectContents(bold.firstChild);
    setTarget(bold);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(calls).toEqual([
      { command: "insertText", text: "THIS", selected: "this" },
    ]);
    expect(host.innerHTML).toBe("<p>keep <b>THIS</b> bold</p>");
  });
});

describe("ApplyUtilityToEditableElement fallback for frameworks", () => {
  // React overrides `value` on the element to track it, and skips onChange
  // when the tracked value already matches the DOM value
  const trackLikeReact = (element) => {
    const native = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    );
    let tracked = element.value;
    Object.defineProperty(element, "value", {
      configurable: true,
      get: () => native.get.call(element),
      set: (value) => {
        tracked = value;
        native.set.call(element, value);
      },
    });
    const onChange = vi.fn();
    element.addEventListener("input", () => {
      if (element.value !== tracked) {
        tracked = element.value;
        onChange(element.value);
      }
    });
    return onChange;
  };

  it("lets a React-style tracker see the new value", async () => {
    const element = createField("input", "hello world");
    const onChange = trackLikeReact(element);
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(onChange).toHaveBeenCalledExactlyOnceWith("HELLO WORLD");
  });

  it("fires input and change events", async () => {
    const element = createField("textarea", "hello world");
    setTarget(element);
    const events = [];
    element.addEventListener("input", (e) => events.push([e.type, e.bubbles]));
    element.addEventListener("change", (e) => events.push([e.type, e.bubbles]));

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(events).toEqual([
      ["input", true],
      ["change", true],
    ]);
  });
});

describe("ApplyUtilityToEditableElement on other field types", () => {
  it("selects the converted text when its length changes", async () => {
    const element = createField("input", "say Man now");
    element.setSelectionRange(4, 7);
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "Base64Encode");

    expect(element.value).toBe("say TWFu now");
    expect([element.selectionStart, element.selectionEnd]).toEqual([4, 8]);
  });

  it("converts the whole value of an input without a selection API", async () => {
    const element = document.createElement("input");
    element.type = "email";
    element.value = "Someone@Example.com";
    document.body.append(element);
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToLowerCase");

    expect(element.value).toBe("someone@example.com");
  });
});

function createRichText(html) {
  const host = document.createElement("div");
  host.contentEditable = "true";
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

function selectContents(node) {
  const range = document.createRange();
  range.selectNodeContents(node);
  const selection = document.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

describe("ApplyUtilityToEditableElement on contenteditable", () => {
  it("converts the whole text content", async () => {
    const element = createRichText("hello world");
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(element.textContent).toBe("HELLO WORLD");
  });

  it("converts only the selection and keeps the formatting around it", async () => {
    const host = createRichText(
      "<p>keep <b>this</b> bold</p><p>and <i>this</i></p>",
    );
    const bold = host.querySelector("b");
    selectContents(bold.firstChild);
    setTarget(bold);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(host.innerHTML).toBe(
      "<p>keep <b>THIS</b> bold</p><p>and <i>this</i></p>",
    );
  });

  it("converts the whole editor, not just the clicked element, with a line break per paragraph", async () => {
    const host = createRichText("<p>one</p><p>two</p>");
    document.getSelection().removeAllRanges();
    setTarget(host.querySelector("p:last-child"));

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(host.textContent).toBe("ONE\nTWO");
  });

  it("ignores a selection outside the editor", async () => {
    const outside = document.createElement("p");
    outside.textContent = "outside";
    document.body.append(outside);
    const host = createRichText("inside");
    selectContents(outside);
    setTarget(host);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(host.textContent).toBe("INSIDE");
    expect(outside.textContent).toBe("outside");
  });

  it("converts the whole editor when the setting is off", async () => {
    await setSelectionOnly(false);
    const host = createRichText("one <b>two</b>");
    selectContents(host.querySelector("b"));
    setTarget(host);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(host.textContent).toBe("ONE TWO");
  });

  it("converts the whole document in design mode", async () => {
    document.body.innerHTML = "<p>one <b>two</b></p><p>three</p>";
    document.designMode = "on";
    document.getSelection().removeAllRanges();
    setTarget(document.querySelector("b"));

    try {
      await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");
    } finally {
      document.designMode = "off";
    }

    expect(document.body.textContent).toBe("ONE TWO\nTHREE");
  });

  it("fires an input event", async () => {
    const host = createRichText("hello");
    setTarget(host);
    const onInput = vi.fn();
    host.addEventListener("input", onInput);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(onInput).toHaveBeenCalledTimes(1);
  });
});

describe("ApplyUtilityToEditableElement with bad input", () => {
  it("leaves the element alone for an unknown utility", async () => {
    const element = createField("input", "hello world");
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "NotAUtility");

    expect(element.value).toBe("hello world");
    expect(fakeBrowser.menus.getTargetElement).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("NotAUtility"),
    );
  });

  it("resolves without throwing when the target element is gone", async () => {
    setTarget(null);

    await expect(
      ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase"),
    ).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(String(ELEMENT_ID)),
    );
  });
});
