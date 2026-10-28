import { createLifecycle } from "./lifecycle.js";


export function createGameKit({ ui, t } = {}) {
  if (!ui) {
    throw new TypeError("Game kit requires a UI kit");
  }

  const lifecycle = createLifecycle();

  function elementOf(value) {
    return value?.element ?? value;
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

  function addChildren(parent, children) {
    for (const child of [children].flat(Infinity)) {
      const element = elementOf(child);

      if (element instanceof Node) {
        parent.append(element);
      }
    }
  }

  function shell({
    status = null,
    board = null,
    actions = [],
    dataset = {}
  } = {}) {
    const scope = createLifecycle();
    const element = document.createElement("div");

    element.className = "game";
    Object.assign(element.dataset, dataset);

    addChildren(element, status);
    addChildren(element, board);

    const actionsElement = document.createElement("div");
    actionsElement.className = "game__actions";

    addChildren(actionsElement, actions);

    if (actionsElement.childElementCount) {
      element.append(actionsElement);
    }

    return component(element, scope);
  }

  function status(options = {}) {
    const control = ui.status(options);
    lifecycle.own(control);

    return control;
  }

  function board({
    className = "",
    columns = null,
    dataset = {},
    render,
    onClick
  } = {}) {
    const scope = createLifecycle();
    const element = document.createElement("div");

    element.className = "game__board";

    for (const name of className.split(/\s+/).filter(Boolean)) {
      element.classList.add(name);
    }

    Object.assign(element.dataset, dataset);

    if (Number.isInteger(columns) && columns > 0) {
      element.dataset.layout = "grid";
      element.style.setProperty("--game-columns", columns);
    }

    if (typeof onClick === "function") {
      scope.listen(element, "click", onClick);
    }

    if (typeof render === "function") {
      render(element);
    }

    return component(element, scope, {
      render(nextRender) {
        if (!scope.destroyed && typeof nextRender === "function") {
          nextRender(element);
        }
      }
    });
  }

  function cell({
    index = 0,
    text = "",
    label = "",
    disabled = false,
    dataset = {},
    onClick
  } = {}) {
    const scope = createLifecycle();
    const element = document.createElement("button");

    element.type = "button";
    element.className = "game__cell";
    element.disabled = Boolean(disabled);
    element.textContent = String(text);

    Object.assign(element.dataset, { index, ...dataset });

    if (label) {
      element.setAttribute("aria-label", label);
    }

    if (typeof onClick === "function") {
      scope.listen(element, "click", onClick);
    }

    return component(element, scope, {
      setText(value) {
        element.textContent = String(value ?? "");
      },

      setLabel(value) {
        element.setAttribute("aria-label", String(value ?? ""));
      },

      setDisabled(value) {
        element.disabled = Boolean(value);
      },

      setSelected(value) {
        element.classList.toggle("is-selected", Boolean(value));
      },

      setWinning(value) {
        element.classList.toggle("is-winning", Boolean(value));
      }
    });
  }

  function restart(options = {}) {
    const control = ui.button({
      ...options,
      textKey: options.textKey ??
        (options.text ? undefined : "game.restart")
    });

    lifecycle.own(control);

    return control;
  }

  return {
    shell,
    status,
    board,
    cell,
    restart,

    timeout(callback, delay) {
      return lifecycle.timeout(callback, delay);
    },

    destroy() {
      lifecycle.destroy();
    }
  };
}