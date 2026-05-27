const THEME_STORAGE_KEY = "typing-test-theme";

export function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function loadSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme || "dark";
}

export function getSelectedTheme() {
  const themeChooser = document.getElementById("theme-chooser");
  return themeChooser ? themeChooser.value : "dark";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}
