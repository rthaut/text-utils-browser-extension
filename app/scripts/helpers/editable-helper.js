import utilities from "scripts/helpers/utilities";
import { GetSetting } from "scripts/helpers/settings";

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

  if (element.isContentEditable) {
    element.textContent = utility.call(null, element.textContent);

    // TODO: support modifying selected text only in contenteditable DOM nodes/trees...
  } else {
    const { value, selectionStart, selectionEnd } = element;

    if (selectionStart === selectionEnd) {
      // no selection; convert the entire value
      element.value = utility.call(null, value);
    } else {
      if (!selectionOnly) {
        // convert the entire value
        element.value = utility.call(null, value);
      } else {
        // convert only the selected text
        element.value =
          value.substring(0, selectionStart) +
          utility.call(null, value.substring(selectionStart, selectionEnd)) +
          value.substring(selectionEnd);
      }

      // re-select the originally selected text (even if we converted the entire value)
      element.setSelectionRange(selectionStart, selectionEnd);
      element.focus();
    }
  }
}
