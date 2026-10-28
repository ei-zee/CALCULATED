import { createUnitConverter } from "../createUnitConverter.js";


const SPEED_OF_LIGHT = 299792458;
const ASTRONOMICAL_UNIT = 149597870700;
const PARSEC = ASTRONOMICAL_UNIT * 648000 / Math.PI;



function buildGroups(t) {
  return [
    {
      id: "metric",
      title: t("length.group.metric"),


      units: [
        unit(t, "nm", 1e-9),
        unit(t, "um", 1e-6),
        unit(t, "mm", 0.001),
        unit(t, "cm", 0.01),
        unit(t, "dm", 0.1),
        unit(t, "m", 1),
        unit(t, "hm", 100),
        unit(t, "km", 1000)
      ]
    },


    {
      id: "imperial",
      title: t("length.group.imperial"),


      units: [
        unit(t, "in", 0.0254),
        unit(t, "ft", 0.3048),
        unit(t, "yd", 0.9144),
        unit(t, "fathom", 1.8288),
        unit(t, "chain", 20.1168),
        unit(t, "furlong", 201.168),
        unit(t, "mi", 1609.344),
        unit(t, "nmi", 1852)
      ]
    },


    {
      id: "russian",
      title: t("length.group.russian"),


      units: [
        unit(t, "liniya", 0.00254),
        unit(t, "dyuym", 0.0254),
        unit(t, "vershok", 0.04445),
        unit(t, "pyad", 0.1778),
        unit(t, "fut", 0.3048),
        unit(t, "arshin", 0.7112),
        unit(t, "sazhen", 2.1336),
        unit(t, "versta", 1066.8)
      ]
    },


    {
      id: "astro",
      title: t("length.group.astro"),


      units: [
        unit(t, "light-second", SPEED_OF_LIGHT),
        unit(t, "light-minute", SPEED_OF_LIGHT * 60),
        unit(t, "light-hour", SPEED_OF_LIGHT * 3600),
        unit(t, "light-day", SPEED_OF_LIGHT * 86400),
        unit(t, "au", ASTRONOMICAL_UNIT),
        unit(t, "ly", SPEED_OF_LIGHT * 31557600),
        unit(t, "pc", PARSEC),
        unit(t, "kpc", PARSEC * 1000)
      ]
    }
  ];
}



function unit(t, id, factor) {
  return {
    id,
    factor,


    name: t(`length.unit.${id}.name`),
    short: t(`length.unit.${id}.short`)
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



export default function createLengthConverter(container, context) {
  const { t } = context;


  let instance = null;


  function createConverter(state = null) {
    instance?.destroy?.();
    container.replaceChildren();


    instance = createUnitConverter(container, context, {
      groups: buildGroups(t),


      defaultSourceId: "m",
      defaultTargetId: "m",


      allowSourceSelection: true,
      allowNegative: true,


      inputLabel: t("length.inputLabel"),
      baseLabel: t("length.baseLabel"),


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


    if (state) {
      instance.setState(state);
    }
  }


  function destroyConverter() {
    instance?.destroy?.();
    instance = null;
    container.replaceChildren();
  }


  createConverter();


  const unsubscribeLanguage = t.subscribe?.(() => {
    const state = instance?.getState?.();

    createConverter(state);
  });


  return {
    type: "form",
    keyboardEnabled: true,


    receiveInput(event) {
      return instance?.receiveInput?.(event);
    },

    receiveAction(action) {
      return instance?.receiveAction?.(action);
    },

    receiveTransferValue(value) {
      return instance?.receiveTransferValue?.(value);
    },

    getState() {
      return instance?.getState?.();
    },

    setState(state) {
      instance?.setState?.(state);
    },


    getResult: () => instance?.getResult?.() ?? null,
    getTransferValue: () => instance?.getTransferValue?.() ?? null,


    destroy() {
      unsubscribeLanguage?.();
      destroyConverter();
    }
  };
}