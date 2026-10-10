import { formatNumber, parseExpression } from "./expression.js";

export function initCalculator() {
  const expressionDisplay = document.querySelector("#expression-display");
  const resultDisplay = document.querySelector("#result-display");
  const scientificToggle = document.querySelector("#scientific-toggle");
  const scientificKeys = document.querySelector("#scientific-keys");
  const angleLabel = document.querySelector("#angle-mode");
  const angleToggle = document.querySelector("#angle-toggle");
  const functionInput = document.querySelector("#function-input");

  let expression = "";
  let currentResult = 0;
  let justEvaluated = false;
  let scientific = false;
  let degrees = true;

  function updateDisplay() {
    expressionDisplay.textContent = expression.replace(/\*/g, "×").replace(/\//g, "÷");
    resultDisplay.textContent = expression ? formatNumber(currentResult) : "0";
  }

  function calculate() {
    if (!expression) return;
    try {
      currentResult = parseExpression(expression, { degrees });
      justEvaluated = true;
      updateDisplay();
    } catch (error) {
      resultDisplay.textContent = "Error";
      expressionDisplay.textContent = error.message;
    }
  }

  function insertValue(value) {
    if (justEvaluated && /[\d.πa-zA-Z(]/.test(value[0])) expression = "";
    justEvaluated = false;
    expression += value;
    try {
      currentResult = parseExpression(expression, { degrees });
      resultDisplay.textContent = formatNumber(currentResult);
    } catch {
      resultDisplay.textContent = "…";
    }
    updateDisplay();
  }

  function clearCalculator() {
    expression = "";
    currentResult = 0;
    justEvaluated = false;
    updateDisplay();
  }

  function backspace() {
    expression = expression.slice(0, -1);
    justEvaluated = false;
    try { currentResult = parseExpression(expression, { degrees }); }
    catch { currentResult = 0; }
    updateDisplay();
  }

  document.querySelector(".keypad").addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.action === "clear") clearCalculator();
    else if (button.dataset.action === "backspace") backspace();
    else if (button.dataset.action === "parentheses") {
      const opens = (expression.match(/\(/g) || []).length;
      const closes = (expression.match(/\)/g) || []).length;
      insertValue(opens > closes ? ")" : "(");
    } else if (button.dataset.action === "equals") calculate();
    else if (button.dataset.insert) insertValue(button.dataset.insert);
  });

  scientificKeys.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (button?.dataset.insert) insertValue(button.dataset.insert);
  });

  scientificToggle.addEventListener("click", () => {
    scientific = !scientific;
    scientificToggle.setAttribute("aria-pressed", String(scientific));
    scientificKeys.classList.toggle("is-visible", scientific);
  });

  angleToggle.addEventListener("click", () => {
    degrees = !degrees;
    angleLabel.textContent = degrees ? "DEG" : "RAD";
    angleToggle.innerHTML = `${degrees ? "Degrees" : "Radians"} <span>⌄</span>`;
    if (expression) {
      try {
        currentResult = parseExpression(expression, { degrees });
        updateDisplay();
      } catch {
        // Keep the current display until the expression is complete.
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement) {
      if (event.key === "Enter" && event.target === functionInput) {
        document.querySelector("#plot-button").click();
      }
      return;
    }
    if (/^[0-9.]$/.test(event.key)) insertValue(event.key);
    else if (["+", "-", "*", "/", "^", "(", ")"].includes(event.key)) insertValue(event.key);
    else if (event.key === "Enter" || event.key === "=") {
      event.preventDefault();
      calculate();
    } else if (event.key === "Backspace") backspace();
    else if (event.key === "Escape") clearCalculator();
  });

  updateDisplay();
}
