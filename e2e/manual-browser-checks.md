# Manual Browser Checks

Run these checks before publishing a browser build. The automated permission
harness verifies the Chrome and Firefox manifest shapes, then exercises the
permission-sensitive pipeline in Chromium with synthetic context-menu events.
It cannot open a native browser context menu, create a real `activeTab` grant,
or exercise the pipeline in Firefox.

## Chrome, Edge, and Firefox

1. Load the unpacked production build with no host permissions granted.
2. On a normal web page, use a Text Utilities context-menu action on selected
   text and confirm the transformed value reaches the clipboard.
3. On the first invocation for that page, use an action in a text input,
   textarea, and contenteditable element. Confirm each value is updated.
4. Repeat an editable-field action to cover the already-injected content-script
   path.
5. Confirm the generated manifest has no `host_permissions` or static
   `content_scripts` entry.
6. Confirm actions in same-origin nested frames work.
7. Confirm an action inside a cross-origin iframe does not change the frame.
   Cross-origin child-frame access is not supported without a host grant.

## Expected Compatibility Boundary

All browsers share utility execution, menu configuration, storage, messaging,
editable-element logic, and frame-targeted dynamic injection. Firefox remains
on Manifest V2 with a minimum version of 117 because that release fixed a known
`activeTab` issue in same-origin nested frames.
