const settingsButton = document.querySelector(".settings-button");
const settingsSidebar = document.querySelector(".settings-sidebar");
const closeButton = document.querySelector(".close-button");

settingsButton.addEventListener("click", () => {
  settingsSidebar.classList.add("active");
});

closeButton.addEventListener("click", () => {
  settingsSidebar.classList.remove("active");
});

