import { createLifecycle } from "./lifecycle.js";


export function normalizeNumberText(raw) {
  return String(raw ?? "")
    .replace(/\u2212/g, "-")
    .replace(/\./g, ",");
}


export function parseNumberText(raw) {
  const text = normalizeNumberText(raw).trim();

  const pattern =
    /^[+-]?(?:\d+(?:,\d*)?|,\d+)(?:e[+-]?\d+)?$/i;

  if (!pattern.test(text)) {
    return null;
  }

  const value = Number(text.replace(",", "."));

  return Number.isFinite(value) ? value : null;
}


export function createNumberInput({
  element = null,
  value = "",
  label = "",
  placeholder = "0",
  allowNegative = false,
  integer = false,
  min = null,
  max = null,
  maxLength = 512,
  className = "ui-number",
  dataset = {},
  onChange
} = {}) {
  const lifecycle = createLifecycle();

  if (element !== null && !(element instanceof HTMLElement)) {
    throw new TypeError("Number input requires an HTML element");
  }

  const input = document.createElement("input");

  input.type = "text";
  input.inputMode = integer ? "numeric" : "decimal";
  input.enterKeyHint = "done";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.placeholder = placeholder;
  input.maxLength = maxLength;

  input.setAttribute("autocapitalize", "off");
  input.setAttribute("aria-label", label);

  if (element) {
    input.className = element.className;
    input.classList.add("calculator-number-input");

    if (element.id) {
      input.id = element.id;
    }

    Object.assign(input.dataset, element.dataset);
  } else {
    input.className = className;
  }

  Object.assign(input.dataset, dataset);

  let currentValue = "";

  function isAllowed(text) {
    if (text.length > maxLength) {
      return false;
    }

    const sign = allowNegative ? "[+-]?" : "\\+?";

    const pattern = integer
      ? new RegExp(`^${sign}\\d*$`)
      : new RegExp(
          `^${sign}\\d*(?:,\\d*)?(?:e[+-]?\\d*)?$`,
          "i"
        );

    if (!pattern.test(text)) {
      return false;
    }

    const numeric = Number(text.replace(",", "."));

    return (
      text === "" ||
      Number.isNaN(numeric) ||
      Number.isFinite(numeric)
    );
  }

  function getNumber() {
    const number = parseNumberText(currentValue);

    if (number === null) {
      return null;
    }

    if (!allowNegative && number < 0) {
      return null;
    }

    if (integer && !Number.isInteger(number)) {
      return null;
    }

    if (min !== null && number < min) {
      return null;
    }

    if (max !== null && number > max) {
      return null;
    }

    return number;
  }

  function write(text) {
    if (input.value === text) {
      return;
    }

    const focused = document.activeElement === input;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    input.value = text;

    if (focused && start !== null && end !== null) {
      input.setSelectionRange(
        Math.min(start, text.length),
        Math.min(end, text.length)
      );
    }
  }

  function updateValidity() {
    const invalid =
      currentValue !== "" &&
      getNumber() === null;

    input.setAttribute("aria-invalid", String(invalid));
  }

  function setValue(raw) {
    if (lifecycle.destroyed) {
      return false;
    }

    const candidate = normalizeNumberText(raw).trim();

    if (!isAllowed(candidate)) {
      return false;
    }

    currentValue = candidate;

    write(candidate);
    updateValidity();

    return true;
  }

  function commit() {
    if (lifecycle.destroyed) {
      return;
    }

    const candidate = normalizeNumberText(input.value);

    if (!isAllowed(candidate)) {
      write(currentValue);
      return;
    }

    const changed = candidate !== currentValue;

    currentValue = candidate;

    write(candidate);
    updateValidity();

    if (changed) {
      onChange?.(currentValue, getNumber());
    }
  }

  lifecycle.listen(input, "input", event => {
    if (!event.isComposing) {
      commit();
    }
  });

  lifecycle.listen(input, "compositionend", commit);

  lifecycle.listen(input, "keydown", event => {
    if (event.isComposing) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      input.blur();
    }

    if (event.key === "Escape") {
      input.blur();
    }
  });

  if (!setValue(value)) {
    throw new TypeError("Invalid initial number input value");
  }

  if (element) {
    element.replaceWith(input);
  }

  const display = input.closest("[data-number-display]");

  if (display) {
    lifecycle.listen(display, "click", event => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (event.target.closest(
        "button, select, a, input, textarea, label, summary, [contenteditable]"
      )) {
        return;
      }

      input.focus({ preventScroll: true });

      const end = input.value.length;
      input.setSelectionRange(end, end);
    });
  }

  return {
    element: input,

    setValue,

    getValue() {
      return currentValue;
    },

    getNumber,

    setLabel(text) {
      input.setAttribute("aria-label", String(text ?? ""));
    },

    setDisabled(disabled) {
      input.disabled = Boolean(disabled);
    },

    focus() {
      if (!lifecycle.destroyed) {
        input.focus({ preventScroll: true });
      }
    },

    destroy() {
      if (lifecycle.destroyed) {
        return;
      }

      lifecycle.destroy();
      input.remove();
    }
  };
}