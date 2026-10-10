export function initTheme(onChange) {
  const themeToggle = document.querySelector("#theme-toggle");
  const darkMode = localStorage.getItem("colorful-theme") === "dark";

  function setTheme(isDark) {
    document.body.dataset.theme = isDark ? "dark" : "light";
    themeToggle.textContent = isDark ? "☀" : "☾";
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
    themeToggle.title = `Switch to ${isDark ? "light" : "dark"} mode`;
    document.querySelector('meta[name="theme-color"]').content = isDark ? "#171522" : "#f5f2ff";
    localStorage.setItem("colorful-theme", isDark ? "dark" : "light");
    onChange(isDark);
  }

  themeToggle.addEventListener("click", () => {
    setTheme(document.body.dataset.theme !== "dark");
  });

  setTheme(darkMode);
}
