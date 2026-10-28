import { createUnitConverter } from "../createUnitConverter.js";


const US_GALLON = 3.785411784;
const UK_GALLON = 4.54609;


function buildGroups(t) {
  return [
    {
      id: "metric",
      title: t("volume.group.metric"),

      units: [
        unit(t, "ml", 0.001),
        unit(t, "cl", 0.01),
        unit(t, "dl", 0.1),
        unit(t, "l", 1),
        unit(t, "hl", 100),
        unit(t, "cm3", 0.001),
        unit(t, "dm3", 1),
        unit(t, "m3", 1000)
      ]
    },

    {
      id: "us",
      title: t("volume.group.us"),

      units: [
        unit(t, "us-tsp", US_GALLON / 768),
        unit(t, "us-tbsp", US_GALLON / 256),
        unit(t, "us-floz", US_GALLON / 128),
        unit(t, "us-cup", US_GALLON / 16),
        unit(t, "us-gill", US_GALLON / 32),
        unit(t, "us-pint", US_GALLON / 8),
        unit(t, "us-quart", US_GALLON / 4),
        unit(t, "us-gallon", US_GALLON)
      ]
    },

    {
      id: "imperial",
      title: t("volume.group.imperial"),

      units: [
        unit(t, "uk-floz", UK_GALLON / 160),
        unit(t, "uk-gill", UK_GALLON / 32),
        unit(t, "uk-pint", UK_GALLON / 8),
        unit(t, "uk-quart", UK_GALLON / 4),
        unit(t, "uk-gallon", UK_GALLON),
        unit(t, "in3", 0.016387064),
        unit(t, "ft3", 28.316846592),
        unit(t, "yd3", 764.554857984)
      ]
    }
  ];
}


function unit(t, id, factor) {
  return {
    id,
    factor,

    name: t(`volume.unit.${id}.name`),
    short: t(`volume.unit.${id}.short`)
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


export default function createVolumeConverter(container, context) {
  const { t } = context;

  return createUnitConverter(container, context, {
    groups: buildGroups(t),

    defaultSourceId: "l",
    defaultTargetId: "l",

    allowSourceSelection: true,
    allowNegative: false,

    inputLabel: t("volume.inputLabel"),
    baseLabel: t("volume.baseLabel"),

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