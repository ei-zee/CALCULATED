import { createUnitConverter } from "../createUnitConverter.js";


const PA = 1;
const KPA = 1000;
const MPA = 1000000;
const GPA = 1000000000;

const BAR = 100000;
const MBAR = 100;
const ATM = 101325;

const MMHG = 133.322387415;
const TORR = ATM / 760;
const MMH2O = 9.80665;
const MH2O = 9806.65;

const PSI = 6894.757293168;
const PSF = PSI / 144;
const INHG = 3386.389;
const INH2O = 249.08891;

const KGF_CM2 = 98066.5;


function buildGroups(t) {
  return [
    {
      id: "metric",
      title: t("pressure.group.metric"),

      units: [
        unit(t, "pa", PA),
        unit(t, "hpa", 100),
        unit(t, "kpa", KPA),
        unit(t, "mpa", MPA),
        unit(t, "gpa", GPA)
      ]
    },

    {
      id: "practical",
      title: t("pressure.group.practical"),

      units: [
        unit(t, "mbar", MBAR),
        unit(t, "bar", BAR),
        unit(t, "atm", ATM),
        unit(t, "kgf-cm2", KGF_CM2)
      ]
    },

    {
      id: "liquid",
      title: t("pressure.group.liquid"),

      units: [
        unit(t, "mmhg", MMHG),
        unit(t, "torr", TORR),
        unit(t, "mmh2o", MMH2O),
        unit(t, "mh2o", MH2O)
      ]
    },

    {
      id: "imperial",
      title: t("pressure.group.imperial"),

      units: [
        unit(t, "psi", PSI),
        unit(t, "psf", PSF),
        unit(t, "inhg", INHG),
        unit(t, "inh2o", INH2O)
      ]
    }
  ];
}


function unit(t, id, factor) {
  return {
    id,
    factor,

    name: t(`pressure.unit.${id}.name`),
    short: t(`pressure.unit.${id}.short`)
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


export default function createPressureConverter(container, context) {
  const { t } = context;

  return createUnitConverter(container, context, {
    groups: buildGroups(t),

    defaultSourceId: "bar",
    defaultTargetId: "psi",

    allowSourceSelection: true,
    allowNegative: false,

    inputLabel: t("pressure.inputLabel"),
    baseLabel: t("pressure.baseLabel"),

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