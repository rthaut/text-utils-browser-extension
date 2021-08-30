import ACTIONS from "scripts/actions";

export function ConvertEditableElementCase(targetElementId, action) {
  action = ACTIONS[action]?.["func"];
  if (typeof action !== "function") {
    console.error(`Action "${action}" is invalid`);
    return;
  }

  console.log(action);

  const element = browser.menus.getTargetElement(targetElementId);

  if (element.isContentEditable) {
    element.textContent = action.call(null, element.textContent);

    // TODO: support modifying selected text only in contenteditable DOM nodes/trees...
  } else {
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
}
