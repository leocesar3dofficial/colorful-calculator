import { formatNumber, parseExpression } from "./expression.js";

export function initGraph() {
  const graphCanvas = document.querySelector("#graph-canvas");
  const graphContext = graphCanvas.getContext("2d");
  const functionInput = document.querySelector("#function-input");
  const graphTooltip = document.querySelector("#graph-tooltip");
  const graphStatus = document.querySelector("#graph-status");
  const legendFunction = document.querySelector("#legend-function");
  const zoomLabel = document.querySelector("#zoom-label");

  let graphScale = 10;
  let activeGraph = "x^2";
  let darkMode = false;

  function formatTick(value) {
    return Number(value.toPrecision(2)).toString();
  }

  function drawGraph(isDark = darkMode) {
    darkMode = isDark;
    const rect = graphCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const ratio = window.devicePixelRatio || 1;
    graphCanvas.width = Math.round(rect.width * ratio);
    graphCanvas.height = Math.round(rect.height * ratio);
    graphContext.setTransform(ratio, 0, 0, ratio, 0, 0);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = Math.min(width, height) / (graphScale * 2);
    const gridColor = darkMode ? "#353241" : "#f0eef5";
    const axisColor = darkMode ? "#696477" : "#c9c5d5";
    const labelColor = darkMode ? "#9691a5" : "#aaa6b5";
    graphContext.clearRect(0, 0, width, height);

    graphContext.lineWidth = 1;
    graphContext.font = '9px "DM Sans", sans-serif';
    graphContext.textAlign = "center";
    graphContext.textBaseline = "top";
    for (let value = -graphScale; value <= graphScale; value += graphScale / 5) {
      const x = centerX + value * scale;
      const y = centerY - value * scale;
      graphContext.strokeStyle = value === 0 ? axisColor : gridColor;
      graphContext.beginPath(); graphContext.moveTo(x, 0); graphContext.lineTo(x, height); graphContext.stroke();
      graphContext.beginPath(); graphContext.moveTo(0, y); graphContext.lineTo(width, y); graphContext.stroke();
      if (Math.abs(value) > 0.001) {
        graphContext.fillStyle = labelColor;
        graphContext.fillText(formatTick(value), x, Math.min(centerY + 6, height - 14));
        graphContext.textAlign = "right";
        graphContext.textBaseline = "middle";
        graphContext.fillText(formatTick(value), Math.max(17, centerX - 6), y);
        graphContext.textAlign = "center";
        graphContext.textBaseline = "top";
      }
    }

    let drawing = false;
    graphContext.beginPath();
    for (let pixel = 0; pixel <= width; pixel += 1) {
      const x = (pixel - centerX) / scale;
      let y;
      try { y = parseExpression(activeGraph, { x, degrees: false }); }
      catch { y = NaN; }
      const canvasY = centerY - y * scale;
      if (!Number.isFinite(canvasY) || Math.abs(canvasY) > height * 3) {
        drawing = false;
        continue;
      }
      if (!drawing) { graphContext.moveTo(pixel, canvasY); drawing = true; }
      else graphContext.lineTo(pixel, canvasY);
    }
    graphContext.strokeStyle = "#8a75eb";
    graphContext.lineWidth = 2.5;
    graphContext.lineJoin = "round";
    graphContext.lineCap = "round";
    graphContext.shadowColor = "rgba(138, 117, 235, .17)";
    graphContext.shadowBlur = 5;
    graphContext.stroke();
    graphContext.shadowBlur = 0;
  }

  function setGraphError(message) {
    graphStatus.innerHTML = message
      ? `<span class="status-dot" style="background:#f08c78"></span>${escapeHtml(message)}`
      : '<span class="status-dot"></span> Looking good';
  }

  function plotFunction() {
    const value = functionInput.value.trim();
    if (!value) {
      setGraphError("Enter a function to plot");
      return;
    }
    try {
      parseExpression(value, { x: 1, degrees: false });
      activeGraph = value;
      legendFunction.textContent = `y = ${value}`;
      setGraphError("");
      drawGraph();
    } catch (error) {
      setGraphError(error.message);
    }
  }

  function escapeHtml(text) {
    const element = document.createElement("span");
    element.textContent = text;
    return element.innerHTML;
  }

  document.querySelector("#plot-button").addEventListener("click", plotFunction);
  document.querySelectorAll(".example-function").forEach((button) => {
    button.addEventListener("click", () => {
      functionInput.value = button.dataset.function;
      plotFunction();
    });
  });
  document.querySelector("#zoom-in").addEventListener("click", () => {
    graphScale = Math.max(2, graphScale / 1.25);
    zoomLabel.textContent = `${formatTick(10 / graphScale)}×`;
    drawGraph();
  });
  document.querySelector("#zoom-out").addEventListener("click", () => {
    graphScale = Math.min(80, graphScale * 1.25);
    zoomLabel.textContent = `${formatTick(10 / graphScale)}×`;
    drawGraph();
  });
  document.querySelector("#reset-graph").addEventListener("click", () => {
    graphScale = 10;
    zoomLabel.textContent = "1×";
    drawGraph();
  });

  graphCanvas.addEventListener("mousemove", (event) => {
    const rect = graphCanvas.getBoundingClientRect();
    const scale = Math.min(rect.width, rect.height) / (graphScale * 2);
    const x = (event.clientX - rect.left - rect.width / 2) / scale;
    try {
      const y = parseExpression(activeGraph, { x, degrees: false });
      if (!Number.isFinite(y)) throw new Error("no point");
      graphTooltip.textContent = `(${formatNumber(x)}, ${formatNumber(y)})`;
      graphTooltip.hidden = false;
      graphTooltip.style.left = `${Math.min(event.clientX - rect.left + 12, rect.width - 105)}px`;
      graphTooltip.style.top = `${Math.max(4, event.clientY - rect.top - 28)}px`;
    } catch {
      graphTooltip.hidden = true;
    }
  });
  graphCanvas.addEventListener("mouseleave", () => { graphTooltip.hidden = true; });
  window.addEventListener("resize", () => drawGraph());
  document.querySelector(".help-button").addEventListener("click", () => {
    setGraphError("Use the keypad or keyboard; graph expressions support x, powers, and trig.");
    window.setTimeout(() => setGraphError(""), 4500);
  });

  requestAnimationFrame(() => drawGraph());
  return drawGraph;
}
