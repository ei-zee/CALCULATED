import { createLifecycle } from "./lifecycle.js";
import { createNumberInput } from "./numberInput.js";


export function createUiKit({ t } = {}) {
  const lifecycle = createLifecycle();

  function elementOf(value) {
    return value?.element ?? value;
  }

  function append(parent, children) {
    for (const child of [children].flat(Infinity)) {
      const element = elementOf(child);

      if (element instanceof Node) {
        parent.append(element);
      }
    }
  }

  function create(tag, className, dataset = {}) {
    const element = document.createElement(tag);
    element.className = className;

    for (const [key, value] of Object.entries(dataset)) {
      if (value !== null && value !== undefined) {
        element.dataset[key] = String(value);
      }
    }

    return element;
  }

  function component(element, scope, methods = {}) {
    const result = {
      element,
      ...methods,

      destroy() {
        if (scope.destroyed) {
          return;
        }

        scope.destroy();
        element.remove();
      }
    };

    const detach = lifecycle.add(() => result.destroy());

    scope.add(detach);

    return result;
  }

  function bindText(scope, options, property, setter) {
    let key = options[`${property}Key`];
    let variables = options.variables ?? {};
    let literal = options[property] ?? "";

    function update() {
      setter(
        key && typeof t === "function"
          ? t(key, variables)
          : String(literal)
      );
    }

    if (typeof t?.subscribe === "function") {
      scope.add(t.subscribe(update));
    }

    update();

    return {
      set(value) {
        key = null;
        literal = value ?? "";
        update();
      },

      setKey(nextKey, nextVariables = {}) {
        key = nextKey;
        variables = nextVariables;
        update();
      }
    };
  }

  function button(options = {}) {
    const scope = createLifecycle();
    const element = create("button", "ui-button", options.dataset);

    element.type = "button";
    element.disabled = Boolean(options.disabled);

    element.classList.add(
      `ui-button--${options.variant ?? "default"}`,
      `ui-button--${options.size ?? "medium"}`
    );

    if (options.icon) {
      const icon = create("span", "ui-button__icon");
      icon.textContent = options.icon;
      icon.setAttribute("aria-hidden", "true");
      element.append(icon);
    }

    const caption = create("span", "ui-button__text");
    element.append(caption);

    const text = bindText(scope, options, "text", value => {
      caption.textContent = value;
    });

    const title = bindText(scope, options, "title", value => {
      element.title = value;

      if (value) {
        element.setAttribute("aria-label", value);
      } else {
        element.removeAttribute("aria-label");
      }
    });

    if (typeof options.onClick === "function") {
      scope.listen(element, "click", options.onClick);
    }

    return component(element, scope, {
      setText: text.set,
      setTextKey: text.setKey,
      setTitle: title.set,

      setDisabled(value) {
        element.disabled = Boolean(value);
      }
    });
  }

  function field(options = {}) {
    const scope = createLifecycle();

    // Контейнер, а не label вокруг потенциально нескольких контролов.
    const element = create("div", "ui-field", options.dataset);
    const label = create("label", "ui-field__label");
    const hint = create("span", "ui-field__hint");

    const control = elementOf(options.control);

    if (control instanceof HTMLElement) {
      const input = control.matches("input, select, textarea")
        ? control
        : control.querySelector("input, select, textarea");

      if (input) {
        if (!input.id) {
          input.id = `ui-${crypto.randomUUID()}`;
        }

        label.htmlFor = input.id;

        hint.id = `${input.id}-hint`;

        const describedBy = new Set(
          (input.getAttribute("aria-describedby") ?? "")
            .split(/\s+/)
            .filter(Boolean)
        );

        describedBy.add(hint.id);

        input.setAttribute(
          "aria-describedby",
          [...describedBy].join(" ")
        );
      }
    }

    const labelText = bindText(scope, options, "label", value => {
      label.textContent = value;
      label.hidden = !value;
    });

    const hintText = bindText(scope, options, "hint", value => {
      hint.textContent = value;
      hint.hidden = !value;
    });

    element.append(label);
    append(element, options.control);
    element.append(hint);

    return component(element, scope, {
      setLabel: labelText.set,
      setLabelKey: labelText.setKey,
      setHint: hintText.set
    });
  }

  function number(options = {}) {
    const scope = createLifecycle();

    const input = createNumberInput({
      ...options,
      element: null,
      className: "ui-number"
    });

    scope.own(input);

    const label = bindText(scope, options, "label", input.setLabel);

    return component(input.element, scope, {
      setValue: input.setValue,
      getValue: input.getValue,
      getNumber: input.getNumber,
      setDisabled: input.setDisabled,
      setLabel: label.set,
      setLabelKey: label.setKey,
      focus: input.focus
    });
  }

  function select(options = {}) {
    const scope = createLifecycle();
    const element = create("select", "ui-select", options.dataset);

    let items = options.options ?? [];
    let currentValue = String(options.value ?? "");

    element.disabled = Boolean(options.disabled);

    function optionLabel(option) {
      return option.labelKey && typeof t === "function"
        ? t(option.labelKey, option.variables)
        : String(option.label ?? option.value ?? "");
    }

    function renderOptions() {
      element.replaceChildren();

      for (const item of items) {
        const option = document.createElement("option");

        option.value = String(item.value ?? "");
        option.textContent = optionLabel(item);
        option.disabled = Boolean(item.disabled);

        element.append(option);
      }

      element.value = currentValue;
    }

    const label = bindText(scope, options, "label", value => {
      if (value) {
        element.setAttribute("aria-label", value);
      } else {
        element.removeAttribute("aria-label");
      }
    });

    scope.listen(element, "change", () => {
      currentValue = element.value;
      options.onChange?.(currentValue);
    });

    if (typeof t?.subscribe === "function") {
      scope.add(t.subscribe(renderOptions));
    }

    renderOptions();

    return component(element, scope, {
      setValue(value) {
        currentValue = String(value ?? "");
        element.value = currentValue;
      },

      getValue() {
        return element.value;
      },

      setOptions(nextOptions, nextValue = currentValue) {
        items = nextOptions;
        currentValue = String(nextValue ?? "");
        renderOptions();
      },

      setDisabled(value) {
        element.disabled = Boolean(value);
      },

      setLabel: label.set,
      setLabelKey: label.setKey
    });
  }

  function checkbox(options = {}) {
    const scope = createLifecycle();
    const element = create("label", "ui-checkbox", options.dataset);
    const input = create("input", "ui-checkbox__input");
    const mark = create("span", "ui-checkbox__mark");
    const caption = create("span", "ui-checkbox__text");

    input.type = "checkbox";
    input.checked = Boolean(options.checked);
    input.disabled = Boolean(options.disabled);

    mark.setAttribute("aria-hidden", "true");

    const label = bindText(scope, options, "label", value => {
      caption.textContent = value;
      input.setAttribute("aria-label", value);
    });

    element.append(input, mark, caption);

    scope.listen(input, "change", () => {
      options.onChange?.(input.checked);
    });

    return component(element, scope, {
      setChecked(value) {
        input.checked = Boolean(value);
      },

      isChecked() {
        return input.checked;
      },

      setDisabled(value) {
        input.disabled = Boolean(value);
      },

      setLabel: label.set,
      setLabelKey: label.setKey
    });
  }

  function segmented(options = {}) {
    const scope = createLifecycle();
    const element = create("div", "ui-segmented", options.dataset);

    element.setAttribute("role", "group");

    let items = options.options ?? [];
    let currentValue = String(options.value ?? "");

    bindText(scope, options, "label", value => {
      if (value) {
        element.setAttribute("aria-label", value);
      } else {
        element.removeAttribute("aria-label");
      }
    });

    function updateSelection() {
      for (const button of element.children) {
        const selected = button.dataset.value === currentValue;

        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
      }
    }

    function renderOptions() {
      element.replaceChildren();

      for (const item of items) {
        const button = create("button", "ui-segmented__button");

        button.type = "button";
        button.dataset.value = String(item.value);
        button.disabled = Boolean(item.disabled);

        button.textContent =
          item.labelKey && typeof t === "function"
            ? t(item.labelKey, item.variables)
            : String(item.label ?? item.value);

        element.append(button);
      }

      updateSelection();
    }

    scope.listen(element, "click", event => {
      const button = event.target instanceof Element
        ? event.target.closest("button[data-value]")
        : null;

      if (
        !button ||
        !element.contains(button) ||
        button.disabled ||
        button.dataset.value === currentValue
      ) {
        return;
      }

      currentValue = button.dataset.value;
      updateSelection();

      options.onChange?.(currentValue);
    });

    if (typeof t?.subscribe === "function") {
      scope.add(t.subscribe(renderOptions));
    }

    renderOptions();

    return component(element, scope, {
      setValue(value) {
        currentValue = String(value ?? "");
        updateSelection();
      },

      getValue() {
        return currentValue;
      },

      setOptions(nextOptions, nextValue = currentValue) {
        items = nextOptions;
        currentValue = String(nextValue ?? "");
        renderOptions();
      }
    });
  }

  function tabs(options = {}) {
    // Это переключатели представлений, а не ARIA tablist.
    // Полный tablist требует связанной системы tabpanel.
    const control = segmented(options);
    control.element.classList.add("ui-tabs");

    return control;
  }

  function textBlock(className, options = {}, live = false) {
    const scope = createLifecycle();
    const element = create("div", className, options.dataset);

    let variant = options.variant ?? "default";

    element.classList.add(`${className}--${variant}`);

    if (live) {
      element.setAttribute("role", "status");
      element.setAttribute("aria-live", "polite");
    }

    const text = bindText(scope, options, "text", value => {
      element.textContent = value;
    });

    return component(element, scope, {
      setText: text.set,
      setTextKey: text.setKey,

      setVariant(next) {
        element.classList.remove(`${className}--${variant}`);
        variant = next;
        element.classList.add(`${className}--${variant}`);
      }
    });
  }

  function note(options = {}) {
    return textBlock("ui-note", options, Boolean(options.live));
  }

  function status(options = {}) {
    return textBlock("ui-status", options, true);
  }

  function display(options = {}) {
    const scope = createLifecycle();
    const element = create("div", "ui-display", options.dataset);
    const expression = create("div", "ui-display__expression");
    const preview = create("div", "ui-display__preview");

    element.dataset.numberDisplay = "";

    element.append(expression, preview);

    function replaceZone(zone, value) {
      zone.replaceChildren();

      const node = elementOf(value);

      if (node instanceof Node) {
        zone.append(node);
      } else {
        zone.textContent = String(value ?? "");
      }
    }

    replaceZone(
      expression,
      options.input ?? options.expression ?? ""
    );

    replaceZone(preview, options.preview ?? "");

    return component(element, scope, {
      setExpression(value) {
        replaceZone(expression, value);
      },

      setPreview(value) {
        replaceZone(preview, value);
      },

      setInput(control) {
        replaceZone(expression, control);
      },

      setVariant(value) {
        element.dataset.variant = String(value);
      }
    });
  }

  function card(options = {}) {
    const scope = createLifecycle();

    const interactive =
      options.interactive ?? (typeof options.onClick === "function");

    const element = create(
      interactive ? "button" : "div",
      "ui-card",
      options.dataset
    );

    if (interactive) {
      element.type = "button";
      element.disabled = Boolean(options.disabled);
    } else {
      element.dataset.interactive = "false";
    }

    const title = create("span", "ui-card__title");
    const value = create("span", "ui-card__value");

    const titleText = bindText(scope, options, "title", text => {
      title.textContent = text;
    });

    element.append(title, value);

    value.textContent = String(options.value ?? "");

    function setSelected(selected) {
      element.classList.toggle("is-selected", Boolean(selected));

      if (interactive) {
        element.setAttribute("aria-pressed", String(Boolean(selected)));
      }
    }

    setSelected(options.selected);

    if (interactive && typeof options.onClick === "function") {
      scope.listen(element, "click", options.onClick);
    }

    return component(element, scope, {
      setSelected,
      setTitle: titleText.set,
      setTitleKey: titleText.setKey,

      setValue(next) {
        value.textContent = String(next ?? "");
      },

      setDisabled(disabled) {
        if (interactive) {
          element.disabled = Boolean(disabled);
        }
      }
    });
  }

  return {
    button,
    field,
    number,
    select,
    checkbox,
    segmented,
    tabs,
    display,
    note,
    status,
    card,

    destroy() {
      lifecycle.destroy();
    }
  };
}