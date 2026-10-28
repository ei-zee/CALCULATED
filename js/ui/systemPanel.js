import { emit, on } from "../core/eventBus.js";
import { t } from "../i18n/i18n.js";
import { createLifecycle } from "./lifecycle.js";

const THEMES = [
  {
    id: "standard",
    icon: "🎨",
    title: "Стандартная"
  },
  {
    id: "vista",
    icon: "🪟",
    title: "Vista"
  },
  {
    id: "summer",
    icon: "🌴",
    title: "Летняя"
  }
];

export function createSystemPanel({
  render,
  slotManager,
  appearance
}) {
  const lifecycle = createLifecycle();

  let initialized = false;
  let themeButton = null;
  let schemeButton = null;

  function reportError(error) {
    if (lifecycle.destroyed) {
      return;
    }

    console.error("System action failed:", error);

    emit("feedback:show", {
      message: t("app.actionError")
    });
  }

  function listenAction(button, action) {
    lifecycle.listen(button, "click", () => {
      try {
        const result = action();

        if (result && typeof result.then === "function") {
          result.catch(reportError);
        }
      } catch (error) {
        reportError(error);
      }
    });
  }

  function bind(id, action) {
    const button = document.getElementById(id);

    if (!button) {
      throw new Error(`Missing system button: ${id}`);
    }

    listenAction(button, action);
  }

  function updateThemeButton(theme) {
    if (!themeButton) {
      return;
    }

    const foundIndex = THEMES.findIndex(item => item.id === theme);
    const index = foundIndex >= 0 ? foundIndex : 0;

    const current = THEMES[index];
    const next = THEMES[(index + 1) % THEMES.length];

    const label =
      `Тема: ${current.title}. Следующая: ${next.title}`;

    themeButton.textContent = current.icon;
    themeButton.title = label;
    themeButton.setAttribute("aria-label", label);
  }

  function updateSchemeButton(scheme) {
    if (!schemeButton) {
      return;
    }

    const isDark = scheme === "dark";

    const label = isDark
      ? "Включить светлую схему"
      : "Включить тёмную схему";

    schemeButton.textContent = isDark ? "☀️" : "🌙";
    schemeButton.title = label;
    schemeButton.setAttribute("aria-label", label);
    schemeButton.setAttribute("aria-pressed", String(isDark));
  }

  function buildThemeButton() {
    schemeButton = document.getElementById("themeBtn");

    if (!schemeButton) {
      throw new Error("Missing system button: themeBtn");
    }

    themeButton = document.createElement("button");
    themeButton.id = "appearanceBtn";
    themeButton.className =
      "ui-button ui-button--icon system-btn theme-cycle-button";
    themeButton.type = "button";

    schemeButton.before(themeButton);

    listenAction(themeButton, () => appearance.nextTheme());

    lifecycle.add(
      on("appearance:changed", ({ theme, scheme }) => {
        updateThemeButton(theme);
        updateSchemeButton(scheme);
      })
    );

    updateThemeButton(appearance.getTheme());
    updateSchemeButton(appearance.getScheme());
  }

  function init() {
    if (initialized || lifecycle.destroyed) {
      return;
    }

    initialized = true;

    buildThemeButton();

    bind("undoBtn", () => slotManager.undo());
    bind("themeBtn", () => appearance.toggleScheme());
    bind("langBtn", () => render.toggleLanguage());
    bind("fullscreenBtn", () => render.toggleFullscreen());
  }

  function destroy() {
    if (lifecycle.destroyed) {
      return;
    }

    lifecycle.destroy();

    themeButton?.remove();
    themeButton = null;
    schemeButton = null;
    initialized = false;
  }

  return {
    init,
    destroy
  };
}