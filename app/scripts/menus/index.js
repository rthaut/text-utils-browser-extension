import ACTIONS from "scripts/actions";
import CONFIGS from "./menu-configs.json";
import {
  ConvertEditableText,
  CopyPlainTextToClipboard,
} from "scripts/utils/messages";

export const CONFIG_STORAGE_KEY = "menu-configs";

export const GetMenuOnClickHandler = (context, action) => {
  if (typeof ACTIONS[action]?.["func"] !== "function") {
    console.error(`Action "${action}" is invalid`);
    return;
  }

  switch (context) {
    case "selection":
      return (info, tab) =>
        CopyPlainTextToClipboard(
          tab.id,
          ACTIONS[action]["func"].call(null, info.selectionText)
        );

    case "editable":
      return (info, tab) =>
        ConvertEditableText(tab.id, info.frameId, info.targetElementId, action);
  }
};

export const GetMenus = () => {
  const menus = {};

  Object.entries(CONFIGS).forEach(([action, menu]) => {
    menus[action] = {
      action,
      ...menu,
      title: GetDefaultMenuTitle(action),
    };
  });

  console.log("GetMenus()", menus);
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
      group: ACTIONS[id]?.["group"],
      ...menus[id],
      ...(configs[id] ?? {}),
      title: configs[id]?.["title"] ?? menus[id]["title"],
    };
  });

  console.log("GetMenusWithConfigs()", menus);
  return menus;
};

export const GetDefaultMenuConfigs = () => {
  const configs = {};

  Object.entries(GetMenus()).forEach(([id, menu]) => {
    const { enabledContexts, order } = menu;
    configs[id] = {
      enabledContexts,
      order: order > 0 ? order : null,
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

  console.log("GetDefaultMenuConfigs()", configs);
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
  await browser.menus.removeAll();

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

  console.log("RebuildMenus() :: Menus By Context", menusByContext);

  Object.keys(menusByContext).forEach((context) => {
    const group = {
      id: context + "-group",
      title: browser.i18n.getMessage(`MenuGroupContextTitle_${context}`),
      contexts: [context],
    };
    console.log("RebuildMenus() :: Creating Group", group);
    browser.menus.create(group);
  });

  Object.entries(menusByContext).forEach(([context, menus]) => {
    menus.forEach(({ action, title }) => {
      const onclick = GetMenuOnClickHandler(context, action);

      if (typeof onclick === "function") {
        const menu = {
          parentId: context + "-group",
          id: `${action}-${context}`.toLowerCase(),
          title,
          contexts: [context],
          onclick,
        };

        console.log("RebuildMenus() :: Creating Menu", menu);
        browser.menus.create(menu);
      } else {
        console.warn(`Menu ${title} does not have a valid onclick handler`);
      }
    });
  });
};
