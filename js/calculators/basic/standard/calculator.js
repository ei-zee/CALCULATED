const OPERATORS = {
  "+": { priority: 1, calculate: (a, b) => a + b },
  "-": { priority: 1, calculate: (a, b) => a - b },
  "×": { priority: 2, calculate: (a, b) => a * b },
  "÷": { priority: 2, calculate: (a, b) => a / b }
};


export default function createStandardCalculator(container, context) {
  const { t } = context;


  let expression = "";
  let lastResult = null;
  let destroyed = false;


  let expressionElement = null;
  let previewElement = null;



  function tr(key, vars = {}) {
    const text = t(key, vars);

    return typeof text === "string" ? text : key;
  }


  function insert(value) {
    expression += value;
    updateDisplay();


    return { status: "accepted" };
  }


  function backspace() {
    expression = expression.slice(0, -1);
    updateDisplay();


    return { status: "accepted" };
  }


  function clear() {
    expression = "";
    lastResult = null;


    context.setResult("");
    updateDisplay();


    return { status: "accepted" };
  }


  function toggleSign() {
    const match = expression.match(/(\d+[.,]?\d*)$/);


    if (!match) {
      return { status: "ignored", reason: "no-number" };
    }


    const number = match[0];
    const before = expression.slice(
      0,
      expression.length - number.length
    );


    expression = before.endsWith("(-")
      ? before.slice(0, -2) + number
      : before + "(-" + number;


    updateDisplay();


    return { status: "accepted" };
  }


  function closeBrackets(value) {
    let open = 0;


    for (const character of value) {
      if (character === "(") open++;
      if (character === ")") open--;
    }


    return open > 0
      ? value + ")".repeat(open)
      : value;
  }


  function calculate() {
    if (!expression) {
      return { status: "ignored", reason: "empty" };
    }


    try {
      const value = evaluate(closeBrackets(expression));
      const rounded = Number(value.toFixed(10));


      if (!Number.isFinite(rounded)) {
        throw new Error("invalid-result");
      }


      expression = String(rounded).replace(".", ",");
      lastResult = rounded;


      context.setResult(rounded);
      updateDisplay();


      return { status: "accepted", value: rounded };
    } catch (error) {
      previewElement.textContent = tr("standard.error");


      return {
        status: "error",
        reason: error?.message || "calculation-error"
      };
    }
  }


  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      return "—";
    }


    return Number(value.toFixed(10)).toLocaleString("ru-RU", {
      maximumFractionDigits: 10
    });
  }


  function updateDisplay() {
    if (!expressionElement || !previewElement) {
      return;
    }


    expressionElement.value = expression || "0";


    if (!expression) {
      previewElement.textContent = "";
      lastResult = null;


      context.setResult("");
      return;
    }


    try {
      const value = evaluate(closeBrackets(expression));
      const rounded = Number(value.toFixed(10));


      if (!Number.isFinite(rounded)) {
        throw new Error("invalid-result");
      }


      lastResult = rounded;


      context.setResult(rounded);
      previewElement.textContent = `= ${formatNumber(rounded)}`;
    } catch {
      previewElement.textContent = "";
    }
  }


  function handleButton(button) {
    if (button.dataset.insert) {
      return insert(button.dataset.insert);
    }


    const action = button.dataset.action;


    if (action === "clear") return clear();
    if (action === "backspace") return backspace();
    if (action === "toggle-sign") return toggleSign();
    if (action === "equals") return calculate();


    return { status: "ignored" };
  }


  function onButtonClick(event) {
    if (destroyed) {
      return;
    }


    const button = event.target instanceof Element
      ? event.target.closest("button")
      : null;


    if (button && container.contains(button)) {
      handleButton(button);
    }
  }


  function receiveInput(event) {
    if (destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }


    const key = event.key ?? event.value;


    if (!key) {
      return { status: "ignored", reason: "empty-input" };
    }


    if (event.source === "transfer") {
      return receiveTransferValue(key);
    }


    if (/^[0-9]$/.test(key)) {
      return insert(key);
    }


    if (key === "." || key === ",") {
      return insert(",");
    }


    const operators = {
      "+": "+",
      "-": "-",
      "*": "×",
      "/": "÷"
    };


    if (operators[key]) {
      return insert(operators[key]);
    }


    if (key === "(" || key === ")") {
      return insert(key);
    }


    return { status: "ignored", reason: "unsupported-input" };
  }


  function receiveTransferValue(value) {
    if (destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }


    if (value === null || value === undefined || value === "") {
      return { status: "ignored", reason: "empty-value" };
    }


    const normalized = String(value).replace(",", ".");


    if (!/^-?\d*\.?\d*$/.test(normalized)) {
      return { status: "ignored", reason: "invalid-number" };
    }


    return insert(normalized.replace(".", ","));
  }


  function receiveAction(action) {
    if (destroyed) {
      return { status: "rejected", reason: "destroyed" };
    }


    if (action === "calculate") return calculate();
    if (action === "backspace") return backspace();
    if (action === "clear") return clear();


    return { status: "ignored", reason: "unknown-action" };
  }


  function getState() {
    return {
      expression,
      lastResult
    };
  }


  function setState(state) {
    if (destroyed || !state) {
      return;
    }


    expression = String(state.expression ?? "");
    lastResult = Number.isFinite(state.lastResult)
      ? state.lastResult
      : null;


    context.setResult(lastResult ?? "");
    updateDisplay();
  }


  function render() {
    container.innerHTML = `
      <div class="standard">
        <div class="ui-display ui-display--compact standard__display">
          <div class="ui-display__top">
            <div class="ui-display__title">
              ${tr("standard.title")}
            </div>
          </div>


          <div class="ui-display__value">
            <input
              class="standard__expression"
              type="text"
              readonly
              tabindex="-1"
              inputmode="none"
              autocomplete="off"
              spellcheck="false"
              aria-label="${tr("standard.expression")}"
            >
          </div>


          <div
            class="ui-display__preview standard__preview"
            aria-live="polite"
          ></div>
        </div>


        <div class="standard__utils">
          <button class="ui-button standard__key standard__key--muted" data-action="clear" type="button">C</button>
          <button class="ui-button standard__key standard__key--muted" data-action="backspace" type="button">⌫</button>
          <button class="ui-button standard__key" data-insert="(" type="button">(</button>
          <button class="ui-button standard__key" data-insert=")" type="button">)</button>
          <button class="ui-button standard__key standard__key--operator" data-insert="÷" type="button">÷</button>
        </div>


        <div class="standard__grid">
          <button class="ui-button standard__key" data-insert="7" type="button">7</button>
          <button class="ui-button standard__key" data-insert="8" type="button">8</button>
          <button class="ui-button standard__key" data-insert="9" type="button">9</button>
          <button class="ui-button standard__key standard__key--operator" data-insert="×" type="button">×</button>


          <button class="ui-button standard__key" data-insert="4" type="button">4</button>
          <button class="ui-button standard__key" data-insert="5" type="button">5</button>
          <button class="ui-button standard__key" data-insert="6" type="button">6</button>
          <button class="ui-button standard__key standard__key--operator" data-insert="-" type="button">−</button>


          <button class="ui-button standard__key" data-insert="1" type="button">1</button>
          <button class="ui-button standard__key" data-insert="2" type="button">2</button>
          <button class="ui-button standard__key" data-insert="3" type="button">3</button>
          <button class="ui-button standard__key standard__key--operator" data-insert="+" type="button">+</button>


          <button class="ui-button standard__key" data-action="toggle-sign" type="button">±</button>
          <button class="ui-button standard__key" data-insert="," type="button">,</button>
          <button class="ui-button standard__key" data-insert="0" type="button">0</button>
          <button class="ui-button standard__key standard__key--equals" data-action="equals" type="button">=</button>
        </div>
      </div>
    `;


    expressionElement = container.querySelector(".standard__expression");
    previewElement = container.querySelector(".standard__preview");


    updateDisplay();
  }


  function destroy() {
    if (destroyed) {
      return;
    }


    destroyed = true;


    unsubscribeLanguage?.();


    container.removeEventListener("click", onButtonClick);
    container.replaceChildren();
  }


  container.replaceChildren();
  container.addEventListener("click", onButtonClick);


  const unsubscribeLanguage = t.subscribe?.(() => {
    render();
  });


  render();


  return {
    type: "keypad",
    keyboardEnabled: true,


    receiveInput,
    receiveAction,
    getState,
    setState,


    getResult: () => lastResult,
    getTransferValue: () => lastResult,
    receiveTransferValue,


    destroy
  };
}



function tokenize(expression) {
  const normalized = expression.replace(/,/g, ".");
  const tokens = [];


  let number = "";
  let previous = null;



  function isUnaryPosition() {
    if (!previous) {
      return true;
    }


    return (
      previous.type === "operator" ||
      previous.value === "("
    );
  }



  for (const character of normalized) {
    if (/[0-9.]/.test(character)) {
      number += character;
      continue;
    }


    if (number) {
      const token = {
        type: "number",
        value: Number(number)
      };


      tokens.push(token);
      previous = token;
      number = "";
    }


    if (character === "(" || character === ")") {
      const token = {
        type: "parenthesis",
        value: character
      };


      tokens.push(token);
      previous = token;


      continue;
    }


    if (character === "+" || character === "-") {
      if (isUnaryPosition()) {
        const zero = {
          type: "number",
          value: 0
        };


        tokens.push(zero);
        previous = zero;
      }


      const token = {
        type: "operator",
        value: character
      };


      tokens.push(token);
      previous = token;


      continue;
    }


    if (OPERATORS[character]) {
      const token = {
        type: "operator",
        value: character
      };


      tokens.push(token);
      previous = token;


      continue;
    }


    throw new Error("invalid-character");
  }


  if (number) {
    const token = {
      type: "number",
      value: Number(number)
    };


    tokens.push(token);
  }


  return tokens;
}



function evaluate(expression) {
  const tokens = tokenize(expression);
  const output = [];
  const operators = [];


  for (const token of tokens) {
    if (token.type === "number") {
      output.push(token);
      continue;
    }


    if (token.type === "operator") {
      while (
        operators.length &&
        operators[operators.length - 1].type === "operator" &&
        OPERATORS[operators[operators.length - 1].value].priority >=
          OPERATORS[token.value].priority
      ) {
        output.push(operators.pop());
      }


      operators.push(token);
      continue;
    }


    if (token.value === "(") {
      operators.push(token);
      continue;
    }


    if (token.value === ")") {
      while (
        operators.length &&
        operators[operators.length - 1].value !== "("
      ) {
        output.push(operators.pop());
      }


      if (!operators.length) {
        throw new Error("unclosed-parenthesis");
      }


      operators.pop();
    }
  }


  while (operators.length) {
    const operator = operators.pop();


    if (operator.value === "(") {
      throw new Error("unclosed-parenthesis");
    }


    output.push(operator);
  }


  return calculateTokens(output);
}



function calculateTokens(tokens) {
  const stack = [];


  for (const token of tokens) {
    if (token.type === "number") {
      stack.push(token.value);
      continue;
    }


    const b = stack.pop();
    const a = stack.pop();


    if (a === undefined || b === undefined) {
      throw new Error("invalid-expression");
    }


    stack.push(OPERATORS[token.value].calculate(a, b));
  }


  if (stack.length !== 1) {
    throw new Error("invalid-expression");
  }


  const result = stack[0];


  if (!Number.isFinite(result)) {
    throw new Error("division-by-zero");
  }


  return result;
}