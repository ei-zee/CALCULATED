function parseNumber(raw) {
  const text = String(raw ?? "")
    .trim()
    .replace(/\u2212/g, "-")
    .replace(",", ".");

  if (!/^\+?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) {
    return null;
  }

  const value = Number(text);

  return Number.isFinite(value) ? value : null;
}


export default function createCarTripCalculator(container, context) {
  const { ui, t } = context;

  const defaults = {
    mode: "fillups",
    consumption: "7,5",
    distanceBetweenFills: "",
    litersFilled: "",
    distance: "",
    roundTrip: false,
    fuelPrice: "",
    passengers: "1"
  };

  const state = { ...defaults };
  const controls = [];
  const inputs = {};

  let destroyed = false;
  let lastResult = null;

  const root = document.createElement("div");
  root.className = "car-trip";

  const form = document.createElement("div");
  form.className = "car-trip__form";

  const output = document.createElement("div");
  output.className = "car-trip__output";

  const message = document.createElement("p");
  message.className = "car-trip__message";
  message.setAttribute("role", "status");

  const language = () =>
    document.documentElement.lang || context.language || "ru";

  const unit = (ru, en) =>
    language().startsWith("ru") ? ru : en;

  function format(value, digits = 1) {
    if (!Number.isFinite(value)) {
      return "—";
    }

    return new Intl.NumberFormat(language(), {
      maximumFractionDigits: digits
    }).format(value);
  }

  function track(control) {
    controls.push(control);
    return control;
  }

  function createRow(...children) {
    const row = document.createElement("div");
    row.className = "car-trip__row";
    row.append(...children);
    return row;
  }

  function createField(name, label, placeholder) {
    const input = track(ui.number({
      value: state[name],
      label,
      placeholder,
      onChange(value) {
        state[name] = value;
        render();
      }
    }));

    inputs[name] = input;

    return track(ui.field({
      label,
      control: input
    })).element;
  }

  function createMetric(label) {
    const element = document.createElement("div");
    element.className = "car-trip__metric";

    const caption = document.createElement("span");
    caption.className = "car-trip__metric-label";
    caption.textContent = label;

    const value = document.createElement("span");
    value.className = "car-trip__metric-value";
    value.textContent = "—";

    element.append(caption, value);
    output.append(element);

    return value;
  }

  const mode = track(ui.segmented({
    value: state.mode,
    options: [
      {
        value: "dashboard",
        label: t("trip.mode.dashboard")
      },
      {
        value: "fillups",
        label: t("trip.mode.fillups")
      }
    ],
    onChange(value) {
      if (value !== "dashboard" && value !== "fillups") {
        return;
      }

      state.mode = value;
      updateMode();
      render();
    }
  }));

  const dashboardRow = createRow(
    createField(
      "consumption",
      `${t("trip.consumption")}, ${t("trip.consumptionUnit")}`,
      "7,5"
    )
  );

  dashboardRow.classList.add("car-trip__row--single");

  const fillupsRow = createRow(
    createField(
      "distanceBetweenFills",
      `${t("trip.distanceBetweenFills")}, ${unit("км", "km")}`,
      "640"
    ),
    createField(
      "litersFilled",
      `${t("trip.litersFilled")}, ${unit("л", "L")}`,
      "48"
    )
  );

  const roundTrip = track(ui.checkbox({
    checked: state.roundTrip,
    label: t("trip.roundTrip"),
    onChange(value) {
      state.roundTrip = value;
      render();
    }
  }));

  const distanceRow = createRow(
    createField(
      "distance",
      `${t("trip.distance")}, ${unit("км", "km")}`,
      "850"
    ),
    roundTrip.element
  );

  distanceRow.classList.add("car-trip__row--distance");

  const priceRow = createRow(
    createField(
      "fuelPrice",
      `${t("trip.fuelPrice")}, ${unit("₽/л", "RUB/L")}`,
      "62"
    ),
    createField(
      "passengers",
      t("trip.passengers"),
      "1"
    )
  );

  form.append(
    dashboardRow,
    fillupsRow,
    distanceRow,
    priceRow
  );

  const consumptionValue = createMetric(t("trip.consumption"));
const distanceValue = createMetric(t("trip.totalDistance"));
const fuelValue = createMetric(t("trip.litersNeeded"));
const costValue = createMetric(t("trip.totalCost"));
const personValue = createMetric(t("trip.perPassenger"));

  output.append(message);
  root.append(mode.element, form, output);
  container.replaceChildren(root);

  function updateMode() {
    dashboardRow.hidden = state.mode !== "dashboard";
    fillupsRow.hidden = state.mode !== "fillups";
    mode.setValue(state.mode);
  }

  function getConsumption() {
    if (state.mode === "dashboard") {
      const value = parseNumber(state.consumption);
      return value !== null && value > 0 ? value : null;
    }

    const distance = parseNumber(state.distanceBetweenFills);
    const liters = parseNumber(state.litersFilled);

    if (!(distance > 0) || !(liters > 0)) {
      return null;
    }

    const value = liters / distance * 100;
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function publish(value) {
    lastResult = Number.isFinite(value) ? value : null;
    context.setResult(lastResult ?? "");
  }

  function showMessage(text = "") {
    message.textContent = text;
    message.hidden = !text;
  }

  function render() {
  if (destroyed) {
    return;
  }

  consumptionValue.textContent = "—";
  distanceValue.textContent = "—";
  fuelValue.textContent = "—";
  costValue.textContent = "—";
  personValue.textContent = "—";

  // Переносимый результат — только стоимость.
  // Пока она не рассчитана, старого результата быть не должно.
  publish(null);
  showMessage("");

  const consumption = getConsumption();

  if (consumption === null) {
    showMessage(t(
      state.mode === "dashboard"
        ? "trip.enterConsumption"
        : "trip.enterFillups"
    ));
    return;
  }

  consumptionValue.textContent =
    `${format(consumption, 2)} ${t("trip.consumptionUnit")}`;

  const enteredDistance = parseNumber(state.distance);

  if (!(enteredDistance > 0)) {
    showMessage(t("trip.enterDistance"));
    return;
  }

  const distance = enteredDistance * (state.roundTrip ? 2 : 1);
  const liters = distance * consumption / 100;

  if (!Number.isFinite(distance) || !Number.isFinite(liters)) {
    showMessage(unit(
      "Результат выходит за допустимый диапазон.",
      "The result is outside the supported range."
    ));
    return;
  }

  distanceValue.textContent =
    `${format(distance, 2)} ${unit("км", "km")}`;

  fuelValue.textContent =
    `${format(liters, 2)} ${unit("л", "L")}`;

  const hasPrice = String(state.fuelPrice).trim() !== "";

  if (!hasPrice) {
    showMessage(unit(
      "Укажите цену топлива для расчёта общего счёта.",
      "Enter a fuel price to calculate the total cost."
    ));
    return;
  }

  const price = parseNumber(state.fuelPrice);

  if (!(price > 0)) {
    showMessage(unit(
      "Цена топлива должна быть больше нуля.",
      "Fuel price must be greater than zero."
    ));
    return;
  }

  const cost = liters * price;

  if (!Number.isFinite(cost)) {
    showMessage(unit(
      "Стоимость выходит за допустимый диапазон.",
      "The cost is outside the supported range."
    ));
    return;
  }

  // Денежный итог фиксируем до копеек.
  const totalCost = Math.round(
    (cost + Number.EPSILON) * 100
  ) / 100;

  costValue.textContent = `${format(totalCost, 2)} ₽`;

  // В слот уходит число, без ₽ и разделителей тысяч.
  publish(totalCost);

  const people = parseNumber(state.passengers);

  if (!Number.isInteger(people) || people < 1) {
    showMessage(unit(
      "Для суммы на человека укажите целое число людей от 1, включая водителя.",
      "Enter a whole number of people, at least 1, including the driver."
    ));
    return;
  }

  personValue.textContent =
    `${format(totalCost / people, 2)} ₽`;

  showMessage(unit(
    "Людей — включая водителя. «Обратно» удваивает введённое расстояние.",
    "People includes the driver. Round trip doubles the entered distance."
  ));
}

  function getState() {
    return { ...state };
  }

  function setState(snapshot) {
    if (destroyed || !snapshot) {
      return;
    }

    for (const name of Object.keys(defaults)) {
      if (Object.prototype.hasOwnProperty.call(snapshot, name)) {
        state[name] = snapshot[name];
      }
    }

    state.mode = state.mode === "dashboard" ? "dashboard" : "fillups";
    state.roundTrip = Boolean(state.roundTrip);

    for (const [name, input] of Object.entries(inputs)) {
      state[name] = String(state[name] ?? "");
      input.setValue(state[name]);
    }

    roundTrip.setChecked(state.roundTrip);
    updateMode();
    render();
  }

  function receiveTransferValue(raw) {
    if (destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }

    const value = parseNumber(
      raw !== null && typeof raw === "object" ? raw.value : raw
    );

    if (!(value > 0)) {
      return { status: "rejected", reason: "invalid-distance" };
    }

    state.distance = String(value).replace(".", ",");
    inputs.distance.setValue(state.distance);
    render();

    return { status: "accepted" };
  }

  function destroy() {
    if (destroyed) {
      return;
    }

    destroyed = true;

    for (const control of controls.reverse()) {
      control.destroy();
    }

    root.remove();
  }

  updateMode();
  render();

  return {
    type: "form",
    keyboardEnabled: false,
    getResult: () => lastResult,
    getTransferValue: () => lastResult,
    receiveTransferValue,
    getState,
    setState,
    destroy
  };
}