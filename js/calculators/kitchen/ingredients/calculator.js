const INGREDIENTS = [
  { id: 'water', nameKey: 'kitchen.ingredient.water', density: 1.0 },
  { id: 'milk', nameKey: 'kitchen.ingredient.milk', density: 1.03 },
  { id: 'flour', nameKey: 'kitchen.ingredient.flour', density: 0.64 },
  { id: 'sugar', nameKey: 'kitchen.ingredient.sugar', density: 0.8 },
  { id: 'powdered-sugar', nameKey: 'kitchen.ingredient.powderedSugar', density: 0.72 },
  { id: 'salt', nameKey: 'kitchen.ingredient.salt', density: 1.28 },
  { id: 'rice', nameKey: 'kitchen.ingredient.rice', density: 0.8 },
  { id: 'buckwheat', nameKey: 'kitchen.ingredient.buckwheat', density: 0.84 },
  { id: 'oats', nameKey: 'kitchen.ingredient.oats', density: 0.36 },
  { id: 'butter', nameKey: 'kitchen.ingredient.butter', density: 0.96 },
  { id: 'vegetable-oil', nameKey: 'kitchen.ingredient.vegetableOil', density: 0.92 },
  { id: 'sour-cream', nameKey: 'kitchen.ingredient.sourCream', density: 1.0 },
  { id: 'honey', nameKey: 'kitchen.ingredient.honey', density: 1.4 },
  { id: 'cocoa', nameKey: 'kitchen.ingredient.cocoa', density: 0.52 },
  { id: 'starch', nameKey: 'kitchen.ingredient.starch', density: 0.72 },
];


// Все меры — через объём или вес.
// Ложки: 1 ст. л. = 15 мл, 1 ч. л. = 5 мл.
const UNITS = [
  { id: 'g', key: 'kitchen.unit.g', kind: 'weight', factor: 1 },
  { id: 'kg', key: 'kitchen.unit.kg', kind: 'weight', factor: 1000 },
  { id: 'ml', key: 'kitchen.unit.ml', kind: 'volume', factor: 1 },
  { id: 'l', key: 'kitchen.unit.l', kind: 'volume', factor: 1000 },
  { id: 'cup-200', key: 'kitchen.unit.cup-200', kind: 'volume', factor: 200 },
  { id: 'cup-250', key: 'kitchen.unit.cup-250', kind: 'volume', factor: 250 },
  { id: 'tsp', key: 'kitchen.unit.tsp', kind: 'volume', factor: 5 },
  { id: 'tbsp', key: 'kitchen.unit.tbsp', kind: 'volume', factor: 15 },
  { id: 'cup-us', key: 'kitchen.unit.cup-us', kind: 'volume', factor: 236.588 },
  { id: 'floz', key: 'kitchen.unit.floz', kind: 'volume', factor: 29.5735 },
  { id: 'oz', key: 'kitchen.unit.oz', kind: 'weight', factor: 28.3495 },
  { id: 'lb', key: 'kitchen.unit.lb', kind: 'weight', factor: 453.592 },
];


const PRESETS = [
  { id: 'rice-cup', labelKey: 'kitchen.preset.riceCup', ingredientId: 'rice', value: '1', unitId: 'cup-250' },
  { id: 'oil-tbsp', labelKey: 'kitchen.preset.oilTbsp', ingredientId: 'vegetable-oil', value: '1', unitId: 'tbsp' },
  { id: 'flour-kg', labelKey: 'kitchen.preset.flourKg', ingredientId: 'flour', value: '1', unitId: 'kg' },
  { id: 'flour-cup', labelKey: 'kitchen.preset.flourCup', ingredientId: 'flour', value: '1', unitId: 'cup-250' },
  { id: 'sugar-tbsp', labelKey: 'kitchen.preset.sugarTbsp', ingredientId: 'sugar', value: '1', unitId: 'tbsp' },
  { id: 'water-cup', labelKey: 'kitchen.preset.waterCup', ingredientId: 'water', value: '1', unitId: 'cup-250' },
];


function getIngredient(id) {
  return INGREDIENTS.find((item) => item.id === id) || INGREDIENTS[0];
}


function getUnit(id) {
  return UNITS.find((item) => item.id === id) || UNITS[0];
}


function toGrams(value, unit, ingredient) {
  const amount = Number(value) || 0;

  if (unit.kind === 'weight') {
    return amount * unit.factor;
  }

  // Объём (мл, стаканы, ложки) → вес через плотность
  return amount * unit.factor * ingredient.density;
}


function fromGrams(grams, unit, ingredient) {
  if (unit.kind === 'weight') {
    return grams / unit.factor;
  }

  return grams / (unit.factor * ingredient.density);
}


function parseAmount(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');

  if (!normalized) {
    return NaN;
  }

  return Number(normalized);
}


function format(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  const rounded = Number(value.toPrecision(4));

  if (rounded === 0) {
    return '0';
  }

  return rounded.toLocaleString('ru-RU', {
    maximumSignificantDigits: 4,
  });
}


export default function createKitchenIngredients(container, context) {
  const { t, ui, lifecycle } = context;


  let amount = '1';
  let ingredientId = 'rice';
  let unitId = 'cup-250';
  let grams = null;
  let transferValue = null;


  let amountInput = null;
  let ingredientSelect = null;
  let unitSelect = null;
  let displayValue = null;
  let displayResult = null;
  let resultButtons = null;


  function calculate() {
    if (lifecycle.destroyed) {
      return { status: 'rejected', reason: 'destroyed' };
    }

    const ingredient = getIngredient(ingredientId);
    const unit = getUnit(unitId);
    const value = parseAmount(amount);

    if (!Number.isFinite(value)) {
      grams = null;
      transferValue = null;

      context.setResult('');
      render(ingredient, unit);

      return { status: 'ignored', reason: 'empty-amount' };
    }

    grams = toGrams(value, unit, ingredient);

    // По умолчанию переносим вес в граммах
    transferValue = grams;

    context.setResult(transferValue);
    render(ingredient, unit);

    return { status: 'accepted', value: transferValue };
  }


  function render(ingredient, unit) {
    if (displayValue) {
      displayValue.textContent = `${format(Number(amount) || 0)} ${t(unit.key)}`;
    }

    if (displayResult) {
      displayResult.textContent = Number.isFinite(grams)
        ? `= ${format(grams)} ${t('kitchen.unit.g')} · ${t(ingredient.nameKey)}`
        : '';
    }

    renderResults(ingredient);
  }


  function renderResults(ingredient) {
    if (!resultButtons) {
      return;
    }

    resultButtons.replaceChildren();

    UNITS.forEach((unit) => {
      const value = Number.isFinite(grams)
        ? fromGrams(grams, unit, ingredient)
        : null;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'kitchen-ing__result-button';
      button.dataset.unitId = unit.id;

      if (unit.id === unitId) {
        button.classList.add('kitchen-ing__result-button--active');
      }

      const name = document.createElement('span');
      name.className = 'kitchen-ing__result-name';
      name.textContent = t(unit.key);

      const valueElement = document.createElement('strong');
      valueElement.className = 'kitchen-ing__result-value';
      valueElement.textContent = format(value);

      button.append(name, valueElement);
      resultButtons.append(button);
    });
  }


  function insert(value) {
    if (value === ',' && amount.includes(',')) {
      return { status: 'ignored', reason: 'decimal-exists' };
    }

    amount += value;
    amountInput?.setValue(amount);

    return calculate();
  }


  function backspace() {
    amount = amount.slice(0, -1);
    amountInput?.setValue(amount);

    return calculate();
  }


  function clearAmount() {
    amount = '';
    amountInput?.setValue(amount);

    return calculate();
  }


  function receiveInput(event) {
    if (lifecycle.destroyed) {
      return { status: 'rejected', reason: 'destroyed' };
    }

    const key = event.key ?? event.value;

    if (!key) {
      return { status: 'ignored', reason: 'empty-input' };
    }

    if (event.source === 'transfer') {
      return receiveTransferValue(key);
    }

    if (/^[0-9]$/.test(key)) {
      return insert(key);
    }

    if (key === '.' || key === ',') {
      return insert(',');
    }

    if (key === 'Backspace') {
      return backspace();
    }

    if (key === 'Delete') {
      return clearAmount();
    }

    if (key === 'Enter') {
      return calculate();
    }

    return { status: 'ignored', reason: 'unsupported-input' };
  }


  function receiveTransferValue(value) {
    if (lifecycle.destroyed) {
      return { status: 'rejected', reason: 'destroyed' };
    }

    if (value === null || value === undefined || value === '') {
      return { status: 'ignored', reason: 'empty-value' };
    }

    const normalized = String(value).replace(',', '.');

    if (!/^-?\d*\.?\d*$/.test(normalized)) {
      return { status: 'ignored', reason: 'invalid-number' };
    }

    amount = normalized.replace('.', ',');
    amountInput?.setValue(amount);

    return calculate();
  }


  function receiveAction(action) {
    if (lifecycle.destroyed) {
      return { status: 'rejected', reason: 'destroyed' };
    }

    if (action === 'clear') {
      return clearAmount();
    }

    if (action === 'backspace') {
      return backspace();
    }

    if (action === 'calculate') {
      return calculate();
    }

    return { status: 'ignored', reason: 'unknown-action' };
  }


  function getState() {
    return {
      amount,
      ingredientId,
      unitId,
    };
  }


  function setState(next) {
    if (lifecycle.destroyed || !next) {
      return;
    }

    amount = String(next.amount ?? amount);
    ingredientId = next.ingredientId ?? ingredientId;
    unitId = next.unitId ?? unitId;

    createConverter();
  }


  function destroy() {
    lifecycle.destroy();
    container.replaceChildren();
  }


  function createConverter() {
    container.replaceChildren();

    const ingredient = getIngredient(ingredientId);
    const unit = getUnit(unitId);
    const value = parseAmount(amount);

    grams = Number.isFinite(value)
      ? toGrams(value, unit, ingredient)
      : null;

    transferValue = grams;


    container.innerHTML = `
      <div class="kitchen-ing">
        <div class="ui-display ui-display--compact kitchen-ing__display">
          <div class="ui-display__top">
            <div class="ui-display__title">${t('kitchen.amountLabel')}</div>
          </div>

          <div class="kitchen-ing__amount"></div>

          <div class="ui-display__preview kitchen-ing__display-result" aria-live="polite"></div>
        </div>

        <div class="kitchen-ing__presets">
          <div class="kitchen-ing__preset-buttons">
            ${PRESETS.map((preset) => `
              <button class="kitchen-ing__preset" type="button"
                data-ingredient-id="${preset.ingredientId}"
                data-value="${preset.value}"
                data-unit-id="${preset.unitId}">
                ${t(preset.labelKey)}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="kitchen-ing__controls">
          <div class="kitchen-ing__field">
            <select class="ui-select kitchen-ing__select kitchen-ing__ingredient"
              aria-label="${t('kitchen.ingredientLabel')}"></select>
            <div class="kitchen-ing__field-label">${t('kitchen.ingredientLabel')}</div>
          </div>

          <div class="kitchen-ing__field">
            <select class="ui-select kitchen-ing__select kitchen-ing__unit"
              aria-label="${t('kitchen.unitLabel')}"></select>
            <div class="kitchen-ing__field-label">${t('kitchen.unitLabel')}</div>
          </div>
        </div>

        <div class="kitchen-ing__results">
          <div class="kitchen-ing__results-title">${t('kitchen.resultsLabel')}</div>
          <div class="kitchen-ing__result-buttons"></div>
        </div>
      </div>
    `;


    displayValue = container.querySelector('.kitchen-ing__amount');
    displayResult = container.querySelector('.kitchen-ing__display-result');
    ingredientSelect = container.querySelector('.kitchen-ing__ingredient');
    unitSelect = container.querySelector('.kitchen-ing__unit');
    resultButtons = container.querySelector('.kitchen-ing__result-buttons');


    INGREDIENTS.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = t(item.nameKey);
      ingredientSelect.append(option);
    });


    UNITS.forEach((item) => {
      const option = document.createElement('option');
      option.value = item.id;
      option.textContent = t(item.key);
      unitSelect.append(option);
    });


    ingredientSelect.value = ingredientId;
    unitSelect.value = unitId;


    amountInput = lifecycle.own(ui.number({
      value: amount,
      label: t('kitchen.amountLabel'),
      placeholder: '1',
      onChange(nextValue) {
        amount = nextValue;
        calculate();
      }
    }));


    container.querySelector('.kitchen-ing__amount')
      .append(amountInput.element);


    lifecycle.listen(ingredientSelect, 'change', (event) => {
      ingredientId = event.target.value;
      calculate();
    });


    lifecycle.listen(unitSelect, 'change', (event) => {
      unitId = event.target.value;
      calculate();
    });


    container.querySelectorAll('.kitchen-ing__preset').forEach((button) => {
      lifecycle.listen(button, 'click', () => {
        ingredientId = button.dataset.ingredientId;
        amount = button.dataset.value;
        unitId = button.dataset.unitId;

        ingredientSelect.value = ingredientId;
        unitSelect.value = unitId;
        amountInput?.setValue(amount);

        calculate();
      });
    });


    lifecycle.listen(resultButtons, 'click', (event) => {
      const button = event.target.closest('.kitchen-ing__result-button');

      if (!button) {
        return;
      }

      const resultUnit = getUnit(button.dataset.unitId);
      const resultValue = Number.isFinite(grams)
        ? fromGrams(grams, resultUnit, ingredient)
        : null;

      // Переносим ровно то значение, на которое нажали
      transferValue = Number.isFinite(resultValue) ? resultValue : null;

      context.setResult(Number.isFinite(transferValue) ? transferValue : '');
    });


    render(ingredient, unit);
    calculate();
  }


  createConverter();


  const unsubscribeLanguage = t.subscribe?.(() => {
    const saved = getState();

    createConverter();
    setState(saved);
  });


  return {
    type: 'form',
    keyboardEnabled: true,

    receiveInput,
    receiveTransferValue,
    getState,
    setState,
    receiveAction,

    getResult: () => transferValue,
    getTransferValue: () => transferValue,

    destroy
  };
}