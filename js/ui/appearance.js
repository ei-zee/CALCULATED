import { emit, on } from "../core/eventBus.js";
import { createLifecycle } from "./lifecycle.js";

const STORAGE_KEY = "nol.appearance";

const THEMES = ["standard", "vista", "summer"];
const SCHEMES = ["light", "dark"];

export function createAppearance() {
  const lifecycle = createLifecycle();

  let theme = "standard";
  let scheme = "light";

  function normalizeTheme(value) {
    return THEMES.includes(value) ? value : "standard";
  }

  function normalizeScheme(value) {
    return SCHEMES.includes(value) ? value : "light";
  }

  function apply() {
    document.body.dataset.theme = theme;
    document.body.dataset.colorScheme = scheme;

    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) {
      meta.content = scheme === "dark" ? "#141517" : "#edf2f7";
    }

    emit("appearance:changed", { theme, scheme });
  }

  function save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ theme, scheme })
      );
    } catch (error) {
      console.warn("Appearance preferences were not saved:", error);
    }
  }

  function setTheme(value) {
    theme = normalizeTheme(value);
    apply();
    save();
  }

  function setScheme(value) {
    scheme = normalizeScheme(value);
    apply();
    save();
  }

  function toggleScheme() {
    setScheme(scheme === "light" ? "dark" : "light");
  }

  function cycleTheme(direction) {
    const index = THEMES.indexOf(theme);
    const nextIndex =
      (index + direction + THEMES.length) % THEMES.length;

    setTheme(THEMES[nextIndex]);
  }

  function nextTheme() {
    cycleTheme(1);
  }

  function previousTheme() {
    cycleTheme(-1);
  }

  function restore() {
    let saved = null;

    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch (error) {
      saved = null;
    }

    theme = normalizeTheme(saved?.theme);
    scheme = normalizeScheme(saved?.scheme);

    if (!saved?.scheme) {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      scheme = prefersDark ? "dark" : "light";
    }

    apply();
  }

  function init() {
    if (lifecycle.destroyed) {
      return;
    }

    restore();

    lifecycle.add(
      on("appearance:set", ({ theme, scheme }) => {
        if (theme) {
          setTheme(theme);
        }

        if (scheme) {
          setScheme(scheme);
        }
      })
    );
  }

  return {
    init,
    setTheme,
    setScheme,
    toggleScheme,
    nextTheme,
    previousTheme,
    getTheme: () => theme,
    getScheme: () => scheme,
    destroy() {
      lifecycle.destroy();
    }
  };
}