# Chrome Web Store

Listing answers and review history for the Chrome Web Store.

- Item ID: `deidhikdknjmfomeekiheklkidbinhlb` (live since 1.1.0, 2026-07-28)
- Edge item ID: `plpggmjkjpnoocflkpeoabgbgemjcpon`
- The old 2021 draft item `deidhikdknjmfomeekihekjkidbinhlb` was never published.

## Review history

- **2021-10-12, rejected: "Use of Permissions" (Purple Potassium).** The reviewer said `activeTab` and `clipboardWrite` were requested but not used.
  - `activeTab` really was unused then, because the content script ran on `<all_urls>`. Since 1.1.0 the script is injected on demand with `scripting`, so `activeTab` is what grants access to the page.
  - `clipboardWrite` is needed. The copy happens after the context menu closes, without user activation, so `navigator.clipboard.writeText()` fails without it. `e2e/permission-harness.mjs` checks both permissions in CI.
- **2026-07-26, rejected: "Keyword Spam" (Yellow Argon).** The description listed every utility by name ("Convert to Camel Case", "Convert to Capital Case", …).
  - Describe the utilities by group instead (capitalization formats, URL encoding, whitespace, Base64, …). The resubmission did that and went live on 2026-07-28.
  - Check screenshots and promo images for the same thing: no long lists of option names.

## Listing

- Title: `Configurable Text Utilities`
- Summary: the manifest description.
- Category: Developer Tools
- Homepage: https://github.com/rthaut/text-utils-browser-extension/
- Support: https://github.com/rthaut/text-utils-browser-extension/issues
- Screenshots: 1280×800 or 640×400, real UI only. Use the browser's default theme in each store's screenshots.

## Privacy practices

**Single purpose**

```text
Provides user-invoked, configurable context-menu commands that transform selected text or editable text and either copy the result or apply it in place.
```

**Permission justifications**

| Permission       | Justification                                                                                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `activeTab`      | Applies the user-chosen text transformation to the page only when the user clicks one of the extension's context menu items.                                                                            |
| `clipboardWrite` | Copies the transformed text to the clipboard when the user clicks a 'copy' context menu item; the write happens after the menu closes, outside a user-activation window, so the permission is required. |
| `scripting`      | Injects the extension's text-utility script into the invoked tab on demand instead of running on all sites.                                                                                             |
| `contextMenus`   | Creates the Text Utilities entries in the browser's context menu, which are the extension's user-facing invocation surface.                                                                             |
| `storage`        | Stores and syncs the user's menu configuration and settings, including renamed, reordered, enabled, and disabled utilities.                                                                             |

**Remote code:** No, I am not using remote code.

**Data usage:** select only "Website content", with this explanation:

```text
Reads only text explicitly selected by the user or text in the editable field where the user invokes a Text Utilities command. Processing occurs locally in the browser. Selected and edited text is not retained or transmitted. Menu configuration and extension settings are stored through the browser's storage sync service; the developer does not receive or access them.
```

Check all three Limited Use certifications.

Update these answers whenever a permission is added or removed. The hash utilities (#61) use `crypto.subtle`, which needs no permission.
