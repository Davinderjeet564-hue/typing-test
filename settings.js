import {
  loadSavedTheme,
  saveTheme,
  applyTheme,
} from "./theme.js";

const settingsButton = document.querySelector(".settings-button");
const settingsSidebar = document.querySelector(".settings-sidebar");
const sidebarBackdrop = document.getElementById("sidebar-backdrop");
const closeButton = document.querySelector(".close-button");
const themeChooser = document.getElementById("theme-chooser");

function openSidebar() {
  settingsSidebar.classList.add("active");
  sidebarBackdrop.classList.add("active");
}

function closeSidebar() {
  settingsSidebar.classList.remove("active");
  sidebarBackdrop.classList.remove("active");
}

settingsButton.addEventListener("click", (e) => {
  e.stopPropagation();
  openSidebar();
});

closeButton.addEventListener("click", () => {
  closeSidebar();
});

sidebarBackdrop.addEventListener("click", () => {
  closeSidebar();
});

// Close sidebar when clicking outside
document.addEventListener("click", (event) => {
  if (
    settingsSidebar.classList.contains("active") &&
    !settingsSidebar.contains(event.target) &&
    !settingsButton.contains(event.target)
  ) {
    closeSidebar();
  }
});

// Close sidebar on keydown (dismiss when user begins typing or presses Escape)
document.addEventListener("keydown", (event) => {
  if (settingsSidebar.classList.contains("active")) {
    // If user is actively using the dropdown, don't close unless Escape is pressed
    if (event.target.tagName === "SELECT" && event.key !== "Escape") {
      return;
    }
    
    // Ignore modifier keys if pressed alone
    if (["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
      return;
    }

    closeSidebar();
  }
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
