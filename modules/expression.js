const functions = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan,
  asin: Math.asin, acos: Math.acos, atan: Math.atan,
  sqrt: Math.sqrt, abs: Math.abs, ln: Math.log,
  log: Math.log10, exp: Math.exp, floor: Math.floor,
  ceil: Math.ceil, round: Math.round,
};

const constants = { pi: Math.PI, e: Math.E, π: Math.PI };

function tokenize(source) {
  const tokens = [];
  let position = 0;

  while (position < source.length) {
    const rest = source.slice(position);
    if (/^\s+/.test(rest)) {
      position += rest.match(/^\s+/)[0].length;
      continue;
    }

    const number = rest.match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    const identifier = rest.match(/^[a-zA-Zπ]+/);

    if (number) {
      tokens.push({ type: "number", value: Number(number[0]) });
      position += number[0].length;
    } else if (identifier) {
      tokens.push({ type: "identifier", value: identifier[0].toLowerCase() });
      position += identifier[0].length;
    } else if ("+-−*/÷×^()".includes(source[position])) {
      tokens.push({ type: "operator", value: source[position] });
      position += 1;
    } else {
      throw new Error(`Unexpected character "${source[position]}"`);
    }
  }

  return tokens;
}

export function parseExpression(source, options = {}) {
  const tokens = tokenize(source);
  let index = 0;
  const angleFactor = options.degrees ? Math.PI / 180 : 1;

  function peek() { return tokens[index]; }
  function take() { return tokens[index++]; }
  function startsValue(token) {
    return token && (token.type === "number" || token.type === "identifier" || token.value === "(");
  }

  function primary() {
    const token = take();
    if (!token) throw new Error("Expected a value");
    if (token.type === "number") return token.value;
    if (token.value === "(") {
      const value = sum();
      if (!peek() || take().value !== ")") throw new Error("Missing closing parenthesis");
      return value;
    }
    if (token.type === "identifier") {
      if (Object.hasOwn(functions, token.value)) {
        if (!peek() || take().value !== "(") throw new Error(`Expected ( after ${token.value}`);
        const argument = sum();
        if (!peek() || take().value !== ")") throw new Error("Missing closing parenthesis");
        if (["sin", "cos", "tan"].includes(token.value)) return functions[token.value](argument * angleFactor);
        if (["asin", "acos", "atan"].includes(token.value)) {
          const result = functions[token.value](argument);
          return options.degrees ? result * (180 / Math.PI) : result;
        }
        return functions[token.value](argument);
      }
      if (Object.hasOwn(constants, token.value)) return constants[token.value];
      if (token.value === "x" && options.x !== undefined) return options.x;
      throw new Error(`Unknown name "${token.value}"`);
    }
    throw new Error("Expected a number or function");
  }

  function power() {
    let value = primary();
    if (peek() && peek().value === "^") {
      take();
      value **= unary();
    }
    return value;
  }

  function unary() {
    if (peek() && (peek().value === "+" || peek().value === "-" || peek().value === "−")) {
      const operator = take().value;
      return (operator === "+" ? 1 : -1) * unary();
    }
    return power();
  }

  function product() {
    let value = unary();
    while (peek()) {
      const operator = peek().value;
      if (operator === "*" || operator === "×" || operator === "/" || operator === "÷") {
        take();
        const right = unary();
        value = operator === "*" || operator === "×" ? value * right : value / right;
      } else if (startsValue(peek())) {
        value *= unary();
      } else {
        break;
      }
    }
    return value;
  }

  function sum() {
    let value = product();
    while (peek() && ["+", "-", "−"].includes(peek().value)) {
      const operator = take().value;
      const right = product();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  if (!tokens.length) return 0;
  const value = sum();
  if (index < tokens.length) throw new Error("Check the expression");
  if (!Number.isFinite(value)) throw new Error("Result is not a real number");
  return value;
}

export function formatNumber(number) {
  if (Object.is(number, -0)) return "0";
  if (Math.abs(number) >= 1e12 || (Math.abs(number) > 0 && Math.abs(number) < 1e-8)) {
    return number.toExponential(5).replace(/\.?0+e/, "e");
  }
  return Number(number.toPrecision(11)).toLocaleString("en-US", { maximumFractionDigits: 9 });
}
