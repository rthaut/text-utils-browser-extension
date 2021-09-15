import ACTIONS from "scripts/actions";
import { GetSetting } from "./settings";

export async function ConvertEditableElementCase(targetElementId, action) {
  action = ACTIONS[action]?.["func"];
  if (typeof action !== "function") {
    console.error(`Action "${action}" is invalid`);
    return;
  }

  const selectionOnly = await GetSetting("EditableApplyToSelectedTextOnly");

  const element = browser.contextMenus.getTargetElement(targetElementId);

  if (element.isContentEditable) {
    element.textContent = action.call(null, element.textContent);

    // TODO: support modifying selected text only in contenteditable DOM nodes/trees...
  } else {
    const { value, selectionStart, selectionEnd } = element;

    if (selectionStart === selectionEnd) {
      // no selection; convert the entire value as requested
      element.value = action.call(null, value);
    } else {
      if (!selectionOnly) {
        // convert the entire value
        element.value = action.call(null, value);
      } else {
        // convert only the selected text as requested
        element.value =
          value.substring(0, selectionStart) +
          action.call(null, value.substring(selectionStart, selectionEnd)) +
          value.substring(selectionEnd);
      }

      // re-select the originally selected text (even if we converted the entire value)
      element.setSelectionRange(selectionStart, selectionEnd);
      element.focus();
    }
  }
}
