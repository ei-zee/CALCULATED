import { createUnitConverter } from "../createUnitConverter.js";


const ABSOLUTE_ZERO_C = -273.15;
const ZERO_TOLERANCE = 1e-10;


function buildGroups(t) {
  return [
    {
      id: "scales",
      title: t("temperature.group.scales"),

      units: [
        {
          id: "celsius",
          name: t("temperature.unit.celsius.name"),
          short: t("temperature.unit.celsius.short"),

          toKelvin: value => value + 273.15,
          fromKelvin: value => value - 273.15,

          toKelvinFormula: t("temperature.formula.celsius.toKelvin"),
          fromKelvinFormula: t("temperature.formula.celsius.fromKelvin")
        },

        {
          id: "fahrenheit",
          name: t("temperature.unit.fahrenheit.name"),
          short: t("temperature.unit.fahrenheit.short"),

          toKelvin: value => (value + 459.67) * 5 / 9,
          fromKelvin: value => value * 9 / 5 - 459.67,

          toKelvinFormula: t("temperature.formula.fahrenheit.toKelvin"),
          fromKelvinFormula: t("temperature.formula.fahrenheit.fromKelvin")
        },

        {
          id: "kelvin",
          name: t("temperature.unit.kelvin.name"),
          short: t("temperature.unit.kelvin.short"),

          toKelvin: value => value,
          fromKelvin: value => value,

          toKelvinFormula: t("temperature.formula.kelvin.toKelvin"),
          fromKelvinFormula: t("temperature.formula.kelvin.fromKelvin")
        },

        {
          id: "rankine",
          name: t("temperature.unit.rankine.name"),
          short: t("temperature.unit.rankine.short"),

          toKelvin: value => value * 5 / 9,
          fromKelvin: value => value * 9 / 5,

          toKelvinFormula: t("temperature.formula.rankine.toKelvin"),
          fromKelvinFormula: t("temperature.formula.rankine.fromKelvin")
        },

        {
          id: "reaumur",
          name: t("temperature.unit.reaumur.name"),
          short: t("temperature.unit.reaumur.short"),

          toKelvin: value => value * 5 / 4 + 273.15,
          fromKelvin: value => (value - 273.15) * 4 / 5,

          toKelvinFormula: t("temperature.formula.reaumur.toKelvin"),
          fromKelvinFormula: t("temperature.formula.reaumur.fromKelvin")
        },

        {
          id: "newton",
          name: t("temperature.unit.newton.name"),
          short: t("temperature.unit.newton.short"),

          toKelvin: value => value * 100 / 33 + 273.15,
          fromKelvin: value => (value - 273.15) * 33 / 100,

          toKelvinFormula: t("temperature.formula.newton.toKelvin"),
          fromKelvinFormula: t("temperature.formula.newton.fromKelvin")
        },

        {
          id: "romer",
          name: t("temperature.unit.romer.name"),
          short: t("temperature.unit.romer.short"),

          toKelvin: value => (value - 7.5) * 40 / 21 + 273.15,
          fromKelvin: value => (value - 273.15) * 21 / 40 + 7.5,

          toKelvinFormula: t("temperature.formula.romer.toKelvin"),
          fromKelvinFormula: t("temperature.formula.romer.fromKelvin")
        },

        {
          id: "delisle",
          name: t("temperature.unit.delisle.name"),
          short: t("temperature.unit.delisle.short"),

          toKelvin: value => 373.15 - value * 2 / 3,
          fromKelvin: value => (373.15 - value) * 3 / 2,

          toKelvinFormula: t("temperature.formula.delisle.toKelvin"),
          fromKelvinFormula: t("temperature.formula.delisle.fromKelvin")
        }
      ]
    }
  ];
}


function roundResult(value) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const rounded = Number(value.toPrecision(6));

  return Object.is(rounded, -0) ? 0 : rounded;
}


function formatNumber(value) {
  const rounded = roundResult(value);

  if (rounded === null) {
    return "—";
  }

  if (rounded === 0) {
    return "0";
  }

  const absolute = Math.abs(rounded);

  if (absolute < 0.0001 || absolute >= 1e9) {
    const [mantissa, exponent] = rounded.toExponential().split("e");

    return `${mantissa.replace(".", ",")}e${exponent}`;
  }

  return rounded.toLocaleString("ru-RU", {
    maximumSignificantDigits: 6
  });
}


function formatExactNumber(value) {
  return String(value).replace(".", ",");
}


function getKelvin(value, source) {
  const kelvin = source.toKelvin(value);

  if (
    !Number.isFinite(kelvin) ||
    kelvin < -ZERO_TOLERANCE
  ) {
    return NaN;
  }

  return Math.max(0, kelvin);
}


function convertTemperature(value, source, target) {
  const kelvin = getKelvin(value, source);

  if (!Number.isFinite(kelvin)) {
    return NaN;
  }

  if (source.id === target.id) {
    return value;
  }

  const converted = target.fromKelvin(kelvin);

  return Object.is(converted, -0) ? 0 : converted;
}


function createTemperatureFormulaFormatter(t) {
  return function formatTemperatureFormula({
    value,
    valid,
    source,
    target
  }) {
    const formulas = source.id === target.id
      ? t("temperature.formula.sameScale")
      : [
          source.toKelvinFormula,
          target.fromKelvinFormula
        ].join("\n");

    if (!valid) {
      return formulas;
    }

    const kelvin = getKelvin(value, source);

    if (!Number.isFinite(kelvin)) {
      return [
        formulas,
        t("temperature.formula.invalid"),
        t("temperature.formula.lowerBound", {
          value: ABSOLUTE_ZERO_C
        })
      ].join("\n");
    }

    const converted = convertTemperature(value, source, target);
    const rounded = roundResult(converted);

    if (rounded === null) {
      return `${formulas}\n${t("converter.outOfRange")}`;
    }

    const sign = rounded === converted ? "=" : "≈";

    return (
      `${formulas}\n` +
      `${formatExactNumber(value)} ${source.short} ` +
      `${sign} ${formatNumber(converted)} ${target.short}`
    );
  };
}


export default function createTemperatureConverter(container, context) {
  const { t } = context;

  return createUnitConverter(container, context, {
    groups: buildGroups(t),

    defaultSourceId: "celsius",
    defaultTargetId: "fahrenheit",

    allowSourceSelection: true,
    allowNegative: true,

    inputLabel: t("temperature.inputLabel"),
    baseLabel: t("temperature.baseLabel"),

    roundResult,
    formatNumber,
    formatExactNumber,

    convert: convertTemperature,
    formatFormula: createTemperatureFormulaFormatter(t),

    classes: {
      root: "conv",
      display: "keypad-display conv-display",
      expression: "keypad-expression",
      preview: "keypad-preview",

      source: "conv-unit-chip",

      tabs: "conv-tabs",
      tab: "conv-tab",

      list: "conv-list",
      items: "conv-group-items",
      row: "conv-row",
      unit: "conv-unit",
      value: "conv-value",

      notice: "conv-notice"
    }
  });
}