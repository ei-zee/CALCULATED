import {
  RATE_SOURCES,
  getSourceById
} from "./sources/index.js";

import { getRates } from "./sources/rates-cache.js";
import { formatCurrencyOption } from "./currency-format.js";
import { get, set } from "../../../core/storage.js";


const SOURCE_STORAGE_KEY = "currency-source";

const CRYPTO_CODES = new Set([
  "BTC", "ETH", "USDT", "USDC", "SOL", "BNB"
]);


export default function createCurrencyCalculator(container, context) {
  const { t, ui, lifecycle } = context;

  const savedSourceId = get(SOURCE_STORAGE_KEY);

  let currentSource = getSourceById(
    savedSourceId || RATE_SOURCES[0].id
  ) ?? RATE_SOURCES[0];

  let ratesData = null;
  let loadToken = 0;

  let amount = "";
  let lastResult = null;

  let previewElement = null;
  let crossRateElement = null;
  let fromRubElement = null;
  let toRubElement = null;
  let sourceInfoElement = null;
  let helpButton = null;

  let from = null;
  let to = null;
  let sourceSelect = null;
  let amountInput = null;


  function isCrypto(code) {
    return CRYPTO_CODES.has(code);
  }


  function parseAmount(value) {
    const normalized = String(value ?? "")
      .trim()
      .replace(",", ".");

    if (!normalized) {
      return NaN;
    }

    return Number(normalized);
  }


  function roundMoney(value, code) {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Number(value.toFixed(isCrypto(code) ? 8 : 2));
  }


  function formatMoney(value, code) {
    if (!Number.isFinite(value)) {
      return "—";
    }

    return value.toLocaleString(context.language, {
      minimumFractionDigits: 0,
      maximumFractionDigits: isCrypto(code) ? 8 : 2
    });
  }


  function formatRub(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }

    return value.toLocaleString(context.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }


  function getRubRate(code) {
    const rate = ratesData?.rates?.[code];
    const rubRate = ratesData?.rates?.RUB;

    if (
      !Number.isFinite(rate) ||
      !Number.isFinite(rubRate) ||
      rubRate === 0
    ) {
      return null;
    }

    return rate / rubRate;
  }


  function publish(value) {
    lastResult = Number.isFinite(value) ? value : null;

    context.setResult(lastResult ?? "");
  }


  function updatePreview(value = null) {
    if (!previewElement) {
      return;
    }

    previewElement.textContent = value === null
      ? ""
      : `= ${formatMoney(value, to.value)} ${to.value}`;
  }


  function calculate() {
    if (lifecycle.destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }

    if (!ratesData || !from.value || !to.value) {
      publish(null);
      updatePreview();

      return { status: "ignored", reason: "no-rates" };
    }

    const amountValue = parseAmount(amount);

    if (!Number.isFinite(amountValue)) {
      publish(null);
      updatePreview();

      return { status: "ignored", reason: "empty-amount" };
    }

    const fromRate = ratesData.rates[from.value];
    const toRate = ratesData.rates[to.value];

    if (!fromRate || !toRate) {
      publish(null);
      updatePreview();

      return { status: "ignored", reason: "currency-not-supported" };
    }

    const result = roundMoney(
      amountValue * fromRate / toRate,
      to.value
    );

    publish(result);
    updatePreview(result);

    return { status: "accepted", value: result };
  }


  function updateRateInfo() {
    if (!ratesData || !from.value || !to.value) {
      crossRateElement.textContent = "";
      fromRubElement.textContent = "";
      toRubElement.textContent = "";
      sourceInfoElement.textContent = "";

      updateHelpText();
      return;
    }

    const fromRate = ratesData.rates[from.value];
    const toRate = ratesData.rates[to.value];

    if (fromRate && toRate) {
      const crossRate = roundMoney(fromRate / toRate, to.value);

      crossRateElement.textContent =
        `1 ${from.value} = ${formatMoney(crossRate, to.value)} ${to.value}`;
    } else {
      crossRateElement.textContent = "";
    }

    const rubPrefix = ratesData.kind === "market" ? "≈ " : "";
    const fromRub = getRubRate(from.value);
    const toRub = getRubRate(to.value);

    fromRubElement.textContent =
      from.value === "RUB" || fromRub === null
        ? ""
        : `${rubPrefix}1 ${from.value} = ${formatRub(fromRub)} ₽`;

    toRubElement.textContent =
      to.value === "RUB" || toRub === null
        ? ""
        : `${rubPrefix}1 ${to.value} = ${formatRub(toRub)} ₽`;

    updateSourceInfo();
  }


  function updateSourceInfo() {
    if (!ratesData) {
      sourceInfoElement.textContent = "";
      updateHelpText();
      return;
    }

    const date = new Date(ratesData.updatedAt);
    const sourceName = currentSource.label.split("·")[0].trim();

    if (!Number.isFinite(date.getTime())) {
      sourceInfoElement.textContent = sourceName;
      updateHelpText();
      return;
    }

    sourceInfoElement.textContent =
      ratesData.kind === "official"
        ? `${sourceName} · ${t("currency.rateDate")} ${date.toLocaleDateString(context.language)}`
        : `${sourceName} · ${t("currency.marketRatesNotice")} · ${date.toLocaleTimeString(context.language)}`;

    updateHelpText();
  }


  function updateHelpText() {
    if (!helpButton) {
      return;
    }

    helpButton.setAttribute(
      "aria-label",
      t("currency.help.title")
    );

    helpButton.title = ratesData?.kind === "market"
      ? t("currency.help.market")
      : t("currency.help.official");
  }


  function buildCurrencyOption(code) {
    const option = document.createElement("option");

    option.value = code;
    option.textContent = formatCurrencyOption(code);

    return option;
  }


  function fillCurrencies() {
    const codes = Object.keys(ratesData.rates);

    from.replaceChildren();
    to.replaceChildren();

    if (ratesData.kind === "market") {
      const referenceCodes = ["USD", "EUR", "RUB"]
        .filter(code => ratesData.rates[code]);

      const cryptoCodes = codes
        .filter(code => !referenceCodes.includes(code))
        .sort((a, b) => a.localeCompare(b));

      const referenceGroup = document.createElement("optgroup");
      const cryptoGroup = document.createElement("optgroup");

      referenceGroup.label = t("currency.referenceCurrencies");
      cryptoGroup.label = t("currency.cryptoCurrencies");

      referenceCodes.forEach(code => {
        referenceGroup.append(buildCurrencyOption(code));
      });

      cryptoCodes.forEach(code => {
        cryptoGroup.append(buildCurrencyOption(code));
      });

      from.append(referenceGroup, cryptoGroup);
      to.append(referenceGroup.cloneNode(true), cryptoGroup.cloneNode(true));
    } else {
      const sortedCodes = codes.sort((a, b) => {
        if (a === ratesData.base) return -1;
        if (b === ratesData.base) return 1;

        return a.localeCompare(b);
      });

      sortedCodes.forEach(code => {
        from.append(buildCurrencyOption(code));
        to.append(buildCurrencyOption(code));
      });
    }

    from.value = ratesData.base === "RUB" ? "USD" : ratesData.base;
    to.value = "RUB";

    updateRateInfo();
    calculate();
  }


  function fillSources() {
    sourceSelect.replaceChildren();

    RATE_SOURCES.forEach(source => {
      const option = document.createElement("option");

      option.value = source.id;
      option.textContent = source.label;

      sourceSelect.append(option);
    });

    sourceSelect.value = currentSource.id;
  }


  function showLoading() {
    crossRateElement.textContent = t("currency.loading");
    fromRubElement.textContent = "";
    toRubElement.textContent = "";
    sourceInfoElement.textContent = "";
  }


  function showUnavailable(error) {
    console.error(error);

    crossRateElement.textContent = t("currency.unavailable");
    fromRubElement.textContent = "";
    toRubElement.textContent = "";
    sourceInfoElement.textContent = "";
  }


  async function loadRates() {
    const token = ++loadToken;

    showLoading();

    try {
      const data = await getRates(currentSource);

      if (
        lifecycle.destroyed ||
        token !== loadToken
      ) {
        return;
      }

      ratesData = data;
      fillCurrencies();
    } catch (error) {
      if (
        lifecycle.destroyed ||
        token !== loadToken
      ) {
        return;
      }

      ratesData = null;
      showUnavailable(error);
    }
  }


  async function changeSource(sourceId) {
    const nextSource = getSourceById(sourceId);

    if (
      !nextSource ||
      nextSource.id === currentSource.id
    ) {
      return;
    }

    currentSource = nextSource;

    set(SOURCE_STORAGE_KEY, currentSource.id);

    ratesData = null;

    await loadRates();
  }


  function swapCurrencies() {
    const previousFrom = from.value;

    from.value = to.value;
    to.value = previousFrom;

    updateRateInfo();
    calculate();
  }


  function insert(value) {
    if (value === "," && amount.includes(",")) {
      return { status: "ignored", reason: "decimal-exists" };
    }

    amount += value;

    amountInput?.setValue(amount);
    calculate();

    return { status: "accepted" };
  }


  function backspace() {
    amount = amount.slice(0, -1);

    amountInput?.setValue(amount);
    calculate();

    return { status: "accepted" };
  }


  function clearAmount() {
    amount = "";

    amountInput?.setValue(amount);
    calculate();

    return { status: "accepted" };
  }


  function receiveInput(event) {
    if (lifecycle.destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }

    const key = event.key ?? event.value;

    if (!key) {
      return { status: "ignored", reason: "empty-input" };
    }

    if (event.source === "transfer") {
      return receiveTransferValue(key);
    }

    if (/^[0-9]$/.test(key)) {
      return insert(key);
    }

    if (key === "." || key === ",") {
      return insert(",");
    }

    if (key === "Backspace") {
      return backspace();
    }

    if (key === "Delete") {
      return clearAmount();
    }

    if (key === "Enter") {
      return calculate();
    }

    return { status: "ignored", reason: "unsupported-input" };
  }


  function receiveTransferValue(value) {
    if (lifecycle.destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }

    if (value === null || value === undefined || value === "") {
      return { status: "ignored", reason: "empty-value" };
    }

    const normalized = String(value).replace(",", ".");

    if (!/^-?\d*\.?\d*$/.test(normalized)) {
      return { status: "ignored", reason: "invalid-number" };
    }

    amount = normalized.replace(".", ",");

    amountInput?.setValue(amount);
    calculate();

    return { status: "accepted" };
  }


  function getState() {
    return {
      amount,
      from: from.value,
      to: to.value,
      sourceId: currentSource.id
    };
  }


  function setState(state) {
    if (lifecycle.destroyed || !state) {
      return;
    }

    amount = String(state.amount ?? "");
    amountInput?.setValue(amount);

    if (
      state.sourceId &&
      state.sourceId !== currentSource.id
    ) {
      currentSource = getSourceById(state.sourceId) ?? currentSource;
      sourceSelect.value = currentSource.id;

      void loadRates().then(() => {
        if (lifecycle.destroyed) {
          return;
        }

        if (state.from) from.value = state.from;
        if (state.to) to.value = state.to;

        updateRateInfo();
        calculate();
      });

      return;
    }

    if (state.from) from.value = state.from;
    if (state.to) to.value = state.to;

    updateRateInfo();
    calculate();
  }


  function receiveAction(action) {
    if (lifecycle.destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }

    if (action === "clear") return clearAmount();
    if (action === "backspace") return backspace();
    if (action === "swap") return swapCurrencies();
    if (action === "calculate") return calculate();

    return { status: "ignored", reason: "unknown-action" };
  }


  function destroy() {
    lifecycle.destroy();
    container.replaceChildren();
  }


  container.replaceChildren();

  container.innerHTML = `
    <div class="currency">
      <div class="ui-display ui-display--compact currency__display">
        <div class="ui-display__top">
          <div class="ui-display__title">
            ${t("currency.amount")}
          </div>
        </div>

        <div class="ui-display__value currency__amount"></div>

        <div
          class="ui-display__preview currency__preview"
          aria-live="polite"
        ></div>
      </div>

      <div class="ui-note currency__cross">
        <span class="ui-note__icon" aria-hidden="true">⇄</span>
        <span class="ui-note__text currency__cross-text"></span>
      </div>

      <div class="currency__currencies">
        <div class="currency__field">
          <select class="ui-select currency__select" aria-label="${t("currency.from")}"></select>

          <div class="currency__field-info">
            <span class="currency__field-label">${t("currency.from")}</span>
            <span class="currency__rub currency__rub-from"></span>
          </div>
        </div>

        <button
          class="ui-button ui-button--icon currency__swap"
          data-action="swap"
          type="button"
          title="${t("currency.swap")}"
          aria-label="${t("currency.swap")}"
        >⇄</button>

        <div class="currency__field">
          <select class="ui-select currency__select" aria-label="${t("currency.to")}"></select>

          <div class="currency__field-info">
            <span class="currency__field-label">${t("currency.to")}</span>
            <span class="currency__rub currency__rub-to"></span>
          </div>
        </div>
      </div>

      <div class="currency__footer">
        <div class="currency__source">
          <select class="ui-select ui-select--compact currency__source-select" aria-label="${t("currency.help.title")}"></select>

          <button
            class="ui-button ui-button--icon ui-button--small currency__help"
            type="button"
            aria-label="${t("currency.help.title")}"
          >?</button>
        </div>

        <div class="currency__source-info"></div>
      </div>
    </div>
  `;

  previewElement = container.querySelector(".currency__preview");
  crossRateElement = container.querySelector(".currency__cross-text");
  fromRubElement = container.querySelector(".currency__rub-from");
  toRubElement = container.querySelector(".currency__rub-to");
  sourceInfoElement = container.querySelector(".currency__source-info");
  helpButton = container.querySelector(".currency__help");

  sourceSelect = container.querySelector(".currency__source-select");
  from = container.querySelector(".currency__currencies .currency__select");
  to = container.querySelectorAll(".currency__select")[1];

  amountInput = lifecycle.own(ui.number({
    value: amount,
    label: t("currency.amount"),
    placeholder: "100",
    onChange(value) {
      amount = value;
      calculate();
    }
  }));

  container.querySelector(".currency__amount")
    .append(amountInput.element);

  lifecycle.listen(sourceSelect, "change", event => {
    changeSource(event.target.value)
      .catch(showUnavailable);
  });

  lifecycle.listen(from, "change", () => {
    updateRateInfo();
    calculate();
  });

  lifecycle.listen(to, "change", () => {
    updateRateInfo();
    calculate();
  });

  lifecycle.listen(
    container.querySelector("[data-action='swap']"),
    "click",
    swapCurrencies
  );

  fillSources();
  void loadRates();

  return {
    type: "form",
    keyboardEnabled: true,

    receiveInput,
    receiveTransferValue,
    getState,
    setState,
    receiveAction,

    getResult: () => lastResult,
    getTransferValue: () => lastResult,

    destroy
  };
}