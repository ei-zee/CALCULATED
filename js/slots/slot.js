import { emit, on } from "../core/eventBus.js";
import { createLifecycle } from "../ui/lifecycle.js";
import { t } from "../i18n/i18n.js";

import {
  ensureRegistry,
  getCategories,
  getCalculators,
  getCategoryTitle,
  getCalculatorTitle,
  getCalculator
} from "../registry.js";


export function createSlot(slotId, slotManager) {
  const lifecycle = createLifecycle();

  let initialized = false;
  let pendingInit = null;

  let root = null;
  let categorySelect = null;
  let calculatorSelect = null;


  function feedback(key) {
    emit("feedback:show", {
      message: t(key)
    });
  }


  function option(value, text) {
    const element = document.createElement("option");
    element.value = value;
    element.textContent = text;

    return element;
  }


  function fillCalculators(calculatorId = null) {
    const available = getCalculators(categorySelect.value);

    calculatorSelect.replaceChildren(
      option("", t("slot.selectCalculator")),
      ...available.map(id =>
        option(id, getCalculatorTitle(id))
      )
    );

    calculatorSelect.value =
      calculatorId && available.includes(calculatorId)
        ? calculatorId
        : "";
  }


  function syncControls({ rebuildCategories = false } = {}) {
    const calculatorId = slotManager.getSlotCalculatorId(slotId);
    const calculator = calculatorId
      ? getCalculator(calculatorId)
      : null;

    const previousCategory = categorySelect.value;

    if (rebuildCategories) {
      categorySelect.replaceChildren(
        ...getCategories().map(category =>
          option(category.id, getCategoryTitle(category.id))
        )
      );
    }

    const categoryId =
      calculator?.category ??
      previousCategory ??
      getCategories()[0]?.id;

    if (getCategories().some(item => item.id === categoryId)) {
      categorySelect.value = categoryId;
    }

    fillCalculators(calculatorId);

    categorySelect.setAttribute(
      "aria-label",
      t("slot.categoryLabel", { slot: slotId })
    );

    calculatorSelect.setAttribute(
      "aria-label",
      t("slot.calculatorLabel", { slot: slotId })
    );
  }


  async function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    const previousFocus = document.activeElement;

    textarea.value = text;
    textarea.readOnly = true;
    textarea.tabIndex = -1;

    Object.assign(textarea.style, {
      position: "fixed",
      left: "-9999px",
      top: "0",
      opacity: "0"
    });

    document.body.append(textarea);

    try {
      textarea.focus({ preventScroll: true });
      textarea.select();
      textarea.setSelectionRange(0, text.length);

      return document.execCommand("copy");
    } finally {
      textarea.remove();

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus({ preventScroll: true });
      }
    }
  }


  async function copyResult() {
    const value = slotManager.getResult(slotId);

    if (value === "" || value === null || value === undefined) {
      feedback("toast.noResult");
      return;
    }

    const text = String(value);
    let success = false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        success = true;
      } catch {
        success = false;
      }
    }

    if (!success) {
      try {
        success = await fallbackCopy(text);
      } catch {
        success = false;
      }
    }

    feedback(success ? "toast.copied" : "toast.copyFailed");
  }


  async function initialize() {
    await ensureRegistry();

    if (lifecycle.destroyed || initialized) {
      return;
    }

    root = document.getElementById(`slot${slotId}`);
    categorySelect = document.getElementById(`category${slotId}`);
    calculatorSelect = document.getElementById(`calculator${slotId}`);

    const copyButton = document.getElementById(`copy${slotId}`);
    const transferButton = document.getElementById(`transfer${slotId}`);

    if (
      !root ||
      !categorySelect ||
      !calculatorSelect ||
      !copyButton ||
      !transferButton
    ) {
      throw new Error(`Missing slot elements: ${slotId}`);
    }

    initialized = true;

    categorySelect.classList.add("ui-select");

    calculatorSelect.classList.add("ui-select");

    syncControls({ rebuildCategories: true });

    const activate = () => slotManager.setActive(slotId);

    lifecycle.listen(root, "click", activate);
    lifecycle.listen(root, "focusin", activate);

    lifecycle.listen(categorySelect, "change", () => {
      activate();

      // Смена категории только меняет список.
      // Открытый модуль остаётся до выбора другого модуля.
      fillCalculators(
        slotManager.getSlotCalculatorId(slotId)
      );
    });

    lifecycle.listen(calculatorSelect, "change", () => {
      activate();

      slotManager.selectCalculator(
        slotId,
        calculatorSelect.value || null
      ).catch(console.error);
    });

    lifecycle.listen(copyButton, "click", () => {
      activate();
      copyResult().catch(console.error);
    });

    lifecycle.listen(transferButton, "click", () => {
      activate();
      slotManager.transferResult().catch(console.error);
    });

    lifecycle.add(on("slot:changed", payload => {
      if (payload.slotId === slotId && !payload.loading) {
        syncControls();
      }
    }));

    lifecycle.add(on("language:changed", () => {
      syncControls({ rebuildCategories: true });
    }));
  }


  function init() {
    if (!pendingInit) {
      pendingInit = initialize().catch(error => {
        pendingInit = null;
        throw error;
      });
    }

    return pendingInit;
  }


  return {
    init,
    copyResult,

    destroy() {
      lifecycle.destroy();
    }
  };
}