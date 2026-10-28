import { createUnitConverter } from "../createUnitConverter.js";


const FOOT = 0.3048;
const YARD = 0.9144;
const ROD = FOOT * 16.5;
const CHAIN = FOOT * 66;
const FURLONG = FOOT * 660;
const MILE = 1609.344;

const ARSHIN = 0.7112;
const SAZHEN = 2.1336;
const VERSTA = 1066.8;


function buildGroups(t) {
  return [
    {
      id: "metric",
      title: t("area.group.metric"),

      units: [
        unit(t, "um2", 1e-12),
        unit(t, "mm2", 1e-6),
        unit(t, "cm2", 0.0001),
        unit(t, "dm2", 0.01),
        unit(t, "m2", 1),
        unit(t, "are", 100),
        unit(t, "hectare", 10000),
        unit(t, "km2", 1000000)
      ]
    },

    {
      id: "imperial",
      title: t("area.group.imperial"),

      units: [
        unit(t, "in2", FOOT ** 2),
        unit(t, "ft2", FOOT ** 2),
        unit(t, "yd2", YARD ** 2),
        unit(t, "rod2", ROD ** 2),
        unit(t, "chain2", CHAIN ** 2),
        unit(t, "furlong2", FURLONG ** 2),
        unit(t, "acre", 4046.8564224),
        unit(t, "mi2", MILE ** 2)
      ]
    },

    {
      id: "russian",
      title: t("area.group.russian"),

      units: [
        unit(t, "vershok2", 0.04445 ** 2),
        unit(t, "pyad2", 0.1778 ** 2),
        unit(t, "arshin2", ARSHIN ** 2),
        unit(t, "sazhen2", SAZHEN ** 2),
        unit(t, "desyatina", 2400 * SAZHEN ** 2),
        unit(t, "versta2", VERSTA ** 2)
      ]
    }
  ];
}


function unit(t, id, factor) {
  return {
    id,
    factor,

    name: t(`area.unit.${id}.name`),
    short: t(`area.unit.${id}.short`)
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


export default function createAreaConverter(container, context) {
  const { t } = context;

  return createUnitConverter(container, context, {
    groups: buildGroups(t),

    defaultSourceId: "m2",
    defaultTargetId: "m2",

    allowSourceSelection: true,
    allowNegative: false,

    inputLabel: t("area.inputLabel"),
    baseLabel: t("area.baseLabel"),

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