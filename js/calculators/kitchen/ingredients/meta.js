export const meta = {
  id: "kitchen-ingredients",


  title: {
    ru: "Ингредиенты",
    en: "Ingredients",
    es: "Ingredientes",
    fr: "Ingrédients",
    de: "Zutaten",
    zh: "食材"
  },


  description: {
    ru: "Переведи граммы в ложки, стаканы, миллилитры и другие меры.",
    en: "Convert grams to spoons, cups, milliliters and other measures.",
    es: "Convierte gramos en cucharadas, tazas, mililitros y otras medidas.",
    fr: "Convertissez les grammes en cuillères, tasses, millilitres et autres mesures.",
    de: "Gramm in Löffel, Tassen, Milliliter und andere Maße umrechnen.",
    zh: "将克转换为勺、杯、毫升及其他计量单位。"
  },


  category: "kitchen",
  resultPanel: true,


  strings: {
    "kitchen.status.start": {
      ru: "Выбери ингредиент и введи количество",
      en: "Choose an ingredient and enter the amount",
      es: "Elige un ingrediente e introduce la cantidad",
      fr: "Choisissez un ingrédient et saisissez la quantité",
      de: "Zutat wählen und Menge eingeben",
      zh: "选择食材并输入数量"
    },


    "kitchen.status.result": {
      ru: "{name}: {grams} г",
      en: "{name}: {grams} g",
      es: "{name}: {grams} g",
      fr: "{name} : {grams} g",
      de: "{name}: {grams} g",
      zh: "{name}：{grams} 克"
    },


    "kitchen.amountLabel": {
      ru: "Количество",
      en: "Amount",
      es: "Cantidad",
      fr: "Quantité",
      de: "Menge",
      zh: "数量"
    },


    "kitchen.ingredientLabel": {
      ru: "Ингредиент",
      en: "Ingredient",
      es: "Ingrediente",
      fr: "Ingrédient",
      de: "Zutat",
      zh: "食材"
    },


    "kitchen.unitLabel": {
      ru: "Единица ввода",
      en: "Input unit",
      es: "Unidad de entrada",
      fr: "Unité d’entrée",
      de: "Eingabeeinheit",
      zh: "输入单位"
    },


    "kitchen.outputLabel": {
      ru: "Результат — нажми, чтобы перенести",
      en: "Result — tap to transfer",
      es: "Resultado — toca para transferir",
      fr: "Résultat — touchez pour transférer",
      de: "Ergebnis — zum Übertragen tippen",
      zh: "结果 — 点击以传输"
    },


    "kitchen.quick.title": {
      ru: "Быстрый ввод",
      en: "Quick input",
      es: "Entrada rápida",
      fr: "Saisie rapide",
      de: "Schnelleingabe",
      zh: "快速输入"
    },


    "kitchen.hint": {
      ru: "Выбери меру в результатах — значение уйдёт в панель результата.",
      en: "Pick a measure in the results — the value goes to the result panel.",
      es: "Elige una medida en los resultados — el valor va al panel de resultados.",
      fr: "Choisissez une mesure dans les résultats — la valeur va au panneau de résultats.",
      de: "Wähle im Ergebnis eine Maßeinheit — der Wert geht ins Ergebnisplayout.",
      zh: "在结果中选择单位 — 数值将进入结果面板。"
    },


    "kitchen.group.metric": {
      ru: "Метрические",
      en: "Metric",
      es: "Métricas",
      fr: "Métriques",
      de: "Metrisch",
      zh: "公制"
    },


    "kitchen.group.russian": {
      ru: "Стаканы и ложки",
      en: "Cups and spoons",
      es: "Tazas y cucharas",
      fr: "Tasses et cuillères",
      de: "Tassen und Löffel",
      zh: "杯和勺"
    },


    "kitchen.group.us": {
      ru: "Английские / американские",
      en: "US / Imperial",
      es: "EE. UU. / Imperial",
      fr: "US / Impérial",
      de: "US / Imperial",
      zh: "美制 / 英制"
    },


    "kitchen.unit.g": {
      ru: "г",
      en: "g",
      es: "g",
      fr: "g",
      de: "g",
      zh: "克"
    },


    "kitchen.unit.kg": {
      ru: "кг",
      en: "kg",
      es: "kg",
      fr: "kg",
      de: "kg",
      zh: "千克"
    },


    "kitchen.unit.ml": {
      ru: "мл",
      en: "ml",
      es: "ml",
      fr: "ml",
      de: "ml",
      zh: "毫升"
    },


    "kitchen.unit.l": {
      ru: "л",
      en: "l",
      es: "l",
      fr: "l",
      de: "l",
      zh: "升"
    },


    "kitchen.unit.cup-200": {
      ru: "стакан 200 мл",
      en: "cup 200 ml",
      es: "taza 200 ml",
      fr: "tasse 200 ml",
      de: "Tasse 200 ml",
      zh: "杯 200 毫升"
    },


    "kitchen.unit.cup-250": {
      ru: "стакан 250 мл",
      en: "cup 250 ml",
      es: "taza 250 ml",
      fr: "tasse 250 ml",
      de: "Tasse 250 ml",
      zh: "杯 250 毫升"
    },


    "kitchen.unit.tbsp": {
      ru: "ст. ложка",
      en: "tablespoon",
      es: "cucharada",
      fr: "cuillère à soupe",
      de: "Esslöffel",
      zh: "汤匙"
    },


    "kitchen.unit.tsp": {
      ru: "ч. ложка",
      en: "teaspoon",
      es: "cucharadita",
      fr: "cuillère à café",
      de: "Teelöffel",
      zh: "茶匙"
    },


    "kitchen.unit.cup-us": {
      ru: "cup",
      en: "cup",
      es: "taza",
      fr: "tasse",
      de: "Cup",
      zh: "杯"
    },


    "kitchen.unit.floz": {
      ru: "fl oz",
      en: "fl oz",
      es: "fl oz",
      fr: "fl oz",
      de: "fl oz",
      zh: "液量盎司"
    },


    "kitchen.unit.pint": {
      ru: "пинта",
      en: "pint",
      es: "pinta",
      fr: "pinte",
      de: "Pint",
      zh: "品脱"
    },


    "kitchen.unit.quart": {
      ru: "кварта",
      en: "quart",
      es: "cuarto",
      fr: "quart",
      de: "Quart",
      zh: "夸脱"
    },


    "kitchen.unit.gallon": {
      ru: "галлон",
      en: "gallon",
      es: "galón",
      fr: "gallon",
      de: "Gallone",
      zh: "加仑"
    },


    "kitchen.unit.oz": {
      ru: "oz",
      en: "oz",
      es: "oz",
      fr: "oz",
      de: "oz",
      zh: "盎司"
    },


    "kitchen.unit.lb": {
      ru: "lb",
      en: "lb",
      es: "lb",
      fr: "lb",
      de: "lb",
      zh: "磅"
    },


    "kitchen.ingredient.water": {
      ru: "Вода",
      en: "Water",
      es: "Agua",
      fr: "Eau",
      de: "Wasser",
      zh: "水"
    },


    "kitchen.ingredient.milk": {
      ru: "Молоко",
      en: "Milk",
      es: "Leche",
      fr: "Lait",
      de: "Milch",
      zh: "牛奶"
    },


    "kitchen.ingredient.flour": {
      ru: "Мука",
      en: "Flour",
      es: "Harina",
      fr: "Farine",
      de: "Mehl",
      zh: "面粉"
    },


    "kitchen.ingredient.sugar": {
      ru: "Сахар",
      en: "Sugar",
      es: "Azúcar",
      fr: "Sucre",
      de: "Zucker",
      zh: "糖"
    },


    "kitchen.ingredient.powderedSugar": {
      ru: "Сахарная пудра",
      en: "Powdered sugar",
      es: "Azúcar glas",
      fr: "Sucre glace",
      de: "Puderzucker",
      zh: "糖粉"
    },


    "kitchen.ingredient.salt": {
      ru: "Соль",
      en: "Salt",
      es: "Sal",
      fr: "Sel",
      de: "Salz",
      zh: "盐"
    },


    "kitchen.ingredient.rice": {
      ru: "Рис",
      en: "Rice",
      es: "Arroz",
      fr: "Riz",
      de: "Reis",
      zh: "米"
    },


    "kitchen.ingredient.buckwheat": {
      ru: "Гречка",
      en: "Buckwheat",
      es: "Trigo sarraceno",
      fr: "Sarrasin",
      de: "Buchweizen",
      zh: "荞麦"
    },


    "kitchen.ingredient.oats": {
      ru: "Овсяные хлопья",
      en: "Oats",
      es: "Copos de avena",
      fr: "Flocons d’avoine",
      de: "Haferflocken",
      zh: "燕麦片"
    },


    "kitchen.ingredient.butter": {
      ru: "Масло сливочное",
      en: "Butter",
      es: "Mantequilla",
      fr: "Beurre",
      de: "Butter",
      zh: "黄油"
    },


    "kitchen.ingredient.vegetableOil": {
      ru: "Масло растительное",
      en: "Vegetable oil",
      es: "Aceite vegetal",
      fr: "Huile végétale",
      de: "Pflanzenöl",
      zh: "植物油"
    },


    "kitchen.ingredient.sourCream": {
      ru: "Сметана",
      en: "Sour cream",
      es: "Crema agria",
      fr: "Crème aigre",
      de: "Saure Sahne",
      zh: "酸奶油"
    },


    "kitchen.ingredient.honey": {
      ru: "Мёд",
      en: "Honey",
      es: "Miel",
      fr: "Miel",
      de: "Honig",
      zh: "蜂蜜"
    },


    "kitchen.ingredient.cocoa": {
      ru: "Какао",
      en: "Cocoa",
      es: "Cacao",
      fr: "Cacao",
      de: "Kakao",
      zh: "可可粉"
    },


    "kitchen.ingredient.starch": {
      ru: "Крахмал",
      en: "Starch",
      es: "Almidón",
      fr: "Fécule",
      de: "Stärke",
      zh: "淀粉"
    },
    "kitchen.weightLabel": {
  ru: "Вес",
  en: "Weight",
  es: "Peso",
  fr: "Poids",
  de: "Gewicht",
  zh: "重量"
},


"kitchen.alternativesLabel": {
  ru: "Это также:",
  en: "Also equals:",
  es: "También equivale a:",
  fr: "Équivaut aussi à :",
  de: "Entspricht auch:",
  zh: "也等于："
},
"kitchen.presetsLabel": {
  ru: "Быстрый выбор",
  en: "Quick pick",
  es: "Elección rápida",
  fr: "Choix rapide",
  de: "Schnellauswahl",
  zh: "快速选择"
},


"kitchen.resultsLabel": {
  ru: "Результаты — нажми, чтобы перенести",
  en: "Results — tap to transfer",
  es: "Resultados — toca para transferir",
  fr: "Résultats — touchez pour transférer",
  de: "Ergebnisse — zum Übertragen tippen",
  zh: "结果 — 点击以传输"
},
"kitchen.preset.riceCup": {
  ru: "Рис · стакан",
  en: "Rice · cup",
  es: "Arroz · taza",
  fr: "Riz · tasse",
  de: "Reis · Tasse",
  zh: "米 · 杯"
},


"kitchen.preset.oilTbsp": {
  ru: "Масло · ст. л.",
  en: "Oil · tbsp",
  es: "Aceite · cda",
  fr: "Huile · cs",
  de: "Öl · EL",
  zh: "油 · 汤匙"
},


"kitchen.preset.flourKg": {
  ru: "Мука · кг",
  en: "Flour · kg",
  es: "Harina · kg",
  fr: "Farine · kg",
  de: "Mehl · kg",
  zh: "面粉 · 千克"
},


"kitchen.preset.flourCup": {
  ru: "Мука · стакан",
  en: "Flour · cup",
  es: "Harina · taza",
  fr: "Farine · tasse",
  de: "Mehl · Tasse",
  zh: "面粉 · 杯"
},


"kitchen.preset.sugarTbsp": {
  ru: "Сахар · ст. л.",
  en: "Sugar · tbsp",
  es: "Azúcar · cda",
  fr: "Sucre · cs",
  de: "Zucker · EL",
  zh: "糖 · 汤匙"
},


"kitchen.preset.waterCup": {
  ru: "Вода · стакан",
  en: "Water · cup",
  es: "Agua · taza",
  fr: "Eau · tasse",
  de: "Wasser · Tasse",
  zh: "水 · 杯"
},


  }
  };