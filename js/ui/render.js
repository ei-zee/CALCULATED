import { on, emit } from "../core/eventBus.js";
import { get, set } from "../core/storage.js";
import {
  APP_CONFIG,
  getThemeConfig,
  getLanguageConfig,
  getLocalizedTitle
} from "../config.js";
import {
  initLanguage,
  getLanguage,
  setLanguage,
  apply as applyI18n,
  t
} from "../i18n/i18n.js";


export function createRender() {
  const state = {
    theme: APP_CONFIG.defaultTheme,
    language: APP_CONFIG.defaultLanguage,
    activeSlot: "A",
    fullscreen: false,
    layout: "desktop",
    orientation: "landscape"
  };

  let initialized = false;
  let controller = null;
  let themeRequest = 0;
  let themeLoading = false;
  let fullscreenFallback = false;

  const subscriptions = [];
  const pendingThemes = new Map();


  function feedback(key, variables = {}) {
    emit("feedback:show", {
      message: t(key, variables)
    });
  }


  function nextItem(items, id) {
    const index = items.findIndex(item => item.id === id);

    return items[(index + 1) % items.length];
  }


  function updateThemeButton() {
    const button = document.getElementById("themeBtn");

    if (!button) {
      return;
    }

    const next = nextItem(APP_CONFIG.themes, state.theme);

    if (!next) {
      return;
    }

    const title = t("tooltip.themeNext", {
      theme: getLocalizedTitle(next.title, getLanguage())
    });

    button.textContent = next.icon;
    button.title = title;
    button.setAttribute("aria-label", title);
    button.setAttribute("aria-busy", String(themeLoading));
  }


  function updateLanguageButton() {
    const button = document.getElementById("langBtn");

    if (!button) {
      return;
    }

    const current = getLanguageConfig(getLanguage());
    const next = nextItem(APP_CONFIG.languages, getLanguage());

    button.textContent = current?.icon ?? getLanguage();

    const title = t("tooltip.languageNext", {
      language: next?.title ?? ""
    });

    button.title = title;
    button.setAttribute("aria-label", title);
  }


  function applyScreen() {
    state.fullscreen =
      Boolean(document.fullscreenElement) ||
      fullscreenFallback;

    document.body.dataset.screen =
      state.fullscreen ? "fullscreen" : "normal";

    const button = document.getElementById("fullscreenBtn");

    if (button) {
      const title = t(
        state.fullscreen
          ? "tooltip.fullscreenExit"
          : "tooltip.fullscreen"
      );

      button.title = title;
      button.setAttribute("aria-label", title);
      button.setAttribute("aria-pressed", String(state.fullscreen));
    }
  }


  function applyLanguage() {
    state.language = getLanguage();

    document.documentElement.lang = state.language;

    applyI18n();
    updateLanguageButton();
    updateThemeButton();
    applyScreen();
  }


  function applyActiveSlot() {
    document.querySelectorAll(".slot").forEach(slot => {
      slot.classList.toggle(
        "selected",
        slot.dataset.slot === state.activeSlot
      );
    });
  }


  function updateViewport() {
    state.layout = window.matchMedia(
      `(max-width: ${APP_CONFIG.mobileBreakpoint}px)`
    ).matches
      ? "mobile"
      : "desktop";

    state.orientation =
      window.innerHeight > window.innerWidth
        ? "portrait"
        : "landscape";

    document.body.dataset.layout = state.layout;
    document.body.dataset.orientation = state.orientation;
  }


  function cancelPendingThemes() {
    for (const cancel of [...pendingThemes.values()]) {
      cancel();
    }
  }


  async function applyTheme(themeId) {
    const theme = getThemeConfig(themeId);

    if (!theme) {
      return false;
    }

    const request = ++themeRequest;

    cancelPendingThemes();

    const previous = document.getElementById("themeStyle");

    if (
      previous?.sheet &&
      previous.href === theme.href
    ) {
      state.theme = theme.id;
      document.body.dataset.theme = theme.id;

      themeLoading = false;
      updateThemeButton();

      return true;
    }

    themeLoading = true;
    updateThemeButton();

    const link = document.createElement("link");

    link.rel = "stylesheet";
    link.href = theme.href;

    // Загружаем, но не применяем до успешного завершения.
    link.media = "not all";

    const loaded = await new Promise(resolve => {
      let settled = false;
      let timer = null;

      function finish(success) {
        if (settled) {
          return;
        }

        settled = true;

        clearTimeout(timer);
        link.onload = null;
        link.onerror = null;
        pendingThemes.delete(link);

        if (!success) {
          link.remove();
        }

        resolve(success);
      }

      pendingThemes.set(link, () => finish(false));

      link.onload = () => finish(true);
      link.onerror = () => finish(false);

      timer = setTimeout(() => finish(false), 15000);

      if (previous) {
        previous.after(link);
      } else {
        document.head.append(link);
      }
    });

    if (request !== themeRequest) {
      link.remove();
      return false;
    }

    themeLoading = false;

    if (!loaded) {
      updateThemeButton();
      feedback("toast.themeFailed");

      return false;
    }

    previous?.remove();

    link.id = "themeStyle";

    document.body.dataset.theme = theme.id;
    link.media = "all";

    state.theme = theme.id;
    updateThemeButton();

    emit("theme:changed", {
      theme: state.theme
    });

    return true;
  }


  async function toggleTheme() {
    const next = nextItem(APP_CONFIG.themes, state.theme);

    if (!next || themeLoading) {
      return;
    }

    const applied = await applyTheme(next.id);

    if (!applied) {
      return;
    }

    set("theme", state.theme);

    feedback("toast.themeChanged", {
      theme: getLocalizedTitle(next.title, getLanguage())
    });
  }


  function toggleLanguage() {
    const next = nextItem(
      APP_CONFIG.languages,
      getLanguage()
    );

    if (next) {
      setLanguage(next.id);
    }
  }


  async function toggleFullscreen() {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        applyScreen();
      }

      return;
    }

    if (fullscreenFallback) {
      fullscreenFallback = false;
      applyScreen();
      return;
    }

    if (typeof document.documentElement.requestFullscreen === "function") {
      try {
        await document.documentElement.requestFullscreen();
        applyScreen();
        return;
      } catch {
        // При отказе используем компоновку внутри страницы.
      }
    }

    fullscreenFallback = true;
    applyScreen();

    feedback("toast.fullscreenUnavailable");
  }


  function setActiveSlot(slotId) {
    if (!["A", "B"].includes(slotId)) {
      return;
    }

    // Источник состояния активного слота — slotManager.
    emit("activeSlot:request", { slotId });
  }


  async function init() {
    if (initialized) {
      return;
    }

    initialized = true;
    controller = new AbortController();

    const { signal } = controller;

    initLanguage(get("language", APP_CONFIG.defaultLanguage));

    state.language = getLanguage();

    updateViewport();
    applyLanguage();
    applyActiveSlot();

    window.addEventListener("resize", updateViewport, { signal });

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        fullscreenFallback = false;
      }

      applyScreen();
    }, { signal });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && fullscreenFallback) {
        fullscreenFallback = false;
        applyScreen();
      }
    }, { signal });

    subscriptions.push(
      on("language:changed", () => {
        set("language", getLanguage());
        applyLanguage();

        feedback("toast.languageChanged", {
          language: getLanguageConfig(getLanguage())?.title ?? getLanguage()
        });
      }),

      on("activeSlot:changed", ({ slotId }) => {
        if (!["A", "B"].includes(slotId)) {
          return;
        }

        state.activeSlot = slotId;
        applyActiveSlot();
      })
    );

    const savedTheme = get("theme", APP_CONFIG.defaultTheme);
    const initialTheme = getThemeConfig(savedTheme)
      ? savedTheme
      : APP_CONFIG.defaultTheme;

    await applyTheme(initialTheme);
  }


  function destroy() {
    if (!initialized) {
      return;
    }

    initialized = false;

    themeRequest++;
    cancelPendingThemes();

    controller?.abort();
    controller = null;

    subscriptions.splice(0).forEach(unsubscribe => unsubscribe());

    themeLoading = false;
    fullscreenFallback = false;

    applyScreen();
  }


  return {
    init,
    destroy,
    toggleTheme,
    toggleLanguage,
    toggleFullscreen,
    setActiveSlot,
    getState: () => ({ ...state })
  };
}