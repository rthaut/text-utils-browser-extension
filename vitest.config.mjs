import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { WxtVitest } from "wxt/testing/vitest-plugin";

export default defineConfig({
  plugins: [WxtVitest()],
  resolve: {
    alias: {
      // mirrors the `scripts` alias in wxt.config.ts, which WxtVitest() does not apply
      scripts: fileURLToPath(new URL("./app/scripts", import.meta.url)),
    },
  },
  test: {
    environment: "happy-dom",
  },
});
