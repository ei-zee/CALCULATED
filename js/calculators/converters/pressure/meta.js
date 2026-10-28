const GROUP_TITLES = {
  metric: {
    ru: "Метрич.",
    en: "Metric",
    es: "Métrico",
    fr: "Métrique",
    de: "Metrisch",
    zh: "公制"
  },

  practical: {
    ru: "Практич.",
    en: "Practical",
    es: "Prácticas",
    fr: "Pratiques",
    de: "Praktisch",
    zh: "常用"
  },

  liquid: {
    ru: "Ртуть / вода",
    en: "Hg / water",
    es: "Hg / agua",
    fr: "Hg / eau",
    de: "Hg / Wasser",
    zh: "汞 / 水柱"
  },

  imperial: {
    ru: "Англо-амер.",
    en: "Imperial",
    es: "Imperial",
    fr: "Impérial",
    de: "Imperial",
    zh: "英制"
  }
};


const UNIT_NAMES = {
  pa: {
    ru: "Паскали", en: "Pascals", es: "Pascales",
    fr: "Pascals", de: "Pascal", zh: "帕斯卡"
  },
  hpa: {
    ru: "Гектопаскали", en: "Hectopascals", es: "Hectopascales",
    fr: "Hectopascals", de: "Hektopascal", zh: "百帕"
  },
  kpa: {
    ru: "Килопаскали", en: "Kilopascals", es: "Kilopascales",
    fr: "Kilopascals", de: "Kilopascal", zh: "千帕"
  },
  mpa: {
    ru: "Мегапаскали", en: "Megapascals", es: "Megapascales",
    fr: "Mégapascals", de: "Megapascal", zh: "兆帕"
  },
  gpa: {
    ru: "Гигапаскали", en: "Gigapascals", es: "Gigapascales",
    fr: "Gigapascals", de: "Gigapascal", zh: "吉帕"
  },

  mbar: {
    ru: "Миллибары", en: "Millibars", es: "Milibares",
    fr: "Millibars", de: "Millibar", zh: "毫巴"
  },
  bar: {
    ru: "Бары", en: "Bars", es: "Bares",
    fr: "Bars", de: "Bar", zh: "巴"
  },
  atm: {
    ru: "Физические атмосферы", en: "Standard atmospheres", es: "Atmósferas estándar",
    fr: "Atmosphères standard", de: "Standardatmosphären", zh: "标准大气压"
  },
  "kgf-cm2": {
    ru: "Килограмм-силы на см²", en: "Kilograms-force per cm²", es: "Kilogramos-fuerza por cm²",
    fr: "Kilogrammes-force par cm²", de: "Kilopond pro cm²", zh: "千克力每平方厘米"
  },

  mmhg: {
    ru: "Миллиметры ртутного столба", en: "Millimeters of mercury", es: "Milímetros de mercurio",
    fr: "Millimètres de mercure", de: "Millimeter Quecksilbersäule", zh: "毫米汞柱"
  },
  torr: {
    ru: "Торры", en: "Torr", es: "Torr",
    fr: "Torrs", de: "Torr", zh: "托"
  },
  mmh2o: {
    ru: "Миллиметры водяного столба", en: "Millimeters of water", es: "Milímetros de columna de agua",
    fr: "Millimètres d’eau", de: "Millimeter Wassersäule", zh: "毫米水柱"
  },
  mh2o: {
    ru: "Метры водяного столба", en: "Meters of water", es: "Metros de columna de agua",
    fr: "Mètres d’eau", de: "Meter Wassersäule", zh: "米水柱"
  },

  psi: {
    ru: "Фунты на квадратный дюйм", en: "Pounds per square inch", es: "Libras por pulgada cuadrada",
    fr: "Livres par pouce carré", de: "Pfund pro Quadratzoll", zh: "磅每平方英寸"
  },
  psf: {
    ru: "Фунты на квадратный фут", en: "Pounds per square foot", es: "Libras por pie cuadrado",
    fr: "Livres par pied carré", de: "Pfund pro Quadratfuß", zh: "磅每平方英尺"
  },
  inhg: {
    ru: "Дюймы ртутного столба", en: "Inches of mercury", es: "Pulgadas de mercurio",
    fr: "Pouces de mercure", de: "Zoll Quecksilbersäule", zh: "英寸汞柱"
  },
  inh2o: {
    ru: "Дюймы водяного столба", en: "Inches of water", es: "Pulgadas de columna de agua",
    fr: "Pouces d’eau", de: "Zoll Wassersäule", zh: "英寸水柱"
  }
};


const UNIT_SHORTS = {
  pa: {
    ru: "Па", en: "Pa", es: "Pa", fr: "Pa", de: "Pa", zh: "帕"
  },
  hpa: {
    ru: "гПа", en: "hPa", es: "hPa", fr: "hPa", de: "hPa", zh: "百帕"
  },
  kpa: {
    ru: "кПа", en: "kPa", es: "kPa", fr: "kPa", de: "kPa", zh: "千帕"
  },
  mpa: {
    ru: "МПа", en: "MPa", es: "MPa", fr: "MPa", de: "MPa", zh: "兆帕"
  },
  gpa: {
    ru: "ГПа", en: "GPa", es: "GPa", fr: "GPa", de: "GPa", zh: "吉帕"
  },

  mbar: {
    ru: "мбар", en: "mbar", es: "mbar", fr: "mbar", de: "mbar", zh: "毫巴"
  },
  bar: {
    ru: "бар", en: "bar", es: "bar", fr: "bar", de: "bar", zh: "巴"
  },
  atm: {
    ru: "атм", en: "atm", es: "atm", fr: "atm", de: "atm", zh: "标准大气压"
  },
  "kgf-cm2": {
    ru: "кгс/см²", en: "kgf/cm²", es: "kgf/cm²", fr: "kgf/cm²", de: "kp/cm²", zh: "千克力/平方厘米"
  },

  mmhg: {
    ru: "мм рт. ст.", en: "mmHg", es: "mmHg", fr: "mmHg", de: "mmHg", zh: "毫米汞柱"
  },
  torr: {
    ru: "Torr", en: "Torr", es: "Torr", fr: "Torr", de: "Torr", zh: "托"
  },
  mmh2o: {
    ru: "мм вод. ст.", en: "mmH₂O", es: "mmH₂O", fr: "mmH₂O", de: "mmWS", zh: "毫米水柱"
  },
  mh2o: {
    ru: "м вод. ст.", en: "mH₂O", es: "mH₂O", fr: "mH₂O", de: "mWS", zh: "米水柱"
  },

  psi: {
    ru: "psi", en: "psi", es: "psi", fr: "psi", de: "psi", zh: "psi"
  },
  psf: {
    ru: "psf", en: "psf", es: "psf", fr: "psf", de: "psf", zh: "psf"
  },
  inhg: {
    ru: "inHg", en: "inHg", es: "inHg", fr: "inHg", de: "inHg", zh: "英寸汞柱"
  },
  inh2o: {
    ru: "inH₂O", en: "inH₂O", es: "inH₂O", fr: "inH₂O", de: "inH₂O", zh: "英寸水柱"
  }
};


const strings = {
  "pressure.inputLabel": {
    ru: "Введите давление",
    en: "Enter pressure",
    es: "Introduce una presión",
    fr: "Saisissez une pression",
    de: "Druck eingeben",
    zh: "输入压力"
  },

  "pressure.baseLabel": {
    ru: "Па",
    en: "Pa",
    es: "Pa",
    fr: "Pa",
    de: "Pa",
    zh: "帕"
  }
};


for (const [groupId, title] of Object.entries(GROUP_TITLES)) {
  strings[`pressure.group.${groupId}`] = title;
}


for (const [unitId, name] of Object.entries(UNIT_NAMES)) {
  strings[`pressure.unit.${unitId}.name`] = name;
  strings[`pressure.unit.${unitId}.short`] = UNIT_SHORTS[unitId];
}


export const meta = {
  id: "pressure",

  title: {
    ru: "Давление",
    en: "Pressure",
    es: "Presión",
    fr: "Pression",
    de: "Druck",
    zh: "压力"
  },

  description: {
    ru: "Введите давление — получите все единицы измерения.",
    en: "Enter a pressure — get all pressure units.",
    es: "Introduce una presión y obtén todas las unidades.",
    fr: "Saisissez une pression pour obtenir toutes les unités.",
    de: "Druck eingeben und alle Druckeinheiten erhalten.",
    zh: "输入压力，获取所有压力单位。"
  },

  category: "converters",
  resultPanel: false,

  strings
};