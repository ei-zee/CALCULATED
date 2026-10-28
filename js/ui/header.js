import { on } from "../core/eventBus.js";
import { t } from "../i18n/i18n.js";
import { createLifecycle } from "./lifecycle.js";
import { createRadio } from "./radio.js";

export function createHeader() {
  const lifecycle = createLifecycle();

  let initialized = false;
  let radio = null;

  function updateTitle() {
    document.title = t("app.name");
  }

  function init() {
    if (initialized || lifecycle.destroyed) {
      return;
    }

    const mount = document.getElementById("radioMount");

    if (!mount) {
      throw new Error("Missing header element: radioMount");
    }

    radio = createRadio();
    radio.mount(mount);

    lifecycle.add(
      on("language:changed", updateTitle)
    );

    updateTitle();
    initialized = true;
  }

  function toggleRadio() {
    if (!initialized || lifecycle.destroyed || !radio) {
      return;
    }

    return radio.toggle();
  }

  function destroy() {
    if (lifecycle.destroyed) {
      return;
    }

    lifecycle.destroy();

    radio?.destroy();
    radio = null;
    initialized = false;
  }

  return {
    init,
    toggleRadio,
    destroy
  };
}