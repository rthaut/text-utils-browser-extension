# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Chrome and Edge builds now use Manifest V3 (Firefox remains Manifest V2)
- Chrome/Edge: the content script is now injected on demand (`activeTab` + `scripting`) when a context menu item is clicked, instead of being loaded on every page; this removes the "read and change all your data on all websites" install warning
- Context menu clicks are now handled by a single `contextMenus.onClicked` listener (required for Manifest V3 service workers)

### Added

- Automated permission-path harness (`npm run test:permissions`) that exercises content-script injection, clipboard access, editable-field updates, and the no-host-grant failure case against builds with individual permissions removed

### Removed

- Firefox: the unused `activeTab` permission is no longer requested

## [1.0.0] - 2021-10-09

Initial Release

[unreleased]: https://github.com/rthaut/text-utils-browser-extension/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rthaut/text-utils-browser-extension/commits/v1.0.0
