import { getCurrentUser, isLoggedIn, logout } from "./auth.js";

export class Index {
  constructor() {
    this.authButtons = document.getElementById("auth");
    this.menuButton = document.querySelector(".menu-btn");
    this.navMenu = document.querySelector(".nav-links");
    this.userInfo = document.getElementById("user-info");
    this.avatar = document.getElementById("avatar");
    this.userAvatar = document.getElementById("user-avatar");
    this.profileMenu = document.getElementById("profile-menu");

    this.menuUserName = document.getElementById("user-name");
    this.menuUserEmail = document.getElementById("user-email");
    this.optionAdminDb = document.getElementById("admin-dashboard");
    this.optionLogOut = document.getElementById("logoutBtn");
  }

  init() {
    this.#initNavbar();
  }

  #initNavbar() {
    this.menuButton.addEventListener("click", () => {
      this.navMenu.classList.toggle("active");
      if (document.body.style.overflow === "hidden") {
        document.body.style.overflow = "auto";
        return;
      }
      document.body.style.overflow = "hidden";
    });

    this.#processLogin();
    this.#ProcessUserMenu();
    this.#processMenuContent();
    this.#processMenuOptions();
  }

  #processLogin() {
    if (isLoggedIn()) {
      this.userInfo.style.display = "flex";
      this.avatar.textContent = getCurrentUser().apprvName;
    } else {
      this.authButtons.style.display = "flex";
    }
  }

  #ProcessUserMenu() {
    this.userAvatar.addEventListener("click", (e) => {
      e.stopPropagation();
      this.profileMenu.classList.toggle("hidden");
      this.profileMenu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (
        !this.profileMenu.contains(e.target) &&
        !this.userAvatar.contains(e.target)
      ) {
        this.profileMenu.classList.add("hidden");
        this.profileMenu.classList.remove("open");
      }
    });
  }

  #processMenuContent() {
    if (isLoggedIn()) {
      this.menuUserName.textContent = getCurrentUser().fullName;
      this.menuUserEmail.textContent = getCurrentUser().email;

      if (getCurrentUser().role === "admin") {
        this.optionAdminDb.classList.remove("hidden");
      }
    }
  }

  #processMenuOptions() {
    this.optionLogOut.addEventListener("click", () => {
      logout();
    });
  }
}
