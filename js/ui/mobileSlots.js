import { on } from "../core/eventBus.js";
import { APP_CONFIG } from "../config.js";
import { t } from "../i18n/i18n.js";
import { getCalculatorTitle } from "../registry.js";
import { createLifecycle } from "./lifecycle.js";


export function createMobileSlots({ slotManager }) {
  const lifecycle = createLifecycle();

  const media = window.matchMedia(
    `(max-width: ${APP_CONFIG.mobileBreakpoint}px)`
  );

  const slots = new Map();

  let initialized = false;
  let accordionEnabled = false;


  function refreshSummary(slotId) {
    const slot = slots.get(slotId);

    if (!slot) {
      return;
    }

    const calculatorId =
      slotManager.getSlotCalculatorId(slotId);

    const result = slotManager.getResult(slotId);

    const title = calculatorId
      ? getCalculatorTitle(calculatorId)
      : t("slot.selectCalculator");

    const text =
      result === "" || result === null || result === undefined
        ? "—"
        : String(result);

    slot.title.textContent = title;
    slot.result.textContent = text;

    const accessibleLabel = t("slot.summaryLabel", {
      slot: slotId,
      title,
      result: text
    });

    slot.summary.title = accessibleLabel;
    slot.summary.setAttribute("aria-label", accessibleLabel);
  }


  function applyState() {
    if (lifecycle.destroyed) {
      return;
    }

    const wasEnabled = accordionEnabled;

    accordionEnabled =
      media.matches &&
      document.body.dataset.screen === "fullscreen";

    const activeSlotId = slotManager.getActiveSlotId();

    document.body.classList.toggle(
      "mobile-slots",
      accordionEnabled
    );

    if (accordionEnabled) {
      document.body.dataset.mobileActive = activeSlotId;
    } else {
      delete document.body.dataset.mobileActive;
    }

    // Сначала раскрываем активную область.
    // Затем переносим фокус из закрываемого слота.
    for (const [slotId, slot] of slots) {
      const expanded =
        !accordionEnabled || slotId === activeSlotId;

      slot.root.classList.toggle(
        "slot-collapsed",
        accordionEnabled && !expanded
      );

      slot.root.classList.toggle(
        "slot-expanded",
        accordionEnabled && expanded
      );

      slot.body.inert = !expanded;

      if (expanded) {
        slot.body.removeAttribute("aria-hidden");
      } else {
        slot.body.setAttribute("aria-hidden", "true");
      }

      slot.summary.setAttribute(
        "aria-expanded",
        String(expanded)
      );

      slot.arrow.textContent = expanded ? "▾" : "▸";
    }

    for (const [slotId, slot] of slots) {
      const focused = document.activeElement;
      const collapsed =
        accordionEnabled && slotId !== activeSlotId;

      if (collapsed && slot.body.contains(focused)) {
        slots.get(activeSlotId)?.summary.focus({
          preventScroll: true
        });
      }

      if (
        !accordionEnabled &&
        wasEnabled &&
        focused === slot.summary
      ) {
        slot.root.focus({ preventScroll: true });
      }

      refreshSummary(slotId);
    }
  }


  function prepareSlot(slotId) {
    const root = document.getElementById(`slot${slotId}`);

    if (!root) {
      throw new Error(`Missing slot: ${slotId}`);
    }

    const originalTabindex = root.getAttribute("tabindex");

    const body = document.createElement("div");
    body.className = "slot-body";
    body.id = `slotBody${slotId}`;

    while (root.firstChild) {
      body.append(root.firstChild);
    }

    const summary = document.createElement("button");
    summary.type = "button";
    summary.className = "slot-summary";
    summary.id = `slotSummary${slotId}`;
    summary.setAttribute("aria-controls", body.id);

    const badge = document.createElement("span");
    badge.className = "slot-summary-id";
    badge.textContent = slotId;

    const title = document.createElement("span");
    title.className = "slot-summary-title";

    const result = document.createElement("span");
    result.className = "slot-summary-result";

    const arrow = document.createElement("span");
    arrow.className = "slot-summary-arrow";
    arrow.setAttribute("aria-hidden", "true");

    summary.append(badge, title, result, arrow);
    root.append(summary, body);

    if (originalTabindex === null) {
      root.tabIndex = -1;
    }

    slots.set(slotId, {
      root,
      body,
      summary,
      title,
      result,
      arrow,
      originalTabindex
    });

    lifecycle.listen(summary, "click", () => {
      slotManager.setActive(slotId);
      applyState();
    });

    refreshSummary(slotId);
  }


  function init() {
    if (initialized || lifecycle.destroyed) {
      return;
    }

    initialized = true;

    prepareSlot("A");
    prepareSlot("B");

    lifecycle.add(on("activeSlot:changed", applyState));

    lifecycle.add(on("slot:changed", ({ slotId }) => {
      refreshSummary(slotId);
    }));

    lifecycle.add(on("slot:resultChanged", ({ slotId }) => {
      refreshSummary(slotId);
    }));

    lifecycle.add(on("language:changed", () => {
      for (const slotId of slots.keys()) {
        refreshSummary(slotId);
      }
    }));

    lifecycle.listen(media, "change", applyState);

    const observer = new MutationObserver(applyState);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-screen"]
    });

    lifecycle.add(() => observer.disconnect());

    applyState();
  }


  function destroy() {
    if (lifecycle.destroyed) {
      return;
    }

    lifecycle.destroy();

    document.body.classList.remove("mobile-slots");
    delete document.body.dataset.mobileActive;

    for (const slot of slots.values()) {
      slot.body.inert = false;
      slot.body.removeAttribute("aria-hidden");

      while (slot.body.firstChild) {
        slot.root.insertBefore(
          slot.body.firstChild,
          slot.summary
        );
      }

      slot.summary.remove();
      slot.body.remove();

      slot.root.classList.remove(
        "slot-collapsed",
        "slot-expanded"
      );

      if (slot.originalTabindex === null) {
        slot.root.removeAttribute("tabindex");
      } else {
        slot.root.setAttribute(
          "tabindex",
          slot.originalTabindex
        );
      }
    }

    slots.clear();
    initialized = false;
  }


  return {
    init,
    destroy
  };
}