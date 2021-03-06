# Configurable Text Utilities v1.0.0

[![Chrome Web Store][chrome-image-version]][chrome-url] [![Microsoft Edge Add-on][edge-image-version]][edge-url] [![Mozilla Add-on][firefox-image-version]][firefox-url]

> This browser extension provides many fully-configurable utilities for quickly manipulating, transforming, and/or copying selected and/or editable text.

* * *

## Overview

![Text Utilities Promotional Image](/promo/Promo-Image-Marquee_1400x560.png?raw=true)

### Features

* [**Over 30 text utilities included!**](#included-utilities)
* All utilities can easily be renamed, enabled/disabled, and reordered through a built-in drag-and-drop editor.
* Utilities are automatically grouped for selected text vs. editable text when working with selected text in editable fields.

* * *

## Installation

| Web Browser | Information & Downloads |
| ----------- | ----------------------- |
| Google Chrome | [![Chrome Web Store][chrome-image-version]][chrome-url] [![Chrome Web Store][chrome-image-users]][chrome-url] |
| Microsoft Edge | [![Microsoft Edge Add-on][edge-image-version]][edge-url] [![Microsoft Edge Add-on][edge-image-users]][edge-url] |
| Mozilla Firefox | [![Mozilla Add-on][firefox-image-version]][firefox-url] [![Mozilla Add-on][firefox-image-users]][firefox-url] |

* * *

## Included Utilities

* Case Conversion
  * Swap Case
  * Convert to Camel Case
  * Convert to Capital Case
  * Convert to Constant
  * Convert to Dot Case
  * Convert to Header Case
  * Convert to Lower Case
  * Convert to Param Case
  * Convert to Pascal Case
  * Convert to Path Case
  * Convert to Sarcasm
  * Convert to Sentence Case
  * Convert to Snake Case
  * Convert to Title Case (AP Style)
  * Convert to Title Case
  * Convert to Upper Case
  * Convert First Character to Lower Case
  * Convert First Character to Upper Case
* URL
  * Encode URI
  * Decode URI
  * Convert to Slug
  * Convert to Slug (Preserve Case)
* Whitespace
  * Trim Whitespace
  * Trim Leading Whitespace
  * Trim Trailing Whitespace
* Miscellaneous
  * Reverse Text
  * Reverse Text (Keep Directional Characters)
  * Sort Lines (Ascending)
  * Sort Lines (Descending)
* Base64
  * Base64 Decode
  * Base64 Decode (URL Safe)
  * Base64 Encode
  * Base64 Encode (URL Safe)

* * *

## Contributing

Contributions are always welcome! Even if you aren't comfortable coding, you can always submit [new ideas](https://github.com/rthaut/text-utils-browser-extension/issues/new?labels=enhancement) and [bug reports](https://github.com/rthaut/text-utils-browser-extension/issues/new?labels=bug).

### Localization/Translation

This extension is setup to be fully localized/translated into multiple languages, but for now English is the only language with full translations. If you are able to help localize/translate, please [check out this guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Internationalization). All of the text for the extension is stored [here in the `/app/_locales` directory](https://github.com/rthaut/text-utils-browser-extension/tree/master/app/_locales).

### Building the Extension

**This extension uses the [WebExtension Toolbox](https://github.com/webextension-toolbox/webextension-toolbox#usage) for development and build processes.**

To build the extension from source code, you will need to use [Node Package Manager (npm)](https://www.npmjs.com/), which handles all of the dependencies needed for this project and is used to execute the various scripts for development/building/packaging/etc.

```sh
npm install
```

Then you can run the development process (where the extension is auto-reloaded when changes are made) for your browser of choice:

```sh
npm run dev <chrome/edge/firefox>
```

Or you can generate a production build for your browser of choice:

```sh
npm run build <chrome/edge/firefox>
```

### Development Process

To make development easier, you can start up a temporary development profile on [Mozilla Firefox](https://getfirefox.com) or [Google Chrome](google.com/chrome) with the extension already loaded. The browser will also automatically detect changes and reload the extension for you (read more about this on the [`web-ext` documentation pages](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Getting_started_with_web-ext)). Use the following commands **in parallel** to re-build the extension and re-load it in Firefox/Chrome automatically as you make changes:

Firefox:

```sh
npm run dev firefox
npm run start:firefox
```

Chrome:

```sh
npm run dev chrome
npm run start:chrome
```

**Note that you will need 2 terminal instances**, one for each of the above commands, as they both remain running until you cancel them (use <kbd>CTRL</kbd> + <kbd>c</kbd> to cancel each process in your terminal(s)).

[chrome-url]: https://chrome.google.com/webstore/detail/text-utils/{{TODO:CHROME_ID}}
[chrome-image-version]: https://img.shields.io/chrome-web-store/v/{{TODO:CHROME_ID}}?logo=googlechrome&style=for-the-badge
[chrome-image-users]: https://img.shields.io/chrome-web-store/d/{{TODO:CHROME_ID}}?logo=googlechrome&style=for-the-badge

[edge-url]: https://microsoftedge.microsoft.com/addons/detail/text-utils/plpggmjkjpnoocflkpeoabgbgemjcpon
[edge-image-version]: https://img.shields.io/badge/dynamic/json?logo=microsoftedge&style=for-the-badge&label=edge%20add-on&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fplpggmjkjpnoocflkpeoabgbgemjcpon
[edge-image-users]: https://img.shields.io/badge/dynamic/json?logo=microsoftedge&style=for-the-badge&label=users&query=%24.activeInstallCount&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fplpggmjkjpnoocflkpeoabgbgemjcpon

[firefox-url]: https://addons.mozilla.org/en-US/firefox/addon/configurable-text-utilities/
[firefox-image-version]: https://img.shields.io/amo/v/configurable-text-utilities?color=blue&logo=firefox&style=for-the-badge
[firefox-image-users]: https://img.shields.io/amo/users/configurable-text-utilities?color=blue&logo=firefox&style=for-the-badge
