const GROUP_TITLES = {
  metric: {
    ru: "Метрич.",
    en: "Metric",
    es: "Métrico",
    fr: "Métrique",
    de: "Metrisch",
    zh: "公制"
  },

  imperial: {
    ru: "Англо-амер.",
    en: "Imperial",
    es: "Imperial",
    fr: "Impérial",
    de: "Imperial",
    zh: "英制"
  },

  jewelry: {
    ru: "Тройские",
    en: "Troy",
    es: "Troy",
    fr: "Troy",
    de: "Troy",
    zh: "金衡"
  },

  russian: {
    ru: "Русские",
    en: "Russian",
    es: "Rusas",
    fr: "Russes",
    de: "Russisch",
    zh: "俄制"
  }
};


const UNIT_NAMES = {
  ug: {
    ru: "Микрограммы", en: "Micrograms", es: "Microgramos",
    fr: "Microgrammes", de: "Mikrogramm", zh: "微克"
  },
  mg: {
    ru: "Миллиграммы", en: "Milligrams", es: "Miligramos",
    fr: "Milligrammes", de: "Milligramm", zh: "毫克"
  },
  g: {
    ru: "Граммы", en: "Grams", es: "Gramos",
    fr: "Grammes", de: "Gramm", zh: "克"
  },
  dag: {
    ru: "Декаграммы", en: "Decagrams", es: "Decagramos",
    fr: "Décagrammes", de: "Dekagramm", zh: "十克"
  },
  hg: {
    ru: "Гектограммы", en: "Hectograms", es: "Hectogramos",
    fr: "Hectogrammes", de: "Hektogramm", zh: "百克"
  },
  kg: {
    ru: "Килограммы", en: "Kilograms", es: "Kilogramos",
    fr: "Kilogrammes", de: "Kilogramm", zh: "千克"
  },
  centner: {
    ru: "Метрические центнеры", en: "Metric centners", es: "Quintales métricos",
    fr: "Quintaux métriques", de: "Doppelzentner", zh: "公担"
  },
  tonne: {
    ru: "Метрические тонны", en: "Metric tons", es: "Toneladas métricas",
    fr: "Tonnes métriques", de: "Metrische Tonnen", zh: "公吨"
  },

  grain: {
    ru: "Граны", en: "Grains", es: "Granos",
    fr: "Grains", de: "Grain", zh: "格令"
  },
  ounce: {
    ru: "Обычные унции", en: "Ounces", es: "Onzas",
    fr: "Onces", de: "Unzen", zh: "盎司"
  },
  pound: {
    ru: "Обычные фунты", en: "Pounds", es: "Libras",
    fr: "Livres", de: "Pfund", zh: "磅"
  },
  stone: {
    ru: "Стоуны", en: "Stones", es: "Stones",
    fr: "Stones", de: "Stone", zh: "英石"
  },
  "us-cwt": {
    ru: "Короткие хандредвейты US", en: "US hundredweights", es: "Quintales cortos de EE. UU.",
    fr: "Quintaux courts US", de: "US-Hundredweight", zh: "美担"
  },
  "uk-cwt": {
    ru: "Длинные хандредвейты UK", en: "UK hundredweights", es: "Quintales largos del Reino Unido",
    fr: "Quintaux longs UK", de: "UK-Hundredweight", zh: "英担"
  },
  "us-ton": {
    ru: "Короткие тонны US", en: "US tons", es: "Toneladas cortas de EE. UU.",
    fr: "Tonnes courtes US", de: "US-Tonnen", zh: "美吨"
  },
  "uk-ton": {
    ru: "Длинные тонны UK", en: "UK tons", es: "Toneladas largas del Reino Unido",
    fr: "Tonnes longues UK", de: "UK-Tonnen", zh: "英吨"
  },

  "jewelry-mg": {
    ru: "Миллиграммы", en: "Milligrams", es: "Miligramos",
    fr: "Milligrammes", de: "Milligramm", zh: "毫克"
  },
  "jewelry-g": {
    ru: "Граммы", en: "Grams", es: "Gramos",
    fr: "Grammes", de: "Gramm", zh: "克"
  },
  carat: {
    ru: "Метрические караты", en: "Metric carats", es: "Quilates métricos",
    fr: "Carats métriques", de: "Metrische Karat", zh: "克拉"
  },
  "carat-point": {
    ru: "Сотые доли карата", en: "Carat points", es: "Puntos de quilate",
    fr: "Points de carat", de: "Karat-Punkte", zh: "分"
  },
  "troy-grain": {
    ru: "Граны", en: "Grains", es: "Granos",
    fr: "Grains", de: "Grain", zh: "格令"
  },
  pennyweight: {
    ru: "Пеннивэйты", en: "Pennyweights", es: "Pennyweights",
    fr: "Pennyweights", de: "Pennyweight", zh: "本尼威特"
  },
  "troy-ounce": {
    ru: "Тройские унции", en: "Troy ounces", es: "Onzas troy",
    fr: "Onces troy", de: "Troy-Unzen", zh: "金衡盎司"
  },
  "troy-pound": {
    ru: "Тройские фунты", en: "Troy pounds", es: "Libras troy",
    fr: "Livres troy", de: "Troy-Pfund", zh: "金衡磅"
  },

  dolya: {
    ru: "Доли", en: "Dolyas", es: "Dolyas",
    fr: "Dolyas", de: "Dolja", zh: "多里亚"
  },
  zolotnik: {
    ru: "Золотники", en: "Zolotniks", es: "Zolotniks",
    fr: "Zolotniks", de: "Solotnik", zh: "佐洛特尼克"
  },
  lot: {
    ru: "Лоты", en: "Lots", es: "Lots",
    fr: "Lots", de: "Lot", zh: "洛特"
  },
  "russian-pound": {
    ru: "Русские фунты", en: "Russian pounds", es: "Libras rusas",
    fr: "Livres russes", de: "Russische Pfund", zh: "俄磅"
  },
  pood: {
    ru: "Пуды", en: "Poods", es: "Puds",
    fr: "Pouds", de: "Pud", zh: "普特"
  },
  berkovets: {
    ru: "Берковцы", en: "Berkovets", es: "Berkovets",
    fr: "Berkovets", de: "Berkowez", zh: "别尔科维茨"
  }
};


const UNIT_SHORTS = {
  ug: {
    ru: "мкг", en: "µg", es: "µg", fr: "µg", de: "µg", zh: "微克"
  },
  mg: {
    ru: "мг", en: "mg", es: "mg", fr: "mg", de: "mg", zh: "毫克"
  },
  g: {
    ru: "г", en: "g", es: "g", fr: "g", de: "g", zh: "克"
  },
  dag: {
    ru: "даг", en: "dag", es: "dag", fr: "dag", de: "dag", zh: "十克"
  },
  hg: {
    ru: "гг", en: "hg", es: "hg", fr: "hg", de: "hg", zh: "百克"
  },
  kg: {
    ru: "кг", en: "kg", es: "kg", fr: "kg", de: "kg", zh: "千克"
  },
  centner: {
    ru: "ц", en: "cwt", es: "cwt", fr: "q", de: "dz", zh: "公担"
  },
  tonne: {
    ru: "т", en: "t", es: "t", fr: "t", de: "t", zh: "吨"
  },

  grain: {
    ru: "gr", en: "gr", es: "gr", fr: "gr", de: "gr", zh: "格令"
  },
  ounce: {
    ru: "oz", en: "oz", es: "oz", fr: "oz", de: "oz", zh: "盎司"
  },
  pound: {
    ru: "lb", en: "lb", es: "lb", fr: "lb", de: "lb", zh: "磅"
  },
  stone: {
    ru: "st", en: "st", es: "st", fr: "st", de: "st", zh: "英石"
  },
  "us-cwt": {
    ru: "cwt US", en: "cwt US", es: "cwt EE. UU.", fr: "cwt US", de: "cwt US", zh: "美担"
  },
  "uk-cwt": {
    ru: "cwt UK", en: "cwt UK", es: "cwt RU", fr: "cwt UK", de: "cwt UK", zh: "英担"
  },
  "us-ton": {
    ru: "ton US", en: "ton US", es: "t EE. UU.", fr: "t US", de: "t US", zh: "美吨"
  },
  "uk-ton": {
    ru: "ton UK", en: "ton UK", es: "t RU", fr: "t UK", de: "t UK", zh: "英吨"
  },

  "jewelry-mg": {
    ru: "мг", en: "mg", es: "mg", fr: "mg", de: "mg", zh: "毫克"
  },
  "jewelry-g": {
    ru: "г", en: "g", es: "g", fr: "g", de: "g", zh: "克"
  },
  carat: {
    ru: "ct", en: "ct", es: "ct", fr: "ct", de: "ct", zh: "克拉"
  },
  "carat-point": {
    ru: "pt (ct)", en: "pt (ct)", es: "pt (ct)", fr: "pt (ct)", de: "pt (ct)", zh: "分"
  },
  "troy-grain": {
    ru: "gr", en: "gr", es: "gr", fr: "gr", de: "gr", zh: "格令"
  },
  pennyweight: {
    ru: "dwt", en: "dwt", es: "dwt", fr: "dwt", de: "dwt", zh: "本尼威特"
  },
  "troy-ounce": {
    ru: "oz t", en: "oz t", es: "oz t", fr: "oz t", de: "oz t", zh: "金衡盎司"
  },
  "troy-pound": {
    ru: "lb t", en: "lb t", es: "lb t", fr: "lb t", de: "lb t", zh: "金衡磅"
  },

  dolya: {
    ru: "доля", en: "dolya", es: "dolya", fr: "dolya", de: "Dolja", zh: "多里亚"
  },
  zolotnik: {
    ru: "золотник", en: "zolotnik", es: "zolotnik", fr: "zolotnik", de: "Solotnik", zh: "佐洛特尼克"
  },
  lot: {
    ru: "лот", en: "lot", es: "lot", fr: "lot", de: "Lot", zh: "洛特"
  },
  "russian-pound": {
    ru: "рус. фунт", en: "ru lb", es: "libra rusa", fr: "livre russe", de: "russ. Pfund", zh: "俄磅"
  },
  pood: {
    ru: "пуд", en: "pood", es: "pud", fr: "poud", de: "Pud", zh: "普特"
  },
  berkovets: {
    ru: "берковец", en: "berkovets", es: "berkovets", fr: "berkovets", de: "Berkowez", zh: "别尔科维茨"
  }
};


const strings = {
  "mass.inputLabel": {
    ru: "Введите массу",
    en: "Enter mass",
    es: "Introduce una masa",
    fr: "Saisissez une masse",
    de: "Masse eingeben",
    zh: "输入质量"
  },

  "mass.baseLabel": {
    ru: "кг",
    en: "kg",
    es: "kg",
    fr: "kg",
    de: "kg",
    zh: "千克"
  }
};


for (const [groupId, title] of Object.entries(GROUP_TITLES)) {
  strings[`mass.group.${groupId}`] = title;
}


for (const [unitId, name] of Object.entries(UNIT_NAMES)) {
  strings[`mass.unit.${unitId}.name`] = name;
  strings[`mass.unit.${unitId}.short`] = UNIT_SHORTS[unitId];
}


export const meta = {
  id: "mass",

  title: {
    ru: "Масса",
    en: "Mass",
    es: "Masa",
    fr: "Masse",
    de: "Masse",
    zh: "质量"
  },

  description: {
    ru: "Введите массу — получите все единицы измерения.",
    en: "Enter a mass — get all mass units.",
    es: "Introduce una masa y obtén todas las unidades.",
    fr: "Saisissez une masse pour obtenir toutes les unités.",
    de: "Masse eingeben und alle Masseeinheiten erhalten.",
    zh: "输入质量，获取所有质量单位。"
  },

  category: "converters",
  resultPanel: false,

  strings
};