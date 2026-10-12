import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import { OnMenuClicked } from "scripts/helpers/menus";
import {
  MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD,
  MSG_ACTION_PING,
} from "scripts/helpers/messages";

const TAB = { id: 7 };

beforeEach(() => {
  fakeBrowser.reset();
  // the content script is already loaded, so every message gets a reply
  vi.spyOn(fakeBrowser.tabs, "sendMessage").mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const copiedText = () =>
  fakeBrowser.tabs.sendMessage.mock.calls
    .map(([, message]) => message)
    .filter(({ action }) => action === MSG_ACTION_COPY_PLAINTEXT_TO_CLIPBOARD)
    .map(({ data }) => data.text);

describe("OnMenuClicked for selected text", () => {
  it("copies the result of a synchronous utility", async () => {
    await OnMenuClicked(
      { menuItemId: "converttouppercase-selection", selectionText: "abc" },
      TAB,
    );

    expect(copiedText()).toEqual(["ABC"]);
  });

  it("waits for an async utility and copies its result", async () => {
    await OnMenuClicked(
      { menuItemId: "hashsha256-selection", selectionText: "abc" },
      TAB,
    );

    expect(fakeBrowser.tabs.sendMessage).toHaveBeenCalledWith(
      TAB.id,
      { action: MSG_ACTION_PING },
      { frameId: 0 },
    );
    expect(copiedText()).toEqual([
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    ]);
  });
});
