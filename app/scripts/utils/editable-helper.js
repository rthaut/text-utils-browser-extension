import ACTIONS from "scripts/actions";

export function ConvertEditableElementCase(targetElementId, action) {
  action = ACTIONS[action];
  if (typeof action !== "function") {
    console.error(`Action "${action}" is invalid`);
    return;
  }

  const element = browser.contextMenus.getTargetElement(targetElementId);
  const { value, selectionStart, selectionEnd } = element;

  if (selectionStart === selectionEnd) {
    // no selection; convert the entire value as requested
    element.value = action.call(null, value);
  } else {
    // convert only the selected text as requested
    element.value =
      value.substring(0, selectionStart) +
      action.call(null, value.substring(selectionStart, selectionEnd)) +
      value.substring(selectionEnd);

    // re-select the originally selected text
    element.setSelectionRange(selectionStart, selectionEnd);
    element.focus();
  }
}
