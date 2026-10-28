import { createUnitConverter } from "../createUnitConverter.js";


const POUND = 0.45359237;
const GRAIN = 0.00006479891;
const TROY_OUNCE = 0.0311034768;
const RUSSIAN_POUND = 0.4095124;


function buildGroups(t) {
  return [
    {
      id: "metric",
      title: t("mass.group.metric"),

      units: [
        unit(t, "ug", 1e-9),
        unit(t, "mg", 1e-6),
        unit(t, "g", 0.001),
        unit(t, "dag", 0.01),
        unit(t, "hg", 0.1),
        unit(t, "kg", 1),
        unit(t, "centner", 100),
        unit(t, "tonne", 1000)
      ]
    },

    {
      id: "imperial",
      title: t("mass.group.imperial"),

      units: [
        unit(t, "grain", GRAIN),
        unit(t, "ounce", POUND / 16),
        unit(t, "pound", POUND),
        unit(t, "stone", POUND * 14),
        unit(t, "us-cwt", POUND * 100),
        unit(t, "uk-cwt", POUND * 112),
        unit(t, "us-ton", POUND * 2000),
        unit(t, "uk-ton", POUND * 2240)
      ]
    },

    {
      id: "jewelry",
      title: t("mass.group.jewelry"),

      units: [
        unit(t, "jewelry-mg", 1e-6),
        unit(t, "jewelry-g", 0.001),
        unit(t, "carat", 0.0002),
        unit(t, "carat-point", 0.000002),
        unit(t, "troy-grain", GRAIN),
        unit(t, "pennyweight", GRAIN * 24),
        unit(t, "troy-ounce", TROY_OUNCE),
        unit(t, "troy-pound", TROY_OUNCE * 12)
      ]
    },

    {
      id: "russian",
      title: t("mass.group.russian"),

      units: [
        unit(t, "dolya", RUSSIAN_POUND / 96 / 96),
        unit(t, "zolotnik", RUSSIAN_POUND / 96),
        unit(t, "lot", RUSSIAN_POUND / 32),
        unit(t, "russian-pound", RUSSIAN_POUND),
        unit(t, "pood", RUSSIAN_POUND * 40),
        unit(t, "berkovets", RUSSIAN_POUND * 400)
      ]
    }
  ];
}


function unit(t, id, factor) {
  return {
    id,
    factor,

    name: t(`mass.unit.${id}.name`),
    short: t(`mass.unit.${id}.short`)
  };
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


export default function createMassConverter(container, context) {
  const { t } = context;

  return createUnitConverter(container, context, {
    groups: buildGroups(t),

    defaultSourceId: "kg",
    defaultTargetId: "kg",

    allowSourceSelection: true,
    allowNegative: false,

    inputLabel: t("mass.inputLabel"),
    baseLabel: t("mass.baseLabel"),

    roundResult,
    formatNumber,
    formatExactNumber,

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