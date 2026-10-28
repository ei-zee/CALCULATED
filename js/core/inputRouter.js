export function createInputRouter({ slotManager }) {
  function ignored(reason) {
    return { status: "ignored", reason };
  }


  function isBrowserControl(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    return (
      element.matches("input, textarea, select, button, a[href]") ||
      element.isContentEditable ||
      Boolean(element.closest(
        '[role="textbox"], [contenteditable="true"]'
      ))
    );
  }


  function handleKeydown(event) {
    if (event.defaultPrevented || event.isComposing) {
      return ignored("event-not-available");
    }

    if (document.querySelector("dialog[open]")) {
      return ignored("dialog-open");
    }

    if (isBrowserControl(document.activeElement)) {
      return ignored("browser-control");
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return ignored("modified-key");
    }

    const calculator = slotManager.getActiveCalculator();

    if (!calculator) {
      return ignored("no-calculator");
    }

    if (calculator.keyboardEnabled !== true) {
      return ignored("keyboard-not-supported");
    }

    const actions = {
      Enter: "calculate",
      Backspace: "backspace",
      Delete: "clear"
    };

    const action = actions[event.key];

    if (action) {
      if (typeof calculator.receiveAction !== "function") {
        return ignored("action-not-supported");
      }

      return calculator.receiveAction(action) ??
        ignored("no-response");
    }

    if (typeof calculator.receiveInput !== "function") {
      return ignored("input-not-supported");
    }

    return calculator.receiveInput({
      key: event.key,
      code: event.code,
      ctrl: false,
      alt: false,
      shift: event.shiftKey,
      source: "keyboard"
    }) ?? ignored("no-response");
  }


  return {
    handleKeydown
  };
}