import {
  loadSavedTheme,
  saveTheme,
  applyTheme,
} from "./theme.js";

const settingsButton = document.querySelector(".settings-button");
const settingsSidebar = document.querySelector(".settings-sidebar");
const closeButton = document.querySelector(".close-button");
const themeChooser = document.getElementById("theme-chooser");

settingsButton.addEventListener("click", () => {
  settingsSidebar.classList.add("active");
});

closeButton.addEventListener("click", () => {
  settingsSidebar.classList.remove("active");
});

if (themeChooser) {
  themeChooser.addEventListener("change", () => {
    const selectedTheme = themeChooser.value;
    saveTheme(selectedTheme);
    applyTheme(selectedTheme);
  });

  // Load and apply saved theme on page load
  const savedTheme = loadSavedTheme();
  themeChooser.value = savedTheme;
  applyTheme(savedTheme);
}
