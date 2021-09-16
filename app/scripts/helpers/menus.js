import DEFAULT_MENU_CONFIGS from "../../../utilities/default-menu-configs.json";

import utilities from "scripts/helpers/utilities";
import {
  ConvertEditableText,
  CopyPlainTextToClipboard,
} from "scripts/helpers/messages";

export const CONFIG_STORAGE_KEY = "menu-configs";

export const GetMenuOnClickHandler = (context, utility) => {
  if (typeof utilities[utility]?.["fn"] !== "function") {
    console.error(`Utility "${utility}" is invalid`);
    return;
  }

  switch (context) {
    case "selection":
      return (info, tab) =>
        CopyPlainTextToClipboard(
          tab.id,
          utilities[utility]["fn"].call(null, info.selectionText)
        );

    case "editable":
      return (info, tab) =>
        ConvertEditableText(
          tab.id,
          info.frameId,
          info.targetElementId,
          utility
        );
  }
};

export const GetMenusForUtilities = () => {
  const menus = {};

  Object.entries(utilities).forEach(([id, { contexts }]) => {
    menus[id] = {
      id,
      possibleContexts: contexts,
      title: GetDefaultMenuTitle(id),
    };
  });

  // console.log("GetMenusForUtilities()", menus);
  return menus;
};

export const GetMenusWithConfigs = async () => {
  const menus = GetMenusForUtilities();
  const configs = await GetMenuConfigsFromStorage();
  const defaults = GetDefaultMenuConfigs();

  Object.keys(menus).forEach((id) => {
    if (!configs[id]) {
      console.warn("Missing Config for Menu", id);
    }

    menus[id] = {
      id,
      order: configs[id]?.["order"] ?? defaults[id]["order"],
      enabledContexts:
        configs[id]?.["enabledContexts"] ?? defaults[id]["enabledContexts"],
      possibleContexts: menus[id]["possibleContexts"],
      title: configs[id]?.["title"] ?? menus[id]["title"],
    };
  });

  // console.log("GetMenusWithConfigs()", menus);
  return menus;
};

export const GetDefaultMenuConfigs = () => {
  const configs = {};

  Object.keys(GetMenusForUtilities()).forEach((id) => {
    configs[id] = DEFAULT_MENU_CONFIGS[id] ?? {
      order: null,
      enabledContexts: [],
    };
  });

  // fill in the order for menus without a default order (placing them at the end)
  let order = Array.from(Object.values(configs))
    .map((menu) => menu["order"])
    .filter((order) => order > 0)
    .sort((a, b) => a - b)
    .pop();

  Object.entries(configs).forEach(([id, menu]) => {
    if (menu["order"] === null) {
      configs[id]["order"] = ++order;
    }
  });

  // console.log("GetDefaultMenuConfigs()", configs);
  return configs;
};

export const GetMenuConfigsFromStorage = async () => {
  return (
    await browser.storage.sync.get({
      [CONFIG_STORAGE_KEY]: GetDefaultMenuConfigs(),
    })
  )[CONFIG_STORAGE_KEY];
};

export const GetDefaultMenuTitle = (id) =>
  browser.i18n.getMessage(`Menu_${id}_Title`);

export const GetMenuTitleForContext = (context, title) =>
  browser.i18n.getMessage(`MenuTitleForContext_${context}`, title);

export const RebuildMenus = async () => {
  await browser.contextMenus.removeAll();

  let menus = Object.values(await GetMenusWithConfigs());
  menus = menus.filter((menu) => menu.enabledContexts.length);
  menus.sort((a, b) => a["order"] - b["order"]);

  const menusByContext = {};

  Object.values(menus).forEach(
    // eslint-disable-next-line no-unused-vars
    ({ enabledContexts: contexts, order, possibleContexts, ...menu }) => {
      contexts.forEach((context) => {
        if (!menusByContext[context]) {
          menusByContext[context] = [];
        }

        menusByContext[context].push({
          ...menu,
          title: GetMenuTitleForContext(context, menu.title),
        });
      });
    }
  );

  // console.log("RebuildMenus() :: Menus By Context", menusByContext);

  Object.keys(menusByContext).forEach((context) => {
    const group = {
      id: context + "-group",
      title: browser.i18n.getMessage(`MenuGroupContextTitle_${context}`),
      contexts: [context],
    };
    // console.log("RebuildMenus() :: Creating Group", group);
    browser.contextMenus.create(group);
  });

  Object.entries(menusByContext).forEach(([context, menus]) => {
    menus.forEach(({ id, title }) => {
      const onclick = GetMenuOnClickHandler(context, id);

      if (typeof onclick === "function") {
        const menu = {
          parentId: context + "-group",
          id: `${id}-${context}`.toLowerCase(),
          title,
          contexts: [context],
          onclick,
        };

        // console.log("RebuildMenus() :: Creating Menu", menu);
        browser.contextMenus.create(menu);
      } else {
        console.warn(`Menu ${title} does not have a valid onclick handler`);
      }
    });
  });
};

export const SoftResetStoredMenuConfigs = async () => {
  const { [CONFIG_STORAGE_KEY]: storedMenuConfigs = {} } =
    await browser.storage.sync.get(CONFIG_STORAGE_KEY);

  const defaultMenuConfigs = GetDefaultMenuConfigs();

  Object.keys(defaultMenuConfigs).forEach((config) => {
    if (
      storedMenuConfigs?.[config] === undefined ||
      storedMenuConfigs?.[config] === null
    ) {
      console.info(
        `Setting menu config "${config}" to default configuration`,
        defaultMenuConfigs[config]
      );

      storedMenuConfigs[config] = defaultMenuConfigs[config];
    }
  });

  Object.keys(storedMenuConfigs).forEach((config) => {
    if (
      defaultMenuConfigs[config] === undefined ||
      defaultMenuConfigs[config] === null
    ) {
      console.info(`Removing unknown/invalid menu config "${config}"`);

      delete storedMenuConfigs[config];
    }
  });

  await browser.storage.sync.set({
    [CONFIG_STORAGE_KEY]: storedMenuConfigs,
  });
};
