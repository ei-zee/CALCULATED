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
    ru: "Английские",
    en: "Imperial",
    es: "Imperial",
    fr: "Impérial",
    de: "Imperial",
    zh: "英制"
  },

  russian: {
    ru: "Русские",
    en: "Russian",
    es: "Rusas",
    fr: "Russes",
    de: "Russisch",
    zh: "俄制"
  },

  astro: {
    ru: "Астро.",
    en: "Astron.",
    es: "Astron.",
    fr: "Astro",
    de: "Astron.",
    zh: "天文"
  }
};


const UNIT_NAMES = {
  nm: {
    ru: "Нанометры", en: "Nanometers", es: "Nanómetros",
    fr: "Nanomètres", de: "Nanometer", zh: "纳米"
  },
  um: {
    ru: "Микрометры", en: "Micrometers", es: "Micrómetros",
    fr: "Micromètres", de: "Mikrometer", zh: "微米"
  },
  mm: {
    ru: "Миллиметры", en: "Millimeters", es: "Milímetros",
    fr: "Millimètres", de: "Millimeter", zh: "毫米"
  },
  cm: {
    ru: "Сантиметры", en: "Centimeters", es: "Centímetros",
    fr: "Centimètres", de: "Zentimeter", zh: "厘米"
  },
  dm: {
    ru: "Дециметры", en: "Decimeters", es: "Decímetros",
    fr: "Décimètres", de: "Dezimeter", zh: "分米"
  },
  m: {
    ru: "Метры", en: "Meters", es: "Metros",
    fr: "Mètres", de: "Meter", zh: "米"
  },
  hm: {
    ru: "Гектометры", en: "Hectometers", es: "Hectómetros",
    fr: "Hectomètres", de: "Hektometer", zh: "百米"
  },
  km: {
    ru: "Километры", en: "Kilometers", es: "Kilómetros",
    fr: "Kilomètres", de: "Kilometer", zh: "千米"
  },

  in: {
    ru: "Дюймы", en: "Inches", es: "Pulgadas",
    fr: "Pouces", de: "Zoll", zh: "英寸"
  },
  ft: {
    ru: "Футы", en: "Feet", es: "Pies",
    fr: "Pieds", de: "Fuß", zh: "英尺"
  },
  yd: {
    ru: "Ярды", en: "Yards", es: "Yardas",
    fr: "Yards", de: "Yard", zh: "码"
  },
  fathom: {
    ru: "Морские сажени", en: "Fathoms", es: "Braza",
    fr: "Brasses", de: "Faden", zh: "英寻"
  },
  chain: {
    ru: "Чейны", en: "Chains", es: "Cadenas",
    fr: "Chaînes", de: "Chain", zh: "链"
  },
  furlong: {
    ru: "Фурлонги", en: "Furlongs", es: "Furlongs",
    fr: "Furlongs", de: "Furlong", zh: "弗隆"
  },
  mi: {
    ru: "Мили", en: "Miles", es: "Millas",
    fr: "Miles", de: "Meilen", zh: "英里"
  },
  nmi: {
    ru: "Морские мили", en: "Nautical miles", es: "Millas náuticas",
    fr: "Milles marins", de: "Seemeilen", zh: "海里"
  },

  liniya: {
    ru: "Линии", en: "Lines", es: "Líneas",
    fr: "Lignes", de: "Linien", zh: "线"
  },
  dyuym: {
    ru: "Дюймы", en: "Inches", es: "Pulgadas",
    fr: "Pouces", de: "Zoll", zh: "英寸"
  },
  vershok: {
    ru: "Вершки", en: "Vershoks", es: "Vershoks",
    fr: "Vershoks", de: "Werschok", zh: "维尔绍克"
  },
  pyad: {
    ru: "Пяди", en: "Pyads", es: "Pyads",
    fr: "Pyads", de: "Pad", zh: "佩德"
  },
  fut: {
    ru: "Футы", en: "Feet", es: "Pies",
    fr: "Pieds", de: "Fuß", zh: "英尺"
  },
  arshin: {
    ru: "Аршины", en: "Arshins", es: "Arshins",
    fr: "Archines", de: "Arschin", zh: "阿尔申"
  },
  sazhen: {
    ru: "Сажени", en: "Sazhens", es: "Sazhens",
    fr: "Sajènes", de: "Saschen", zh: "萨真"
  },
  versta: {
    ru: "Вёрсты", en: "Verstas", es: "Verstas",
    fr: "Verstes", de: "Werst", zh: "俄里"
  },

  "light-second": {
    ru: "Световые секунды", en: "Light seconds", es: "Segundos luz",
    fr: "Secondes lumière", de: "Lichtsekunden", zh: "光秒"
  },
  "light-minute": {
    ru: "Световые минуты", en: "Light minutes", es: "Minutos luz",
    fr: "Minutes lumière", de: "Lichtminuten", zh: "光分"
  },
  "light-hour": {
    ru: "Световые часы", en: "Light hours", es: "Horas luz",
    fr: "Heures lumière", de: "Lichtstunden", zh: "光时"
  },
  "light-day": {
    ru: "Световые сутки", en: "Light days", es: "Días luz",
    fr: "Jours lumière", de: "Lichttage", zh: "光天"
  },
  au: {
    ru: "Астрономические единицы", en: "Astronomical units", es: "Unidades astronómicas",
    fr: "Unités astronomiques", de: "Astronomische Einheiten", zh: "天文单位"
  },
  ly: {
    ru: "Световые годы", en: "Light years", es: "Años luz",
    fr: "Années lumière", de: "Lichtjahre", zh: "光年"
  },
  pc: {
    ru: "Парсеки", en: "Parsecs", es: "Pársecs",
    fr: "Parsecs", de: "Parsec", zh: "秒差距"
  },
  kpc: {
    ru: "Килопарсеки", en: "Kiloparsecs", es: "Kilopársecs",
    fr: "Kiloparsecs", de: "Kiloparsec", zh: "千秒差距"
  }
};


const UNIT_SHORTS = {
  nm: {
    ru: "нм", en: "nm", es: "nm", fr: "nm", de: "nm", zh: "纳米"
  },
  um: {
    ru: "мкм", en: "µm", es: "µm", fr: "µm", de: "µm", zh: "微米"
  },
  mm: {
    ru: "мм", en: "mm", es: "mm", fr: "mm", de: "mm", zh: "毫米"
  },
  cm: {
    ru: "см", en: "cm", es: "cm", fr: "cm", de: "cm", zh: "厘米"
  },
  dm: {
    ru: "дм", en: "dm", es: "dm", fr: "dm", de: "dm", zh: "分米"
  },
  m: {
    ru: "м", en: "m", es: "m", fr: "m", de: "m", zh: "米"
  },
  hm: {
    ru: "гм", en: "hm", es: "hm", fr: "hm", de: "hm", zh: "百米"
  },
  km: {
    ru: "км", en: "km", es: "km", fr: "km", de: "km", zh: "千米"
  },

  in: {
    ru: "дюйм", en: "in", es: "in", fr: "in", de: "in", zh: "英寸"
  },
  ft: {
    ru: "фут", en: "ft", es: "ft", fr: "ft", de: "ft", zh: "英尺"
  },
  yd: {
    ru: "ярд", en: "yd", es: "yd", fr: "yd", de: "yd", zh: "码"
  },
  fathom: {
    ru: "фатом", en: "fathom", es: "braza", fr: "brasse", de: "Faden", zh: "英寻"
  },
  chain: {
    ru: "чейн", en: "chain", es: "chain", fr: "chain", de: "Chain", zh: "链"
  },
  furlong: {
    ru: "фурлонг", en: "furlong", es: "furlong", fr: "furlong", de: "Furlong", zh: "弗隆"
  },
  mi: {
    ru: "миля", en: "mi", es: "mi", fr: "mi", de: "mi", zh: "英里"
  },
  nmi: {
    ru: "м. миля", en: "nmi", es: "nmi", fr: "nmi", de: "nmi", zh: "海里"
  },

  liniya: {
    ru: "линия", en: "line", es: "línea", fr: "ligne", de: "Linie", zh: "线"
  },
  dyuym: {
    ru: "дюйм", en: "in", es: "in", fr: "in", de: "in", zh: "英寸"
  },
  vershok: {
    ru: "вершок", en: "vershok", es: "vershok", fr: "vershok", de: "Werschok", zh: "维尔绍克"
  },
  pyad: {
    ru: "пядь", en: "pyad", es: "pyad", fr: "pyad", de: "Pad", zh: "佩德"
  },
  fut: {
    ru: "фут", en: "ft", es: "ft", fr: "ft", de: "ft", zh: "英尺"
  },
  arshin: {
    ru: "аршин", en: "arshin", es: "arshin", fr: "archine", de: "Arschin", zh: "阿尔申"
  },
  sazhen: {
    ru: "сажень", en: "sazhen", es: "sazhen", fr: "sajène", de: "Saschen", zh: "萨真"
  },
  versta: {
    ru: "верста", en: "versta", es: "versta", fr: "verste", de: "Werst", zh: "俄里"
  },

  "light-second": {
    ru: "св. с", en: "ls", es: "s luz", fr: "s lumière", de: "Ls", zh: "光秒"
  },
  "light-minute": {
    ru: "св. мин", en: "lm", es: "min luz", fr: "min lumière", de: "Lm", zh: "光分"
  },
  "light-hour": {
    ru: "св. ч", en: "lh", es: "h luz", fr: "h lumière", de: "Lh", zh: "光时"
  },
  "light-day": {
    ru: "св. сут", en: "ld", es: "d luz", fr: "j lumière", de: "Ld", zh: "光天"
  },
  au: {
    ru: "а.е.", en: "au", es: "ua", fr: "ua", de: "AE", zh: "天文单位"
  },
  ly: {
    ru: "св. год", en: "ly", es: "al", fr: "al", de: "Lj", zh: "光年"
  },
  pc: {
    ru: "пк", en: "pc", es: "pc", fr: "pc", de: "pc", zh: "秒差距"
  },
  kpc: {
    ru: "кпк", en: "kpc", es: "kpc", fr: "kpc", de: "kpc", zh: "千秒差距"
  }
};


const strings = {
  "length.inputLabel": {
    ru: "Введите длину",
    en: "Enter length",
    es: "Introduce una longitud",
    fr: "Saisissez une longueur",
    de: "Länge eingeben",
    zh: "输入长度"
  },

  "length.baseLabel": {
    ru: "м",
    en: "m",
    es: "m",
    fr: "m",
    de: "m",
    zh: "米"
  }
};


for (const [groupId, title] of Object.entries(GROUP_TITLES)) {
  strings[`length.group.${groupId}`] = title;
}


for (const [unitId, name] of Object.entries(UNIT_NAMES)) {
  strings[`length.unit.${unitId}.name`] = name;
  strings[`length.unit.${unitId}.short`] = UNIT_SHORTS[unitId];
}


export const meta = {
  id: "length",
  title: {
    ru: "Длина и расстояние",
    en: "Length and distance",
    es: "Longitud y distancia",
    fr: "Longueur et distance",
    de: "Länge und Entfernung",
    zh: "长度与距离"
  },

  description: {
    ru: "Введите число — получите все единицы длины.",
    en: "Enter a number — get all length units.",
    es: "Introduce un número y obtén todas las unidades de longitud.",
    fr: "Saisissez un nombre pour obtenir toutes les unités de longueur.",
    de: "Zahl eingeben und alle Längeneinheiten erhalten.",
    zh: "输入数字，获取所有长度单位。"
  },

  category: "converters",
  resultPanel: false,

  strings
};