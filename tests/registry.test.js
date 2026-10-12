import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";
import { describe, expect, it } from "vitest";

import utilities from "scripts/helpers/utilities";
import { MENU_CONTEXTS } from "scripts/helpers/menus";

import messages from "../public/_locales/en/messages.json";

// listed from disk rather than with import.meta.glob() so this does not share
// the registry's own discovery mechanism
const utilitiesDir = resolve(process.cwd(), "utilities");

const utilityFiles = readdirSync(utilitiesDir)
  .filter((file) => file.endsWith(".js"))
  .map((file) => file.replace(/\.js$/, ""));

describe("utility registry", () => {
  it("registers exactly the files in utilities/", () => {
    expect(Object.keys(utilities).sort()).toEqual(utilityFiles.sort());
  });

  describe.each(utilityFiles)("%s", (id) => {
    const utility = utilities[id];

    it("has a callable function that returns a string", () => {
      expect(typeof utility.fn("TWFu")).toBe("string");
    });

    it("lists only menu contexts the extension can build", () => {
      expect(utility.contexts.length).toBeGreaterThan(0);
      for (const context of utility.contexts) {
        expect(MENU_CONTEXTS).toContain(context);
      }
    });

    it("has a kebab-case group name", () => {
      expect(utility.group).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });

    it("has an English menu title", () => {
      expect(messages[`Menu_${id}_Title`]?.message).toMatch(/\S/);
    });
  });
});
