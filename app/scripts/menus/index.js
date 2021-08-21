import apStyleTitleCase from "ap-style-title-case";
import ACTIONS from "scripts/actions";
import CONFIGS from "./menu-configs.json";
import {
  ConvertEditableText,
  CopyPlainTextToClipboard,
} from "scripts/utils/messages";

export const CONFIG_STORAGE_KEY = "menu-configs";

export const GetMenuOnClickHandler = (context, action) => {
  if (typeof ACTIONS[action] !== "function") {
    return;
  }

  switch (context) {
    case "selection":
      return (info, tab) =>
        CopyPlainTextToClipboard(
          tab.id,
          ACTIONS[action].call(null, info.selectionText)
        );

    case "editable":
      return (info, tab) =>
        ConvertEditableText(tab.id, info.frameId, info.targetElementId, action);
  }
};

export const GetMenus = () => {
  const menus = {};

  Object.entries(CONFIGS).forEach(([action, { contexts, ...menuConfig }]) => {
    contexts.forEach((context) => {
      const group = apStyleTitleCase(context);
      const id = `${group}_${action}`;

      if (menus[group] === undefined) {
        menus[group] = {};
      }

      menus[group][id] = {
        id,
        ...menuConfig,
        contexts: [context],
        title: GetDefaultMenuTitle(id),
        onclick: GetMenuOnClickHandler(context, action),
      };
    });
  });

  return menus;
};

export const GetMenusWithConfigs = async () => {
  const menus = GetMenus();
  const configs = await GetMenuConfigsFromStorage();

  Object.keys(menus).forEach((group) => {
    Object.keys(menus[group]).forEach((id) => {
      if (!configs[group]?.[id]) {
        console.error(`Missing Menu Config (group: ${group}, ID: ${id}`);
      }

      menus[group][id] = {
        ...menus[group][id],
        ...(configs[group]?.[id] ?? {}),
        title: configs[group]?.[id]?.["title"] ?? menus[group][id]["title"],
      };
    });
  });

  return menus;
};

export const GetDefaultMenuConfigs = () => {
  const configs = {};

  Object.entries(GetMenus()).forEach(([group, menus]) => {
    if (configs[group] === undefined) {
      configs[group] = {};
    }

    Object.entries(menus).forEach(([id, menu]) => {
      const { enabled = true, order = null } = menu;
      configs[group][id] = {
        enabled,
        order,
      };
    });

    // fill in the order for menus without a default order (placing them at the end)
    let order = Array.from(Object.values(configs[group]))
      .map((menu) => menu["order"])
      .filter(Boolean)
      .sort()
      .pop();

    Object.entries(configs[group]).forEach(([id, menu]) => {
      if (menu["order"] === null) {
        configs[group][id]["order"] = ++order;
      }
    });
  });

  return configs;
};

export const GetMenuConfigsFromStorage = async () => {
  return (
    await browser.storage.sync.get({
      [CONFIG_STORAGE_KEY]: GetDefaultMenuConfigs(),
    })
  )[CONFIG_STORAGE_KEY];
};

export const GetMenusAsConfigured = async () =>
  Object.fromEntries(
    Object.entries(await GetMenusWithConfigs()).map(([group, menus]) => [
      group,
      Array.from(Object.values(menus)).sort((a, b) =>
        a["order"] > b["order"] ? 1 : a["order"] < b["order"] ? -1 : 0
      ),
    ])
  );

export const GetDefaultMenuTitle = (id) =>
  browser.i18n.getMessage(`Menu_${id}_Title`);

export const RebuildMenus = async () => {
  await browser.contextMenus.removeAll();

  Object.entries(await GetMenusAsConfigured()).forEach(
    ([group, menus], groupIndex) => {
      if (groupIndex > 0) {
        browser.contextMenus.create({
          id: group + "-separator",
          type: "separator",
          contexts: ["all"],
        });
      }

      // eslint-disable-next-line no-unused-vars
      menus.forEach(({ enabled, order, ...menu }) => {
        if (enabled) {
          browser.contextMenus.create(menu);
        }
      });

      groupIndex++;
    }
  );
};
