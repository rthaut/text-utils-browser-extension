# Manual Browser Checks

Run these checks before publishing a browser build. The automated permission
harness cannot open a native browser context menu, so it cannot create or
directly verify Chrome's `activeTab` grant.

## Chrome and Edge (Manifest V3)

1. Load the unpacked production build with no host permissions granted.
2. On a normal web page, use a Text Utilities context-menu action on selected
   text and confirm the transformed value reaches the clipboard.
3. On the first invocation for that page, use an action in a text input,
   textarea, and contenteditable element. Confirm each value is updated.
4. Repeat an editable-field action to cover the already-injected content-script
   path.
5. Confirm the generated manifest has no `host_permissions` or static
   `content_scripts` entry.
6. Confirm an action inside a cross-origin iframe fails without changing the
   frame. This is the expected cost of avoiding permanent all-sites access.

## Firefox (Manifest V2)

Repeat the selection and editable-field checks above. Also confirm an action
inside a cross-origin iframe succeeds; Firefox's manifest-declared, all-frame
content script intentionally retains this capability.

## Expected Compatibility Boundary

All browsers share utility execution, menu configuration, storage, messaging,
and editable-element logic. Their only intended functional difference is
cross-origin iframe access. Chrome and Edge favor minimal permissions; Firefox
retains the broader access supplied by its Manifest V2 content-script model.
