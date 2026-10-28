import { emit, on } from "./core/eventBus.js";
import { createCommandRegistry } from "./core/commandRegistry.js";
import { createInputRouter } from "./core/inputRouter.js";

import { createRender } from "./ui/render.js";
import { createHeader } from "./ui/header.js";
import { createSystemPanel } from "./ui/systemPanel.js";
import { createHelp } from "./ui/help.js";
import { createMobileSlots } from "./ui/mobileSlots.js";
import { createAppearance } from "./ui/appearance.js";
import { createLifecycle } from "./ui/lifecycle.js";

import { createSlotManager } from "./slots/slotManager.js";
import { createSlot } from "./slots/slot.js";

import { t } from "./i18n/i18n.js";
import { initVK } from "./vk.js";

async function startApplication() {
  const lifecycle = createLifecycle();

  let toastTimer = null;
  let destroyed = false;

  const render = createRender();
  const header = createHeader();
  const help = createHelp();
  const appearance = createAppearance();
  const slotManager = createSlotManager();

  const mobileSlots = createMobileSlots({ slotManager });

  const systemPanel = createSystemPanel({
    render,
    slotManager,
    appearance
  });

  const commands = createCommandRegistry({
    slotManager,
    header,
    help
  });

  const inputRouter = createInputRouter({ slotManager });

  const slotA = createSlot("A", slotManager);
  const slotB = createSlot("B", slotManager);

  function showToast({ message } = {}) {
    const toast = document.getElementById("toast");

    if (!toast || destroyed || !message) {
      return;
    }

    clearTimeout(toastTimer);

    toast.textContent = String(message);
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  function destroy() {
    if (destroyed) {
      return;
    }

    destroyed = true;

    clearTimeout(toastTimer);

    lifecycle.destroy();

    const components = [
      commands,
      systemPanel,
      appearance,
      header,
      help,
      mobileSlots,
      slotA,
      slotB,
      slotManager,
      render
    ];

    for (const component of components) {
      try {
        component.destroy?.();
      } catch (error) {
        console.error("Application cleanup failed:", error);
      }
    }
  }

  lifecycle.add(on("feedback:show", showToast));

  lifecycle.listen(window, "pagehide", event => {
    if (!event.persisted) {
      destroy();
    }
  });

  try {
    await render.init();

    appearance.init();
    help.init();
    header.init();
    systemPanel.init();

    await Promise.all([
      slotA.init(),
      slotB.init()
    ]);

    mobileSlots.init();

    await slotManager.init();

    lifecycle.listen(document, "keydown", event => {
      try {
        if (commands.handle(event)) {
          event.preventDefault();
          return;
        }

        const response = inputRouter.handleKeydown(event);

        if (response?.status === "accepted") {
          event.preventDefault();
          return;
        }

        if (response?.status === "error") {
          event.preventDefault();

          emit("feedback:show", {
            message: response.reason || t("app.actionError")
          });
        }
      } catch (error) {
        console.error("Keyboard processing failed:", error);

        emit("feedback:show", {
          message: t("app.actionError")
        });
      }
    });

    void initVK().catch(error => {
      console.warn("VK initialization failed:", error);
    });

    document.body.dataset.appState = "ready";
  } catch (error) {
    console.error("Application initialization failed:", error);

    destroy();

    document.body.dataset.appState = "error";

    const toast = document.getElementById("toast");

    if (toast) {
      toast.textContent = t("app.startError");
      toast.classList.add("show");
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    () => {
      void startApplication();
    },
    { once: true }
  );
} else {
  void startApplication();
}