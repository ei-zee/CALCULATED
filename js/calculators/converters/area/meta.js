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
  um2: {
    ru: "Квадратные микрометры", en: "Square micrometers", es: "Micrómetros cuadrados",
    fr: "Micromètres carrés", de: "Quadratmikrometer", zh: "平方微米"
  },
  mm2: {
    ru: "Квадратные миллиметры", en: "Square millimeters", es: "Milímetros cuadrados",
    fr: "Millimètres carrés", de: "Quadratmillimeter", zh: "平方毫米"
  },
  cm2: {
    ru: "Квадратные сантиметры", en: "Square centimeters", es: "Centímetros cuadrados",
    fr: "Centimètres carrés", de: "Quadratzentimeter", zh: "平方厘米"
  },
  dm2: {
    ru: "Квадратные дециметры", en: "Square decimeters", es: "Decímetros cuadrados",
    fr: "Décimètres carrés", de: "Quadratdezimeter", zh: "平方分米"
  },
  m2: {
    ru: "Квадратные метры", en: "Square meters", es: "Metros cuadrados",
    fr: "Mètres carrés", de: "Quadratmeter", zh: "平方米"
  },
  are: {
    ru: "Ары / сотки", en: "Ares", es: "Áreas",
    fr: "Ares", de: "Ar", zh: "公亩"
  },
  hectare: {
    ru: "Гектары", en: "Hectares", es: "Hectáreas",
    fr: "Hectares", de: "Hektar", zh: "公顷"
  },
  km2: {
    ru: "Квадратные километры", en: "Square kilometers", es: "Kilómetros cuadrados",
    fr: "Kilomètres carrés", de: "Quadratkilometer", zh: "平方千米"
  },

  in2: {
    ru: "Квадратные дюймы", en: "Square inches", es: "Pulgadas cuadradas",
    fr: "Pouces carrés", de: "Quadratzoll", zh: "平方英寸"
  },
  ft2: {
    ru: "Квадратные футы", en: "Square feet", es: "Pies cuadrados",
    fr: "Pieds carrés", de: "Quadratfuß", zh: "平方英尺"
  },
  yd2: {
    ru: "Квадратные ярды", en: "Square yards", es: "Yardas cuadradas",
    fr: "Yards carrés", de: "Quadratyard", zh: "平方码"
  },
  rod2: {
    ru: "Квадратные роды", en: "Square rods", es: "Rods cuadrados",
    fr: "Rods carrés", de: "Quadratrod", zh: "平方杆"
  },
  chain2: {
    ru: "Квадратные чейны", en: "Square chains", es: "Cadenas cuadradas",
    fr: "Chaînes carrées", de: "Quadratchain", zh: "平方链"
  },
  furlong2: {
    ru: "Квадратные фурлонги", en: "Square furlongs", es: "Furlongs cuadrados",
    fr: "Furlongs carrés", de: "Quadratfurlong", zh: "平方弗隆"
  },
  acre: {
    ru: "Международные акры", en: "International acres", es: "Acres internacionales",
    fr: "Acres internationaux", de: "Internationale Acre", zh: "国际英亩"
  },
  mi2: {
    ru: "Квадратные мили", en: "Square miles", es: "Millas cuadradas",
    fr: "Miles carrés", de: "Quadratmeilen", zh: "平方英里"
  },

  vershok2: {
    ru: "Квадратные вершки", en: "Square vershoks", es: "Vershoks cuadrados",
    fr: "Vershoks carrés", de: "Quadratwerschok", zh: "平方维尔绍克"
  },
  pyad2: {
    ru: "Квадратные пяди", en: "Square pyads", es: "Pyads cuadrados",
    fr: "Pyads carrés", de: "Quadratpad", zh: "平方佩德"
  },
  arshin2: {
    ru: "Квадратные аршины", en: "Square arshins", es: "Arshins cuadrados",
    fr: "Archines carrés", de: "Quadratarschin", zh: "平方阿尔申"
  },
  sazhen2: {
    ru: "Квадратные сажени", en: "Square sazhens", es: "Sazhens cuadrados",
    fr: "Sajènes carrées", de: "Quadratsaschen", zh: "平方萨真"
  },
  desyatina: {
    ru: "Казённые десятины", en: "State desyatinas", es: "Desyatinas estatales",
    fr: "Desyatines d’État", de: "Staatliche Desjatinen", zh: "官俄亩"
  },
  versta2: {
    ru: "Квадратные вёрсты", en: "Square verstas", es: "Verstas cuadrados",
    fr: "Verstes carrés", de: "Quadratwerst", zh: "平方俄里"
  }
};


const UNIT_SHORTS = {
  um2: {
    ru: "мкм²", en: "µm²", es: "µm²", fr: "µm²", de: "µm²", zh: "平方微米"
  },
  mm2: {
    ru: "мм²", en: "mm²", es: "mm²", fr: "mm²", de: "mm²", zh: "平方毫米"
  },
  cm2: {
    ru: "см²", en: "cm²", es: "cm²", fr: "cm²", de: "cm²", zh: "平方厘米"
  },
  dm2: {
    ru: "дм²", en: "dm²", es: "dm²", fr: "dm²", de: "dm²", zh: "平方分米"
  },
  m2: {
    ru: "м²", en: "m²", es: "m²", fr: "m²", de: "m²", zh: "平方米"
  },
  are: {
    ru: "а", en: "a", es: "a", fr: "a", de: "a", zh: "公亩"
  },
  hectare: {
    ru: "га", en: "ha", es: "ha", fr: "ha", de: "ha", zh: "公顷"
  },
  km2: {
    ru: "км²", en: "km²", es: "km²", fr: "km²", de: "km²", zh: "平方千米"
  },

  in2: {
    ru: "in²", en: "in²", es: "in²", fr: "in²", de: "in²", zh: "平方英寸"
  },
  ft2: {
    ru: "ft²", en: "ft²", es: "ft²", fr: "ft²", de: "ft²", zh: "平方英尺"
  },
  yd2: {
    ru: "yd²", en: "yd²", es: "yd²", fr: "yd²", de: "yd²", zh: "平方码"
  },
  rod2: {
    ru: "rod²", en: "rod²", es: "rod²", fr: "rod²", de: "rod²", zh: "平方杆"
  },
  chain2: {
    ru: "ch²", en: "ch²", es: "ch²", fr: "ch²", de: "ch²", zh: "平方链"
  },
  furlong2: {
    ru: "fur²", en: "fur²", es: "fur²", fr: "fur²", de: "fur²", zh: "平方弗隆"
  },
  acre: {
    ru: "акр", en: "ac", es: "ac", fr: "ac", de: "ac", zh: "英亩"
  },
  mi2: {
    ru: "миля²", en: "mi²", es: "mi²", fr: "mi²", de: "mi²", zh: "平方英里"
  },

  vershok2: {
    ru: "вершок²", en: "vershok²", es: "vershok²", fr: "vershok²", de: "Werschok²", zh: "平方维尔绍克"
  },
  pyad2: {
    ru: "пядь²", en: "pyad²", es: "pyad²", fr: "pyad²", de: "Pad²", zh: "平方佩德"
  },
  arshin2: {
    ru: "аршин²", en: "arshin²", es: "arshin²", fr: "archine²", de: "Arschin²", zh: "平方阿尔申"
  },
  sazhen2: {
    ru: "сажень²", en: "sazhen²", es: "sazhen²", fr: "sajène²", de: "Saschen²", zh: "平方萨真"
  },
  desyatina: {
    ru: "дес.", en: "des.", es: "des.", fr: "des.", de: "Des.", zh: "俄亩"
  },
  versta2: {
    ru: "верста²", en: "versta²", es: "versta²", fr: "verste²", de: "Werst²", zh: "平方俄里"
  }
};


const strings = {
  "area.inputLabel": {
    ru: "Введите площадь",
    en: "Enter area",
    es: "Introduce un área",
    fr: "Saisissez une aire",
    de: "Fläche eingeben",
    zh: "输入面积"
  },

  "area.baseLabel": {
    ru: "м²",
    en: "m²",
    es: "m²",
    fr: "m²",
    de: "m²",
    zh: "平方米"
  }
};


for (const [groupId, title] of Object.entries(GROUP_TITLES)) {
  strings[`area.group.${groupId}`] = title;
}


for (const [unitId, name] of Object.entries(UNIT_NAMES)) {
  strings[`area.unit.${unitId}.name`] = name;
  strings[`area.unit.${unitId}.short`] = UNIT_SHORTS[unitId];
}


export const meta = {
  id: "area",

  title: {
    ru: "Площадь — единицы",
    en: "Area — units",
    es: "Área — unidades",
    fr: "Aire — unités",
    de: "Fläche — Einheiten",
    zh: "面积 — 单位"
  },

  description: {
    ru: "Введите площадь — получите все единицы измерения.",
    en: "Enter an area — get all area units.",
    es: "Introduce un área y obtén todas las unidades.",
    fr: "Saisissez une aire pour obtenir toutes les unités.",
    de: "Fläche eingeben und alle Flächeneinheiten erhalten.",
    zh: "输入面积，获取所有面积单位。"
  },

  category: "converters",
  resultPanel: false,

  strings
};