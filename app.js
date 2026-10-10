import { initCalculator } from "./modules/calculator.js";
import { initGraph } from "./modules/graph.js";
import { initTheme } from "./modules/theme.js";

initCalculator();
const redrawGraph = initGraph();
initTheme(redrawGraph);
