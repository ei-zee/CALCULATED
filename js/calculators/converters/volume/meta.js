const GROUP_TITLES = {
  metric: {
    ru: "Метрич.",
    en: "Metric",
    es: "Métrico",
    fr: "Métrique",
    de: "Metrisch",
    zh: "公制"
  },

  us: {
    ru: "Американ.",
    en: "US",
    es: "EE. UU.",
    fr: "US",
    de: "US",
    zh: "美制"
  },

  imperial: {
    ru: "Британ.",
    en: "Imperial",
    es: "Imperial",
    fr: "Impérial",
    de: "Imperial",
    zh: "英制"
  }
};


const UNIT_NAMES = {
  ml: {
    ru: "Миллилитры", en: "Milliliters", es: "Mililitros",
    fr: "Millilitres", de: "Milliliter", zh: "毫升"
  },
  cl: {
    ru: "Сантилитры", en: "Centiliters", es: "Centilitros",
    fr: "Centilitres", de: "Zentiliter", zh: "厘升"
  },
  dl: {
    ru: "Децилитры", en: "Deciliters", es: "Decilitros",
    fr: "Décilitres", de: "Deziliter", zh: "分升"
  },
  l: {
    ru: "Литры", en: "Liters", es: "Litros",
    fr: "Litres", de: "Liter", zh: "升"
  },
  hl: {
    ru: "Гектолитры", en: "Hectoliters", es: "Hectolitros",
    fr: "Hectolitres", de: "Hektoliter", zh: "百升"
  },
  cm3: {
    ru: "Кубические сантиметры", en: "Cubic centimeters", es: "Centímetros cúbicos",
    fr: "Centimètres cubes", de: "Kubikzentimeter", zh: "立方厘米"
  },
  dm3: {
    ru: "Кубические дециметры", en: "Cubic decimeters", es: "Decímetros cúbicos",
    fr: "Décimètres cubes", de: "Kubikdezimeter", zh: "立方分米"
  },
  m3: {
    ru: "Кубические метры", en: "Cubic meters", es: "Metros cúbicos",
    fr: "Mètres cubes", de: "Kubikmeter", zh: "立方米"
  },

  "us-tsp": {
    ru: "Чайные ложки US", en: "US teaspoons", es: "Cucharaditas de EE. UU.",
    fr: "Cuillères à café US", de: "US-Teelöffel", zh: "美制茶匙"
  },
  "us-tbsp": {
    ru: "Столовые ложки US", en: "US tablespoons", es: "Cucharadas de EE. UU.",
    fr: "Cuillères à soupe US", de: "US-Esslöffel", zh: "美制汤匙"
  },
  "us-floz": {
    ru: "Жидкие унции US", en: "US fluid ounces", es: "Onzas líquidas de EE. UU.",
    fr: "Onces liquides US", de: "US-Flüssigunzen", zh: "美制液量盎司"
  },
  "us-cup": {
    ru: "Чашки US", en: "US cups", es: "Tazas de EE. UU.",
    fr: "Tasses US", de: "US-Cups", zh: "美制杯"
  },
  "us-gill": {
    ru: "Джиллы US", en: "US gills", es: "Gills de EE. UU.",
    fr: "Gills US", de: "US-Gill", zh: "美制及耳"
  },
  "us-pint": {
    ru: "Жидкие пинты US", en: "US liquid pints", es: "Pintas líquidas de EE. UU.",
    fr: "Pintes liquides US", de: "US-Flüssigpinten", zh: "美制品脱"
  },
  "us-quart": {
    ru: "Жидкие кварты US", en: "US liquid quarts", es: "Cuartos líquidos de EE. UU.",
    fr: "Quarts liquides US", de: "US-Flüssigquarts", zh: "美制液量夸脱"
  },
  "us-gallon": {
    ru: "Жидкие галлоны US", en: "US liquid gallons", es: "Galones líquidos de EE. UU.",
    fr: "Gallons liquides US", de: "US-Flüssiggallonen", zh: "美制液量加仑"
  },

  "uk-floz": {
    ru: "Жидкие унции UK", en: "UK fluid ounces", es: "Onzas líquidas del Reino Unido",
    fr: "Onces liquides UK", de: "UK-Flüssigunzen", zh: "英制液量盎司"
  },
  "uk-gill": {
    ru: "Джиллы UK", en: "UK gills", es: "Gills del Reino Unido",
    fr: "Gills UK", de: "UK-Gill", zh: "英制及耳"
  },
  "uk-pint": {
    ru: "Пинты UK", en: "UK pints", es: "Pintas del Reino Unido",
    fr: "Pintes UK", de: "UK-Pinten", zh: "英制品脱"
  },
  "uk-quart": {
    ru: "Кварты UK", en: "UK quarts", es: "Cuartos del Reino Unido",
    fr: "Quarts UK", de: "UK-Quarts", zh: "英制夸脱"
  },
  "uk-gallon": {
    ru: "Галлоны UK", en: "UK gallons", es: "Galones del Reino Unido",
    fr: "Gallons UK", de: "UK-Gallonen", zh: "英制加仑"
  },
  in3: {
    ru: "Кубические дюймы", en: "Cubic inches", es: "Pulgadas cúbicas",
    fr: "Pouces cubes", de: "Kubikzoll", zh: "立方英寸"
  },
  ft3: {
    ru: "Кубические футы", en: "Cubic feet", es: "Pies cúbicos",
    fr: "Pieds cubes", de: "Kubikfuß", zh: "立方英尺"
  },
  yd3: {
    ru: "Кубические ярды", en: "Cubic yards", es: "Yardas cúbicas",
    fr: "Yards cubes", de: "Kubikyard", zh: "立方码"
  }
};


const UNIT_SHORTS = {
  ml: {
    ru: "мл", en: "ml", es: "ml", fr: "ml", de: "ml", zh: "毫升"
  },
  cl: {
    ru: "сл", en: "cl", es: "cl", fr: "cl", de: "cl", zh: "厘升"
  },
  dl: {
    ru: "дл", en: "dl", es: "dl", fr: "dl", de: "dl", zh: "分升"
  },
  l: {
    ru: "л", en: "l", es: "l", fr: "l", de: "l", zh: "升"
  },
  hl: {
    ru: "гл", en: "hl", es: "hl", fr: "hl", de: "hl", zh: "百升"
  },
  cm3: {
    ru: "см³", en: "cm³", es: "cm³", fr: "cm³", de: "cm³", zh: "立方厘米"
  },
  dm3: {
    ru: "дм³", en: "dm³", es: "dm³", fr: "dm³", de: "dm³", zh: "立方分米"
  },
  m3: {
    ru: "м³", en: "m³", es: "m³", fr: "m³", de: "m³", zh: "立方米"
  },

  "us-tsp": {
    ru: "ч. л. US", en: "tsp US", es: "cdta. EE. UU.", fr: "cc US", de: "TL US", zh: "美茶匙"
  },
  "us-tbsp": {
    ru: "ст. л. US", en: "tbsp US", es: "cda. EE. UU.", fr: "cs US", de: "EL US", zh: "美汤匙"
  },
  "us-floz": {
    ru: "fl oz US", en: "fl oz US", es: "fl oz EE. UU.", fr: "fl oz US", de: "fl oz US", zh: "美液盎司"
  },
  "us-cup": {
    ru: "cup US", en: "cup US", es: "taza EE. UU.", fr: "tasse US", de: "Cup US", zh: "美杯"
  },
  "us-gill": {
    ru: "gi US", en: "gi US", es: "gi EE. UU.", fr: "gi US", de: "gi US", zh: "美及耳"
  },
  "us-pint": {
    ru: "pt US", en: "pt US", es: "pt EE. UU.", fr: "pt US", de: "pt US", zh: "美品脱"
  },
  "us-quart": {
    ru: "qt US", en: "qt US", es: "qt EE. UU.", fr: "qt US", de: "qt US", zh: "美夸脱"
  },
  "us-gallon": {
    ru: "gal US", en: "gal US", es: "gal EE. UU.", fr: "gal US", de: "gal US", zh: "美加仑"
  },

  "uk-floz": {
    ru: "fl oz UK", en: "fl oz UK", es: "fl oz RU", fr: "fl oz UK", de: "fl oz UK", zh: "英液盎司"
  },
  "uk-gill": {
    ru: "gi UK", en: "gi UK", es: "gi RU", fr: "gi UK", de: "gi UK", zh: "英及耳"
  },
  "uk-pint": {
    ru: "pt UK", en: "pt UK", es: "pt RU", fr: "pt UK", de: "pt UK", zh: "英品脱"
  },
  "uk-quart": {
    ru: "qt UK", en: "qt UK", es: "qt RU", fr: "qt UK", de: "qt UK", zh: "英夸脱"
  },
  "uk-gallon": {
    ru: "gal UK", en: "gal UK", es: "gal RU", fr: "gal UK", de: "gal UK", zh: "英加仑"
  },
  in3: {
    ru: "in³", en: "in³", es: "in³", fr: "in³", de: "in³", zh: "立方英寸"
  },
  ft3: {
    ru: "ft³", en: "ft³", es: "ft³", fr: "ft³", de: "ft³", zh: "立方英尺"
  },
  yd3: {
    ru: "yd³", en: "yd³", es: "yd³", fr: "yd³", de: "yd³", zh: "立方码"
  }
};


const strings = {
  "volume.inputLabel": {
    ru: "Введите объём",
    en: "Enter volume",
    es: "Introduce un volumen",
    fr: "Saisissez un volume",
    de: "Volumen eingeben",
    zh: "输入体积"
  },

  "volume.baseLabel": {
    ru: "л",
    en: "l",
    es: "l",
    fr: "l",
    de: "l",
    zh: "升"
  }
};


for (const [groupId, title] of Object.entries(GROUP_TITLES)) {
  strings[`volume.group.${groupId}`] = title;
}


for (const [unitId, name] of Object.entries(UNIT_NAMES)) {
  strings[`volume.unit.${unitId}.name`] = name;
  strings[`volume.unit.${unitId}.short`] = UNIT_SHORTS[unitId];
}


export const meta = {
  id: "volume",

  title: {
    ru: "Объём и вместимость",
    en: "Volume and capacity",
    es: "Volumen y capacidad",
    fr: "Volume et capacité",
    de: "Volumen und Fassungsvermögen",
    zh: "体积与容量"
  },

  description: {
    ru: "Введите объём — получите все единицы измерения.",
    en: "Enter a volume — get all volume units.",
    es: "Introduce un volumen y obtén todas las unidades.",
    fr: "Saisissez un volume pour obtenir toutes les unités.",
    de: "Volumen eingeben und alle Volumeneinheiten erhalten.",
    zh: "输入体积，获取所有体积单位。"
  },

  category: "converters",
  resultPanel: false,

  strings
};