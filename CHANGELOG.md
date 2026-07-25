# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-07-25

### Changed

- Chrome and Edge builds now use Manifest V3 (Firefox remains Manifest V2, minimum version raised to 117.0)
- Chrome, Edge, and Firefox: the content script is now injected on demand (`activeTab` + `scripting`) when a context menu item is clicked, instead of being loaded on every page; this removes the "read and change all your data on all websites" install warning
- Context menu clicks are now handled by a single `contextMenus.onClicked` listener (required for Manifest V3 service workers)
- Firefox now uses the same `activeTab` + `scripting.executeScript` injection path as Chrome and Edge, replacing its previous separate implementation

### Added

- Automated permission-path harness (`npm run test:permissions`) that exercises content-script injection, clipboard access, editable-field updates, and the no-host-grant failure case against builds with individual permissions removed, for both Chrome and Firefox manifests

### Removed

- Firefox: static `content_scripts` declarations and broad host permissions are no longer requested

## [1.0.0] - 2021-10-09

Initial Release

[unreleased]: https://github.com/rthaut/text-utils-browser-extension/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/rthaut/text-utils-browser-extension/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rthaut/text-utils-browser-extension/commits/v1.0.0
