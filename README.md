# Colorful Calculator

A colorful, responsive calculator with scientific functions and interactive graphing. Built with vanilla HTML, CSS, and JavaScript ES modules; no dependencies or build step required.

## Run locally

Because the app uses ES module imports, open it from a local web server rather than directly as a `file://` URL. From the project directory, run:

```sh
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Features

- Standard arithmetic with keyboard and on-screen keypad input
- Scientific functions, including trigonometry, square roots, powers, logarithms, and π
- Switchable degree and radian modes
- Function graphing with example functions, hover coordinates, and zoom controls
- Light and dark themes, with the selected theme remembered in local storage
- Responsive layout for desktop and mobile screens

## Project structure

- `index.html` — app markup and entry point
- `styles.css` — layout, colors, and light/dark theme styles
- `app.js` — initializes the feature modules
- `modules/expression.js` — expression parsing and number formatting
- `modules/calculator.js` — calculator controls and keyboard input
- `modules/graph.js` — function plotting and graph interaction
- `modules/theme.js` — theme toggle and persistence
