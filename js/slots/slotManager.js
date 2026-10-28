import { emit, on } from "../core/eventBus.js";
import { get, set } from "../core/storage.js";
import { APP_CONFIG } from "../config.js";
import { t, getLanguage } from "../i18n/i18n.js";
import { createCalculatorLoader } from "../calculators/calculatorLoader.js";

import {
  ensureRegistry,
  getCalculator
} from "../registry.js";


export function createSlotManager() {
  const loader = createCalculatorLoader();
  const subscriptions = [];

  let initialized = false;
  let disposed = false;
  let operationBusy = false;

  const state = {
    activeSlotId: "A",
    history: [],
    slots: {
      A: createSlotState(),
      B: createSlotState()
    }
  };

  function createSlotState() {
    return {
      calculatorId: null,
      loaded: null,
      result: "",
      loading: false,
      request: 0,
      contextToken: null
    };
  }

  function slotOf(id) {
    const slot = state.slots[id];

    if (!slot) {
      throw new Error(`Unknown slot: ${id}`);
    }

    return slot;
  }

  function feedback(key, variables = {}) {
    emit("feedback:show", {
      message: t(key, variables)
    });
  }

  function isEmpty(value) {
    return value === "" || value === null || value === undefined;
  }

  function clone(value) {
    return value === undefined ? undefined : structuredClone(value);
  }

  function displayValue(value) {
    return isEmpty(value) ? "—" : String(value);
  }

  function notify(slotId) {
    const slot = slotOf(slotId);

    emit("slot:changed", {
      slotId,
      calculatorId: slot.calculatorId,
      loading: slot.loading,
      result: slot.result
    });
  }

  function setResult(slotId, value) {
    const slot = slotOf(slotId);

    if (
      !isEmpty(value) &&
      typeof value !== "number" &&
      typeof value !== "string"
    ) {
      throw new TypeError(
        "Slot result must be a number, string or empty value"
      );
    }

    slot.result = typeof value === "number" && !Number.isFinite(value)
      ? ""
      : value ?? "";

    const element = document.getElementById(`result${slotId}`);

    if (element) {
      element.textContent = displayValue(slot.result);
    }

    emit("slot:resultChanged", {
      slotId,
      result: slot.result
    });
  }

  function setActive(slotId) {
    if (!state.slots[slotId] || state.activeSlotId === slotId) {
      return;
    }

    state.activeSlotId = slotId;
    emit("activeSlot:changed", { slotId });
  }

  function saveLayout() {
    set("layout", {
      A: state.slots.A.calculatorId,
      B: state.slots.B.calculatorId
    });
  }

  function pushHistory(record) {
    state.history.push(record);

    if (state.history.length > APP_CONFIG.historyLimit) {
      state.history.shift();
    }
  }

  function snapshot(slotId) {
    const slot = slotOf(slotId);
    const instance = slot.loaded?.instance;

    return {
      calculatorId: slot.calculatorId,
      result: clone(slot.result),
      calculatorState:
        typeof instance?.getState === "function"
          ? clone(instance.getState())
          : null
    };
  }

  function updatePresentation(slotId) {
    const slot = slotOf(slotId);
    const root = document.getElementById(`slot${slotId}`);
    const panel = document.getElementById(`resultPanel${slotId}`);

    const meta = slot.loaded?.meta ?? {};
    const instance = slot.loaded?.instance;

    if (root) {
      root.dataset.type = meta.type ?? instance?.type ?? "empty";
      root.setAttribute("aria-busy", String(slot.loading));
    }

    if (panel) {
      panel.hidden = meta.resultPanel === false;
    }
  }

  function placeholder(slotId, error = false) {
    const mount = document.getElementById(`mount${slotId}`);

    if (!mount) {
      return;
    }

    const block = document.createElement("div");
    block.className = "mount-placeholder";

    const icon = document.createElement("div");
    icon.className = "mount-icon";
    icon.textContent = error ? "⚠" : "＋";

    const title = document.createElement("div");
    title.className = "mount-title";
    title.textContent = t(
      error ? "slot.loadErrorTitle" : "slot.emptyTitle"
    );

    const text = document.createElement("div");
    text.className = "mount-text";
    text.textContent = t(
      error ? "slot.loadErrorText" : "slot.emptyText"
    );

    block.append(icon, title, text);
    mount.replaceChildren(block);
  }

  async function selectCalculator(slotId, calculatorId, options = {}) {
    const slot = slotOf(slotId);
     

    if (disposed || (operationBusy && !options.internal)) {
      return false;
    }

    const id = calculatorId || null;

    if (
      !options.force &&
      !slot.loading &&
      slot.calculatorId === id
    ) {
      return true;
    }

    const previous = snapshot(slotId);
    const request = ++slot.request;

    if (id === null) {
      slot.contextToken = null;

      loader.unload(slot.loaded);

      slot.loaded = null;
      slot.calculatorId = null;
      slot.loading = false;

      setResult(slotId, "");
      placeholder(slotId);
      updatePresentation(slotId);

      if (!options.skipHistory) {
        pushHistory({
          type: "calculator",
          slotId,
          previous
        });
      }

      saveLayout();
      notify(slotId);

      return true;
    }

    slot.loading = true;
    updatePresentation(slotId);
    notify(slotId);

    let candidate = null;
    let candidateResult = "";
    const token = {};

    try {
      candidate = await loader.load(slotId, id, {
        emit,

        setResult(value) {
          candidateResult = value;

          if (slot.contextToken === token && !disposed) {
            setResult(slotId, value);
          }
        },

        getResult() {
          return slot.contextToken === token
            ? slot.result
            : candidateResult;
        }
      });

      if (disposed || request !== slot.request) {
        loader.unload(candidate);
        return false;
      }

      if (
        options.snapshot &&
        options.snapshot.calculatorState !== null
      ) {
        if (typeof candidate.instance.setState !== "function") {
          throw new Error("Calculator cannot restore state");
        }

        await candidate.instance.setState(
          clone(options.snapshot.calculatorState)
        );
      }

      const mount = document.getElementById(`mount${slotId}`);

      if (!mount) {
        throw new Error(`Missing mount: ${slotId}`);
      }

      const old = slot.loaded;

      slot.contextToken = null;
      loader.unload(old);

      slot.loaded = candidate;
      slot.calculatorId = id;
      slot.contextToken = token;
      slot.loading = false;

      mount.replaceChildren(candidate.element);

      setResult(slotId, candidateResult);
      updatePresentation(slotId);

      if (!options.skipHistory) {
        pushHistory({
          type: "calculator",
          slotId,
          previous
        });
      }

      saveLayout();
      notify(slotId);

      return true;
    } catch (error) {
      loader.unload(candidate);

      if (disposed || request !== slot.request) {
        return false;
      }

      console.error(error);

      slot.loading = false;

      if (!slot.loaded) {
        slot.calculatorId = null;
        setResult(slotId, "");
        placeholder(slotId, true);
      } else {
        feedback("slot.loadErrorText");
      }

      updatePresentation(slotId);
      notify(slotId);

      return false;
    }
  }

  function transferValueIsEmpty(value) {
    if (isEmpty(value)) {
      return true;
    }

    if (typeof value === "object") {
      return !Object.hasOwn(value, "value") || isEmpty(value.value);
    }

    return false;
  }

  async function restoreSnapshot(slotId, previous) {
    if (!previous.calculatorId) {
      return selectCalculator(slotId, null, {
        internal: true,
        skipHistory: true
      });
    }

    return selectCalculator(slotId, previous.calculatorId, {
      force: true,
      internal: true,
      skipHistory: true,
      snapshot: previous
    });
  }

  async function transferResult() {
    if (disposed || operationBusy) {
      return;
    }

    const from = state.activeSlotId;
    const to = from === "A" ? "B" : "A";

    const sourceSlot = slotOf(from);
    const targetSlot = slotOf(to);

    if (sourceSlot.loading || targetSlot.loading) {
      return;
    }

    const source = sourceSlot.loaded?.instance;
    const target = targetSlot.loaded?.instance;

    if (!target) {
      feedback("toast.noCalculator");
      return;
    }

    if (
      typeof target.receiveTransferValue !== "function" ||
      typeof target.getState !== "function" ||
      typeof target.setState !== "function"
    ) {
      feedback("toast.notAccepted");
      return;
    }

    operationBusy = true;

    let previous = null;
    let attempted = false;

    try {
      // Если метод есть, null означает отсутствие результата.
      // Не подменяем его сохранённым старым значением.
      const value = typeof source?.getTransferValue === "function"
        ? source.getTransferValue()
        : sourceSlot.result;

      if (transferValueIsEmpty(value)) {
        feedback("toast.noResult");
        return;
      }

      const scalar = typeof value === "object" ? value.value : value;

      if (
        typeof scalar === "number" &&
        !Number.isFinite(scalar)
      ) {
        feedback("toast.noResult");
        return;
      }

      previous = snapshot(to);
      attempted = true;

      const response = await target.receiveTransferValue(clone(value));

      if (response?.status !== "accepted") {
        await target.setState(clone(previous.calculatorState));
        setResult(to, previous.result);

        feedback("toast.notAccepted");
        return;
      }

      pushHistory({
        type: "transfer",
        slotId: to,
        previous
      });

      notify(to);
      feedback("toast.transfer", { slot: to });
    } catch (error) {
      console.error(error);

      if (attempted && previous) {
        try {
          await target.setState(clone(previous.calculatorState));
          setResult(to, previous.result);
        } catch (restoreError) {
          console.error(restoreError);

          const restored = await restoreSnapshot(to, previous);

          if (!restored) {
            feedback("toast.undoFailed");
          }
        }
      }

      feedback("toast.transferFailed");
    } finally {
      operationBusy = false;
    }
  }

  async function undo() {
    if (
      disposed ||
      operationBusy ||
      Object.values(state.slots).some(slot => slot.loading)
    ) {
      return;
    }

    const record = state.history.at(-1);

    if (!record) {
      feedback("toast.nothingToUndo");
      return;
    }

    operationBusy = true;

    try {
      const restored = await restoreSnapshot(
        record.slotId,
        record.previous
      );

      if (!restored) {
        feedback("toast.undoFailed");
        return;
      }

      // Удаляем запись только после успешного восстановления.
      state.history.pop();

      setActive(record.slotId);
      feedback("toast.transferUndone");
    } catch (error) {
      console.error(error);
      feedback("toast.undoFailed");
    } finally {
      operationBusy = false;
    }
  }

  async function refreshLanguage() {
    if (disposed || operationBusy) {
      return;
    }
        console.log("[refreshLanguage]", getLanguage());

    for (const slotId of ["A", "B"]) {
      const slot = slotOf(slotId);

      if (slot.loading) {
        continue;
      }

      if (!slot.loaded) {
        placeholder(slotId);
        continue;
      }

      // Для модулей с полным состоянием обновляем также
      // строки, созданные вручную, а не только UI Kit.
      if (
        typeof slot.loaded.instance.getState === "function" &&
        typeof slot.loaded.instance.setState === "function"
      ) {
        const previous = snapshot(slotId);

        await selectCalculator(slotId, slot.calculatorId, {
          force: true,
          skipHistory: true,
          snapshot: previous
        });
      }
    }
  }

  async function init() {
    if (initialized) {
      return;
    }

    initialized = true;
    disposed = false;

    subscriptions.push(
      on("activeSlot:request", ({ slotId }) => setActive(slotId)),

      on("language:changed", () => {
        refreshLanguage().catch(console.error);
      })
    );

    await ensureRegistry();

    for (const slotId of ["A", "B"]) {
      placeholder(slotId);
      updatePresentation(slotId);
    }

    emit("activeSlot:changed", {
      slotId: state.activeSlotId
    });

    const layout = get("layout", {});

    await Promise.all(
      ["A", "B"].map(slotId => {
        const id = layout?.[slotId];

        return id && getCalculator(id)
          ? selectCalculator(slotId, id, { skipHistory: true })
          : Promise.resolve();
      })
    );
  }

  function destroy() {
    if (disposed) {
      return;
    }

    disposed = true;
    initialized = false;

    subscriptions.splice(0).forEach(unsubscribe => unsubscribe());

    for (const slot of Object.values(state.slots)) {
      slot.request++;
      slot.contextToken = null;

      loader.unload(slot.loaded);

      slot.loaded = null;
      slot.calculatorId = null;
      slot.result = "";
      slot.loading = false;
    }

    state.history.length = 0;
  }

  return {
    init,
    destroy,
    setActive,

    switchSlots() {
      setActive(state.activeSlotId === "A" ? "B" : "A");
    },

    selectCalculator,
    transferResult,
    undo,
    setResult,

    getResult(slotId) {
      return slotOf(slotId).result;
    },

    getSlotCalculatorId(slotId) {
      return slotOf(slotId).calculatorId;
    },

    getActiveCalculator() {
      const slot = slotOf(state.activeSlotId);

      return slot.loading ? null : slot.loaded?.instance ?? null;
    },

    getActiveSlotId() {
      return state.activeSlotId;
    }
  };
}