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

  Object.entries(CONFIGS).forEach(([action, menu]) => {
    const id = action;

    menus[id] = {
      id,
      ...menu,
      title: GetDefaultMenuTitle(id),
    };
  });

  return menus;
};

export const GetMenusWithConfigs = async () => {
  const menus = GetMenus();
  const configs = await GetMenuConfigsFromStorage();

  Object.keys(menus).forEach((id) => {
    if (!configs[id]) {
      console.error("Missing Config for Menu", id);
    }

    menus[id] = {
      ...menus[id],
      ...(configs[id] ?? {}),
      title: configs[id]?.["title"] ?? menus[id]["title"],
    };
  });

  return menus;
};

export const GetDefaultMenuConfigs = () => {
  const configs = {};

  Object.entries(GetMenus()).forEach(([id, menu]) => {
    const { enabledContexts, order } = menu;
    configs[id] = {
      enabledContexts,
      order,
    };
  });

  // fill in the order for menus without a default order (placing them at the end)
  let order = Array.from(Object.values(configs))
    .map((menu) => menu["order"])
    .filter(Boolean)
    .sort()
    .pop();

  Object.entries(configs).forEach(([id, menu]) => {
    if (menu["order"] === null) {
      configs[id]["order"] = ++order;
    }
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

export const GetDefaultMenuTitle = (id) =>
  browser.i18n.getMessage(`Menu_${id}_Title`);

export const GetMenuTitleForContext = (context, title) =>
  browser.i18n.getMessage(
    `ContextTitle_${context}_WithMenuTitlePlaceholder`,
    title
  );

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
          contexts: [context],
          title: GetMenuTitleForContext(context, menu.title),
        });
      });
    }
  );

  Object.entries(menusByContext).forEach(([context, menus], groupIndex) => {
    if (groupIndex > 0) {
      browser.contextMenus.create({
        id: context + "-separator-",
        type: "separator",
        contexts: ["all"],
      });
    }

    menus.forEach(({ id: action, ...menu }) =>
      browser.contextMenus.create({
        id: `${action}-${context}`.toLowerCase(),
        ...menu,
        onclick: GetMenuOnClickHandler(context, action),
      })
    );
  });
};
