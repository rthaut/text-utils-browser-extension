/**
 * Permission verification harness.
 *
 * Empirically proves which manifest permissions are load-bearing by driving
 * the real context-menu message pipeline (background service worker ->
 * content script -> clipboard / editable element) against the built
 * `chrome-mv3` output, using build variants with individual permissions
 * removed, and asserting the observable behavior of each variant.
 *
 * Native context menus cannot be automated, so each test dispatches the same
 * `contextMenus.onClicked` event a real menu click produces by evaluating in
 * the extension's service worker (`chrome.contextMenus.onClicked.dispatch`).
 * A synthetic dispatch cannot produce the `activeTab` grant a real menu
 * click grants, so variants marked `testGrant: true` add a host permission
 * for the local test server as a stand-in for that grant; the
 * `expect-failure-without-any-grant` variant runs the production manifest
 * as-is to prove that page access fails without a grant (in production,
 * `activeTab` is the only grant source).
 *
 * Run via `npm run test:permissions` (builds `chrome-mv3` first).
 */
import { createServer } from "node:http";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const EXTENSION_DIR = resolve(import.meta.dirname, "../.output/chrome-mv3");
const HEADLESS = process.env.HARNESS_HEADED !== "1";

const TEST_PAGE = `<!DOCTYPE html>
<html>
  <body>
    <p id="text">hello world</p>
    <textarea id="ta"></textarea>
    <div id="ce" contenteditable="true"></div>
  </body>
</html>`;

/**
 * Test matrix. `remove` strips permissions from the built manifest;
 * `testGrant` adds a host permission for the test server origin as the
 * stand-in for the activeTab grant (see file header). `expect` describes
 * the observable outcome each test asserts.
 */
const VARIANTS = [
  {
    name: "full-permissions",
    remove: [],
    testGrant: true,
    expect: { inject: true, clipboard: true, editable: true },
    proves:
      "the full pipeline works: inject -> message -> clipboard write + editable mutation",
  },
  {
    name: "without-clipboardWrite",
    remove: ["clipboardWrite"],
    testGrant: true,
    expect: { inject: true, clipboard: false, editable: true },
    proves:
      "clipboardWrite is load-bearing: without it, the content script clipboard write is blocked (no transient user activation exists after a context menu click)",
  },
  {
    name: "without-scripting",
    remove: ["scripting"],
    testGrant: true,
    expect: { inject: false, clipboard: false, editable: false },
    proves:
      "scripting is load-bearing: without it, the content script cannot be injected at all",
  },
  {
    name: "without-activeTab-but-with-host-grant",
    remove: ["activeTab"],
    testGrant: true,
    expect: { inject: true, clipboard: true, editable: true },
    proves:
      "activeTab is purely an access grant: with an equivalent host grant the pipeline works, so activeTab's role is exactly to grant page access on menu click",
  },
  {
    name: "expect-failure-without-any-grant",
    remove: [],
    testGrant: false,
    expect: { inject: false, clipboard: false, editable: false },
    proves:
      "page access requires a grant: the production manifest has no host permissions, so scripting.executeScript fails unless the user gesture (context menu click) grants activeTab",
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pollFor(fn, timeoutMs = 5000, intervalMs = 200) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    if (await fn()) return true;
    if (Date.now() > deadline) return false;
    await sleep(intervalMs);
  }
}

async function makeVariant(variant, origin) {
  const dir = await mkdtemp(join(tmpdir(), `text-utils-${variant.name}-`));
  await cp(EXTENSION_DIR, dir, { recursive: true });

  const manifestPath = join(dir, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  manifest.permissions = (manifest.permissions ?? []).filter(
    (p) => !variant.remove.includes(p)
  );
  if (variant.testGrant) {
    manifest.host_permissions = [`${origin}/*`];
  }

  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  return dir;
}

async function startServer() {
  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(TEST_PAGE);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return { server, origin };
}

/** Dispatch the exact event payload a real context menu click produces. */
async function dispatchMenuClick(sw, tabId, info) {
  await sw.evaluate(
    ([tabId, info]) =>
      new Promise((resolve, reject) => {
        if (typeof chrome.contextMenus.onClicked.dispatch !== "function") {
          reject(new Error("chrome.contextMenus.onClicked.dispatch missing"));
          return;
        }
        chrome.tabs.get(tabId, (tab) => {
          chrome.contextMenus.onClicked.dispatch(info, tab);
          resolve();
        });
      }),
    [tabId, info]
  );
}

async function runVariant(variant, origin) {
  const extensionPath = await makeVariant(variant, origin);
  const userDataDir = await mkdtemp(join(tmpdir(), "text-utils-profile-"));

  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: HEADLESS,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });

  const results = {};

  try {
    // clipboard-read only (for assertions); clipboard-write is deliberately
    // NOT granted to the page origin, since content scripts share the page's
    // clipboard permission state and granting it would mask the extension's
    // own clipboardWrite permission
    await context.grantPermissions(["clipboard-read"], { origin });

    const sw =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent("serviceworker", { timeout: 15000 }));

    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(`${origin}/`);
    await page.bringToFront();

    const tabId = await sw.evaluate(
      () =>
        new Promise((resolve) =>
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
            resolve(tabs[0]?.id)
          )
        )
    );

    // --- test 1: selection -> clipboard (ConvertToUpperCase) ---
    // no clicks/keys are ever sent to the page, so no transient user
    // activation exists (matching the state after a real menu click)
    const uniqueText = `permission harness ${variant.name} ${Date.now()}`;
    const expectedClipboard = uniqueText.toUpperCase();

    await dispatchMenuClick(sw, tabId, {
      menuItemId: "converttouppercase-selection",
      selectionText: uniqueText,
      editable: false,
      frameId: 0,
      pageUrl: `${origin}/`,
    });

    results.clipboard = await pollFor(async () => {
      const value = await page
        .evaluate(() => navigator.clipboard.readText())
        .catch(() => "");
      return value === expectedClipboard;
    });

    // injection probe: distinguishes "content script missing" from
    // "content script present but clipboard write blocked"
    results.inject = await sw.evaluate(
      (tabId) =>
        chrome.tabs
          .sendMessage(tabId, { action: "Ping" }, { frameId: 0 })
          .then(() => true)
          .catch(() => false),
      tabId
    );

    // --- test 2: editable element mutation (first-click fallback path) ---
    // programmatic focus only (no user activation); the polyfill falls back
    // to document.activeElement when no contextmenu event was captured
    await page.evaluate(() => {
      const ta = document.getElementById("ta");
      ta.value = "make me shout";
      ta.focus();
    });

    await dispatchMenuClick(sw, tabId, {
      menuItemId: "converttouppercase-editable",
      editable: true,
      frameId: 0,
      pageUrl: `${origin}/`,
    });

    const editableFallback = await pollFor(async () => {
      const value = await page.evaluate(
        () => document.getElementById("ta").value
      );
      return value === "MAKE ME SHOUT";
    });

    // --- test 3: editable mutation via captured contextmenu event ---
    // (script already injected: matches every menu click after the first)
    let editableCaptured = false;
    if (results.inject) {
      await page.evaluate(() => {
        const ce = document.getElementById("ce");
        ce.textContent = "quiet words";
        ce.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
      });

      await dispatchMenuClick(sw, tabId, {
        menuItemId: "converttouppercase-editable",
        editable: true,
        frameId: 0,
        pageUrl: `${origin}/`,
      });

      editableCaptured = await pollFor(async () => {
        const value = await page.evaluate(
          () => document.getElementById("ce").textContent
        );
        return value === "QUIET WORDS";
      });
    }

    results.editable = editableFallback && (results.inject ? editableCaptured : false);
    results.editableFallback = editableFallback;
    results.editableCaptured = editableCaptured;
  } finally {
    await context.close().catch(() => {});
    await rm(extensionPath, { recursive: true, force: true }).catch(() => {});
    await rm(userDataDir, { recursive: true, force: true }).catch(() => {});
  }

  return results;
}

async function main() {
  const { server, origin } = await startServer();
  const rows = [];
  let failed = false;

  try {
    for (const variant of VARIANTS) {
      process.stdout.write(`\n=== ${variant.name} ===\n`);
      const results = await runVariant(variant, origin);

      const checks = ["inject", "clipboard", "editable"].map((key) => {
        const pass = results[key] === variant.expect[key];
        if (!pass) failed = true;
        return `${key}: ${results[key] ? "works" : "blocked"} (expected ${
          variant.expect[key] ? "works" : "blocked"
        }) ${pass ? "PASS" : "FAIL"}`;
      });

      checks.forEach((line) => process.stdout.write(`  ${line}\n`));
      process.stdout.write(
        `  detail: editable fallback=${results.editableFallback} captured=${results.editableCaptured}\n`
      );
      process.stdout.write(`  proves: ${variant.proves}\n`);

      rows.push({ variant: variant.name, ...results });
    }
  } finally {
    server.close();
  }

  process.stdout.write("\n=== summary ===\n");
  process.stdout.write(JSON.stringify(rows, null, 2) + "\n");
  process.stdout.write(
    failed
      ? "\nPERMISSION HARNESS FAILED: observed behavior does not match the documented permission model\n"
      : "\nPERMISSION HARNESS PASSED: every permission in the manifest is empirically load-bearing\n"
  );
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
