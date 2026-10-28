export function createUnitConverter(container, context, config) {
  const {
    groups,
    classes,
    defaultSourceId,
    defaultTargetId,
    allowSourceSelection = false,
    allowNegative = false,
    inputLabel,
    baseLabel,
    roundResult,
    formatNumber,
    formatExactNumber
  } = config;

  const { t, ui, lifecycle } = context;


  function tr(key, vars = {}) {
    const text = t(key, vars);

    return typeof text === "string" ? text : key;
  }


  const units = groups.flatMap(group => group.units);
  const unitsById = new Map(units.map(unit => [unit.id, unit]));


  let amount = "";
  let inputValue = 0;
  let validAmount = false;
  let lastResult = null;


  let sourceUnitId = defaultSourceId;
  let targetUnitId = defaultTargetId;
  let activeGroup = groups[0].id;


  if (
    !unitsById.has(sourceUnitId) ||
    !unitsById.has(targetUnitId)
  ) {
    throw new Error("Source or target unit is missing");
  }


  const root = document.createElement("div");
  root.className = classes.root;


  const display = document.createElement("div");
  display.className = "ui-display ui-display--compact conv-display";


  const displayTop = document.createElement("div");
  displayTop.className = "ui-display__top";


  const displayTitle = document.createElement("div");
  displayTitle.className = "ui-display__title";
  displayTitle.textContent = inputLabel;


  displayTop.append(displayTitle);


  let sourceElement = null;


  if (allowSourceSelection) {
    const sourceWrap = document.createElement("label");
    sourceWrap.className = "conv-unit-chip";


    sourceElement = document.createElement("select");
    sourceElement.className = "ui-select ui-select--compact";
    sourceElement.setAttribute("aria-label", inputLabel);
    sourceElement.title = inputLabel;


    groups.forEach(group => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.title;


      group.units.forEach(unit => {
        const option = document.createElement("option");


        option.value = unit.id;
        option.textContent = unit.short;


        optgroup.append(option);
      });


      sourceElement.append(optgroup);
    });


    sourceElement.value = sourceUnitId;


    lifecycle.listen(sourceElement, "change", () => {
      if (!unitsById.has(sourceElement.value)) {
        return;
      }


      sourceUnitId = sourceElement.value;
      refresh();
    });


    sourceWrap.append(sourceElement);
    displayTop.append(sourceWrap);
  }


  const displayValue = document.createElement("div");
  displayValue.className = "ui-display__value conv-input-line";


  const expressionElement = document.createElement("div");
  expressionElement.className = "conv-expression";


  displayValue.append(expressionElement);


  const previewElement = document.createElement("div");
  previewElement.className = "ui-display__preview conv-preview";


  display.append(displayTop, displayValue, previewElement);


  const tabs = lifecycle.own(ui.segmented({
    value: activeGroup,
    options: groups.map(group => ({
      value: group.id,
      label: group.title
    })),
    onChange(value) {
      if (!groups.some(group => group.id === value)) {
        return;
      }


      activeGroup = value;
      renderResults();


      listElement.scrollTop = 0;
    }
  }));


  const listElement = document.createElement("div");
  listElement.className = classes.list;


  let detailsElement = null;
  let summaryElement = null;
  let formulaElement = null;
  let noticeElement = null;


  if (classes.details) {
    detailsElement = document.createElement("details");
    detailsElement.className = classes.details;


    summaryElement = document.createElement("summary");
    summaryElement.className = classes.summary;


    formulaElement = document.createElement("div");
    formulaElement.className = classes.formula;


    detailsElement.append(summaryElement, formulaElement);
  } else {
    noticeElement = document.createElement("div");
    noticeElement.className = classes.notice;
    noticeElement.setAttribute("role", "status");
    noticeElement.setAttribute("aria-live", "polite");
  }


  root.append(
    display,
    tabs.element,
    listElement,
    detailsElement ?? noticeElement
  );


  const numberInput = context.createNumberInput({
    element: expressionElement,
    value: amount,
    label: inputLabel,
    allowNegative,


    onChange(nextValue) {
      applyAmount(nextValue);
    }
  });


  function normalize(raw) {
    return String(raw ?? "")
      .trim()
      .replace(/\u2212/g, "-")
      .replace(".", ",");
  }


  function parseAmount(raw) {
    const normalized = String(raw).trim().replace(",", ".");


    return normalized === "" ? NaN : Number(normalized);
  }


  function getSourceUnit() {
    return unitsById.get(sourceUnitId);
  }


  function getTargetUnit() {
    return unitsById.get(targetUnitId);
  }


  function getActiveGroup() {
    return groups.find(group => group.id === activeGroup);
  }


  function convertTo(unit) {
    const source = getSourceUnit();


    if (typeof config.convert === "function") {
      return config.convert(inputValue, source, unit);
    }


    return inputValue * (source.factor / unit.factor);
  }


  function getFormula(unit) {
    if (typeof config.formatFormula === "function") {
      return config.formatFormula({
        value: inputValue,
        valid: validAmount,
        source: getSourceUnit(),
        target: unit
      });
    }


    const source = getSourceUnit();


    const definitions = [
      `1 ${source.short} = ${formatExactNumber(source.factor)} ${baseLabel}`,
      `1 ${unit.short} = ${formatExactNumber(unit.factor)} ${baseLabel}`
    ].join("\n");


    if (!validAmount) {
      return definitions;
    }


    const converted = convertTo(unit);
    const rounded = roundResult(converted);


    if (rounded === null) {
      return `${definitions}\n${tr("converter.outOfRange")}`;
    }


    const sign = rounded === converted ? "=" : "≈";


    return (
      `${definitions}\n` +
      `${formatExactNumber(inputValue)} ${source.short} × ` +
      `(${formatExactNumber(source.factor)} ÷ ` +
      `${formatExactNumber(unit.factor)}) ` +
      `${sign} ${formatNumber(converted)} ${unit.short}`
    );
  }


  function renderResults() {
    const group = getActiveGroup();


    listElement.replaceChildren();


    const items = document.createElement("div");
    items.className = classes.items;


    group.units.forEach(unit => {
      const converted = convertTo(unit);
      const selected = unit.id === targetUnitId;


      const button = document.createElement("button");
      button.type = "button";
      button.className = `${classes.row}${selected ? " selected" : ""}`;
      button.dataset.unit = unit.id;
      button.setAttribute("aria-pressed", String(selected));
      button.title = `${getFormula(unit)}\n${tr("converter.selectTarget")}`;


      const name = document.createElement("span");
      name.className = classes.unit;
      name.textContent = unit.name;


      const value = document.createElement("span");
      value.className = classes.value;
      value.textContent = `${formatNumber(converted)} ${unit.short}`;


      button.append(name, value);
      items.append(button);
    });


    listElement.append(items);
  }


  lifecycle.listen(listElement, "click", event => {
    const row = event.target instanceof Element
      ? event.target.closest("[data-unit]")
      : null;


    if (
      !row ||
      !listElement.contains(row) ||
      !unitsById.has(row.dataset.unit)
    ) {
      return;
    }


    targetUnitId = row.dataset.unit;
    refresh();
  });


  function updateTargetInfo() {
    const source = getSourceUnit();
    const target = getTargetUnit();
    const direction = `${source.short} → ${target.short}`;


    let summary = `${tr("converter.result")}: ${direction}`;


    if (validAmount) {
      const converted = convertTo(target);
      const rounded = roundResult(converted);


      if (rounded === null) {
        summary = `${direction} · ${tr("converter.outOfRange")}`;
      } else {
        const sign = rounded === converted ? "=" : "≈";


        summary =
          `${formatNumber(inputValue)} ${source.short} ` +
          `${sign} ${formatNumber(converted)} ${target.short}`;
      }
    }


    if (detailsElement) {
      summaryElement.textContent =
        `${summary} · ${tr("converter.formula")}`;


      summaryElement.title =
        `${tr("converter.targetUnit")}: ${target.name}`;


      formulaElement.textContent = getFormula(target);
    }


    if (noticeElement) {
      noticeElement.textContent = summary;
      noticeElement.title = getFormula(target);
    }
  }


  function recalculate() {
    const target = getTargetUnit();


    if (!validAmount) {
      lastResult = null;


      previewElement.textContent = "";
      context.setResult("");


      updateTargetInfo();
      return;
    }


    const converted = convertTo(target);
    const rounded = roundResult(converted);


    lastResult = rounded;


    previewElement.textContent = rounded === null
      ? tr("converter.outOfRange")
      : `= ${formatNumber(converted)} ${target.short}`;


    context.setResult(rounded === null ? "" : rounded);
    updateTargetInfo();
  }


  function refresh() {
    if (lifecycle.destroyed) {
      return;
    }


    const parsed = parseAmount(amount);


    validAmount =
      Number.isFinite(parsed) &&
      (allowNegative || parsed >= 0);


    inputValue = validAmount ? parsed : 0;


    numberInput.setValue(amount);


    if (sourceElement) {
      sourceElement.value = sourceUnitId;
    }


    renderResults();
    recalculate();
  }


  function applyAmount(nextAmount) {
    if (lifecycle.destroyed) {
      return { status: "ignored", reason: "destroyed" };
    }


    amount = normalize(nextAmount);
    refresh();


    return { status: "accepted" };
  }


  function insert(text) {
    if (text === "," && /e/i.test(amount)) {
      return {
        status: "ignored",
        reason: "decimal-in-exponent"
      };
    }


    if (text === "," && amount.includes(",")) {
      return {
        status: "ignored",
        reason: "decimal-exists"
      };
    }


    let candidate = amount;


    if (
      text === "," &&
      (candidate === "" || candidate === "-")
    ) {
      candidate += "0";
    }


    candidate += text;


    const parsed = parseAmount(candidate);


    if (
      !Number.isFinite(parsed) ||
      (!allowNegative && parsed < 0)
    ) {
      return {
        status: "ignored",
        reason: "invalid-number"
      };
    }


    return applyAmount(candidate);
  }


  function receiveTransferValue(rawValue) {
    if (lifecycle.destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }


    if (
      rawValue === null ||
      rawValue === undefined ||
      rawValue === ""
    ) {
      return { status: "ignored", reason: "empty-value" };
    }


    const normalized = String(rawValue)
      .trim()
      .replace(/\u2212/g, "-")
      .replace(",", ".");


    const pattern =
      /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;


    const parsed = Number(normalized);


    if (
      !pattern.test(normalized) ||
      !Number.isFinite(parsed) ||
      (!allowNegative && parsed < 0)
    ) {
      return {
        status: "ignored",
        reason: "invalid-number"
      };
    }


    return applyAmount(normalized);
  }


  function receiveInput(event) {
    if (lifecycle.destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }


    const key = event.key ?? event.value;


    if (key === null || key === undefined || key === "") {
      return { status: "ignored", reason: "empty-input" };
    }


    if (event.source === "transfer") {
      return receiveTransferValue(key);
    }


    if (event.ctrl || event.alt) {
      return { status: "ignored", reason: "modified-key" };
    }


    const text = String(key);


    if (/^[0-9]$/.test(text)) {
      return insert(text);
    }


    if (text === "." || text === ",") {
      return insert(",");
    }


    if (text === "-" && allowNegative && amount === "") {
      return applyAmount("-");
    }


    if (text === "Backspace") {
      return receiveAction("backspace");
    }


    if (text === "Delete") {
      return receiveAction("clear");
    }


    if (text === "Enter") {
      return receiveAction("calculate");
    }


    return {
      status: "ignored",
      reason: "unsupported-input"
    };
  }


  function receiveAction(action) {
    if (lifecycle.destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }


    if (action === "clear") {
      return applyAmount("");
    }


    if (action === "backspace") {
      return applyAmount(amount.slice(0, -1));
    }


    if (action === "calculate") {
      refresh();


      return validAmount
        ? { status: "accepted" }
        : { status: "ignored", reason: "empty-amount" };
    }


    return {
      status: "ignored",
      reason: "unknown-action"
    };
  }


  function getState() {
    return {
      amount,
      sourceUnitId,
      targetUnitId,
      activeGroup,
      formulaOpen: Boolean(detailsElement?.open)
    };
  }


  function setState(snapshot) {
    if (lifecycle.destroyed || !snapshot) {
      return;
    }


    if (
      allowSourceSelection &&
      unitsById.has(snapshot.sourceUnitId)
    ) {
      sourceUnitId = snapshot.sourceUnitId;
    }


    if (unitsById.has(snapshot.targetUnitId)) {
      targetUnitId = snapshot.targetUnitId;
    }


    if (
      groups.some(group => group.id === snapshot.activeGroup)
    ) {
      activeGroup = snapshot.activeGroup;
    }


    tabs.setValue(activeGroup);
    applyAmount(snapshot.amount ?? "");


    if (detailsElement) {
      detailsElement.open = Boolean(snapshot.formulaOpen);
    }
  }


  function updateEngineTexts() {
    displayTitle.textContent = inputLabel;


    if (sourceElement) {
      sourceElement.title = inputLabel;
      sourceElement.setAttribute("aria-label", inputLabel);
    }


    refresh();
  }


  function destroy() {
    unsubscribeLanguage?.();

    lifecycle.destroy();
    container.replaceChildren();
  }


  const unsubscribeLanguage = t.subscribe?.(updateEngineTexts);


  renderResults();
  refresh();


  container.replaceChildren(root);


  return {
    type: "form",
    keyboardEnabled: true,


    receiveInput,
    receiveAction,
    receiveTransferValue,
    getState,
    setState,


    getResult: () => lastResult,
    getTransferValue: () => lastResult,


    destroy
  };
}