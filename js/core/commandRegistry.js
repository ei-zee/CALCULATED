import { emit } from "./eventBus.js";
import { t } from "../i18n/i18n.js";

export function createCommandRegistry({
  slotManager,
  header
}) {
  const commands = new Map();

  function isEditing(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    return (
      element.matches("input, textarea") ||
      element.isContentEditable ||
      Boolean(element.closest(
        '[role="textbox"], [contenteditable="true"]'
      ))
    );
  }

  function isInteractive(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    return (
      isEditing(element) ||
      element.matches("select, button, a[href], summary")
    );
  }

  function normalizeTrigger(trigger) {
    return String(trigger)
      .split("+")
      .map(part => part.trim().toLowerCase())
      .filter(Boolean)
      .join("+");
  }

  function eventTrigger(event) {
    const parts = [];

    if (event.ctrlKey || event.metaKey) {
      parts.push("ctrl");
    }

    if (event.altKey) {
      parts.push("alt");
    }

    if (event.shiftKey) {
      parts.push("shift");
    }

    const key = event.code || (
      event.key === " " ? "Space" : event.key
    );

    parts.push(key.toLowerCase());

    return parts.join("+");
  }

  function reportError(error) {
    console.error("Command failed:", error);

    emit("feedback:show", {
      message: t("app.actionError")
    });
  }

  function register(trigger, handler, options = {}) {
    if (typeof handler !== "function") {
      throw new TypeError("Command handler must be a function");
    }

    const key = normalizeTrigger(trigger);

    const command = {
      handler,
      allowInDialog: Boolean(options.allowInDialog),
      allowRepeat: Boolean(options.allowRepeat),
      enabled: options.enabled ?? (() => true)
    };

    commands.set(key, command);

    return () => {
      if (commands.get(key) === command) {
        commands.delete(key);
      }
    };
  }

  function handle(event) {
    if (event.defaultPrevented || event.isComposing) {
      return false;
    }

    const command = commands.get(eventTrigger(event));

    if (!command) {
      return false;
    }

    if (
      document.querySelector("dialog[open]") &&
      !command.allowInDialog
    ) {
      return false;
    }

    if (!command.enabled(event, document.activeElement)) {
      return false;
    }

    if (event.repeat && !command.allowRepeat) {
      return true;
    }

    try {
      const response = command.handler(event);

      if (response && typeof response.then === "function") {
        response.catch(reportError);
      }
    } catch (error) {
      reportError(error);
    }

    return true;
  }

  register("ctrl+alt+ArrowLeft", () => {
    slotManager.setActive("A");
  });

  register("ctrl+alt+ArrowRight", () => {
    slotManager.setActive("B");
  });

  register("ctrl+alt+KeyS", () => {
    slotManager.switchSlots();
  });

  register("ctrl+alt+KeyV", () => {
    return slotManager.transferResult();
  });

  register(
    "ctrl+KeyZ",
    () => slotManager.undo(),
    {
      enabled: (event, active) => !isEditing(active)
    }
  );

  register(
    "Space",
    () => header.toggleRadio(),
    {
      enabled: (event, active) => !isInteractive(active)
    }
  );

  return {
    register,
    handle,

    destroy() {
      commands.clear();
    }
  };
}