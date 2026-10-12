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

describe("ApplyUtilityToEditableElement with an async utility", () => {
  it("writes the resolved value, not a promise", async () => {
    const element = createField("input", "say abc now");
    element.setSelectionRange(4, 7);
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "HashSHA1");

    expect(element.value).toBe(
      "say a9993e364706816aba3e25717850c26c9cd0d89d now",
    );
  });
});

describe("ApplyUtilityToEditableElement on contenteditable", () => {
  it("converts the whole text content", async () => {
    const element = document.createElement("div");
    element.contentEditable = "true";
    element.textContent = "hello world";
    document.body.append(element);
    setTarget(element);

    await ApplyUtilityToEditableElement(ELEMENT_ID, "ConvertToUpperCase");

    expect(element.textContent).toBe("HELLO WORLD");
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
