import { browser } from "wxt/browser";

import utilities from "scripts/helpers/utilities";
import { GetSetting } from "scripts/helpers/settings";

/**
 * Replaces the current selection in the focused editable with `text` the way
 * typing would: the browser fires `input`, adds the edit to its undo history,
 * and in rich text only touches the selected range.
 * `execCommand()` is deprecated but is still the only API that does all three.
 * @param {Document} doc the document that holds the focused editable
 * @param {string} text the replacement text
 * @returns {boolean} whether the browser made the edit
 */
const InsertText = (doc, text) => {
  if (typeof doc.execCommand !== "function") {
    return false;
  }

  try {
    // inserting an empty string is a no-op in some browsers
    return text === ""
      ? doc.execCommand("delete", false)
      : doc.execCommand("insertText", false, text);
  } catch {
    return false;
  }
};

const dispatchInputEvents = (element) => {
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
};

/**
 * Sets a field's value through the prototype's setter. React and similar
 * frameworks override `value` on the element itself to track it, and ignore
 * the next `input` event when the new value goes through that override.
 * @param {HTMLInputElement|HTMLTextAreaElement} element
 * @param {string} value
 */
const setNativeValue = (element, value) => {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const { set } = Object.getOwnPropertyDescriptor(prototype, "value");
  set.call(element, value);
};

/**
 * @param {HTMLInputElement|HTMLTextAreaElement} element
 * @param {(text: string) => Promise<string>} convert
 * @param {boolean} selectionOnly
 */
const ApplyToTextField = async (element, convert, selectionOnly) => {
  const { value, selectionStart, selectionEnd } = element;

  // `selectionStart` is null for input types without a text selection API
  // (such as email and number), so those always convert the whole value
  const hasSelection =
    selectionStart !== null && selectionStart !== selectionEnd;
  const [start, end] =
    hasSelection && selectionOnly
      ? [selectionStart, selectionEnd]
      : [0, value.length];

  const replacement = await convert(value.substring(start, end));

  element.focus();
  if (selectionStart === null) {
    element.select();
  } else {
    element.setSelectionRange(start, end);
  }

  if (!InsertText(element.ownerDocument, replacement)) {
    setNativeValue(
      element,
      value.substring(0, start) + replacement + value.substring(end),
    );
    dispatchInputEvents(element);
  }

  if (hasSelection) {
    // keep the converted text selected
    if (selectionOnly) {
      element.setSelectionRange(start, start + replacement.length);
    } else {
      element.setSelectionRange(selectionStart, selectionEnd);
    }
    element.focus();
  }
};

/**
 * Finds the outermost contenteditable element (the editing host), since the
 * menu target can be any element inside it, like a bold word or a paragraph.
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
const GetEditingHost = (element) => {
  // the whole document is editable in design mode (used by iframe editors)
  if (element.ownerDocument.designMode === "on") {
    return element.ownerDocument.body;
  }

  let host = element;
  while (host.parentElement?.isContentEditable) {
    host = host.parentElement;
  }
  return host;
};

/**
 * @param {HTMLElement} element
 * @param {(text: string) => Promise<string>} convert
 * @param {boolean} selectionOnly
 */
const ApplyToContentEditable = async (element, convert, selectionOnly) => {
  const host = GetEditingHost(element);
  const doc = host.ownerDocument;
  const selection = doc.getSelection();

  let range =
    selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
  const wholeHost =
    !selectionOnly ||
    !range ||
    range.collapsed ||
    !host.contains(range.commonAncestorContainer);
  if (wholeHost) {
    range = doc.createRange();
    range.selectNodeContents(host);
  }

  host.focus();
  selection.removeAllRanges();
  selection.addRange(range);

  // `innerText` (unlike `textContent`) has line breaks between paragraphs and
  // list items, and (unlike the selection's text in Firefox) leaves out the
  // whitespace that only formats the HTML source
  const replacement = await convert(
    wholeHost ? host.innerText : selection.toString(),
  );

  // select the range again in case the selection moved while an async
  // utility ran
  selection.removeAllRanges();
  selection.addRange(range);

  if (!InsertText(doc, replacement)) {
    range.deleteContents();
    const node = doc.createTextNode(replacement);
    range.insertNode(node);
    selection.removeAllRanges();
    range.selectNode(node);
    selection.addRange(range);
    host.dispatchEvent(new Event("input", { bubbles: true }));
  }
};

export async function ApplyUtilityToEditableElement(elementId, utilityId) {
  const utility = utilities[utilityId]?.["fn"];
  if (typeof utility !== "function") {
    console.error(`Utility "${utilityId}" is invalid`);
    return;
  }

  const element = browser.menus.getTargetElement(elementId);
  if (!element) {
    console.error(`Target element "${elementId}" is invalid`);
    return;
  }

  const selectionOnly = await GetSetting("EditableApplyToSelectedTextOnly");
  // utilities can be sync or async (like the hash utilities)
  const convert = async (text) => await utility.call(null, text);

  if (element.isContentEditable || element.ownerDocument.designMode === "on") {
    await ApplyToContentEditable(element, convert, selectionOnly);
  } else {
    await ApplyToTextField(element, convert, selectionOnly);
  }
}
