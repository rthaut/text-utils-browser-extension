import { defineConfig } from "wxt";

const iconPaths = {
  "16": "images/icon-16.png",
  "19": "images/icon-19.png",
  "24": "images/icon-24.png",
  "32": "images/icon-32.png",
  "38": "images/icon-38.png",
  "48": "images/icon-48.png",
  "64": "images/icon-64.png",
  "96": "images/icon-96.png",
  "128": "images/icon-128.png",
};

export default defineConfig({
  srcDir: "app",
  modules: ["@wxt-dev/module-react", "@wxt-dev/webextension-polyfill"],
  manifest: ({ browser }) => ({
    name: "__MSG_AppName__",
    short_name: "__MSG_AppShortName__",
    description: "__MSG_AppDescription__",
    default_locale: "en",
    author: "Ryan Thaut",
    homepage_url: "https://github.com/rthaut/text-utils-browser-extension/",
    icons: iconPaths,
    action: {
      default_icon: iconPaths,
      default_title: "__MSG_BrowserActionTitle__",
    },
    permissions: ["activeTab", "clipboardWrite", "contextMenus", "storage"],
    ...(browser === "firefox"
      ? {
          browser_specific_settings: {
            gecko: {
              id: "text-utils-browser-extension@ryan.thaut.me",
              strict_min_version: "78.0",
            },
          },
        }
      : {
          minimum_chrome_version: browser === "edge" ? "91" : "90",
        }),
  }),
  vite: () => ({
    resolve: {
      alias: {
        scripts: "/app/scripts",
      },
    },
  }),
});
