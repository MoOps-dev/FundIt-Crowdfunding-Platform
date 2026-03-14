import { getCurrentUser, isLoggedIn, logout } from "./auth.js";
import { showSuccess } from "./utils.js";

export class Admin {
  constructor() {
    this.userInfo = document.getElementById("user-info");
    this.avatar = document.getElementById("avatar");
    this.userAvatar = document.getElementById("user-avatar");
    this.profileMenu = document.getElementById("profile-menu");

    this.menuUserName = document.getElementById("user-name");
    this.menuUserEmail = document.getElementById("user-email");
    this.optionLogOut = document.getElementById("logoutBtn");
    this.searchBox = document.getElementById("search");

    this.listItems = document.querySelectorAll(".side-panel li");
    this.sectionTitle = document.querySelector(".nav h3");

    this.sectionContainer = document.querySelector(
      ".section-management-content",
    );

    this.activeSection;
  }

  init() {
    this.#initNavbar();
    this.#initSidePanel();
  }

  #initNavbar() {
    this.#processLogin();
    this.#ProcessUserMenu();
    this.#processMenuContent();
    this.#processMenuOptions();
  }

  #initSidePanel() {
    this.listItems[0].classList.add("active");
    const initSection = this.listItems[0].querySelector("span").dataset.section;
    this.#fetchSection(initSection);
    this.activeSection = initSection;

    this.listItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        if (event.currentTarget.classList.contains("active")) return;

        this.listItems.forEach((li) => li.classList.remove("active"));

        const clickedItem = event.currentTarget;
        clickedItem.classList.add("active");

        const span = clickedItem.querySelector("span");
        this.sectionTitle.textContent = span.textContent;

        this.#fetchSection(span.dataset.section);
        this.activeSection = span.dataset.section;
      });
    });

    let searchTimer;
    this.searchBox.addEventListener("input", (e) => {
      const value = e.target.value;
      clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        this.#SearchSection(this.activeSection, value);
      }, 1000);
    });
  }

  async #fetchSection(section) {
    const response = await fetch(`/${section}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (section === "users") {
      this.#loadUsers(data);
    } else if (section === "campaigns") {
    }
  }

  async #SearchSection(section, query) {
    const trimmedQuery = query.trim();

    const filter = `{"or":[{"firstName":{"contains":"${trimmedQuery}"}},{"lastName":{"contains":"${trimmedQuery}"}},{"role":{"contains":"${trimmedQuery}"}},{"email":{"contains":"${trimmedQuery}"}}]}`;
    const url = `/${section}?_where=${encodeURIComponent(filter)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (section === "users") {
      this.#loadUsers(data);
    } else if (section === "campaigns") {
    }
  }

  #loadUsers(data) {
    const template = document.getElementById("user-card-template");

    this.sectionContainer.replaceChildren();

    data.forEach((user) => {
      const clone = template.content.cloneNode(true);

      const fullName = `${user.firstName} ${user.lastName}`;
      clone.querySelector(".user-meta h4").textContent = fullName;
      clone.querySelector(".user-meta p").textContent = user.email;
      clone.querySelector(".detail-value").textContent = user.role;

      const statusPill = clone.querySelector(".status-pill");
      statusPill.textContent = user.isActive ? "Active" : "Banned";
      statusPill.classList.remove("active", "inactive");
      statusPill.classList.add(user.isActive ? "active" : "inactive");
      const banBtn = clone.querySelector(".btn-ban");
      if (!user.isActive) {
        banBtn.classList.add("unban");
      }
      banBtn.addEventListener("click", () => {
        this.#userAction(user);
      });
      const banBtnText = clone.querySelector(".btn-text");
      banBtnText.textContent = user.isActive ? "Ban User" : "Unban User";

      this.sectionContainer.appendChild(clone);
    });
  }

  async #userAction(user) {
    user.isActive = !user.isActive;

    const response = await fetch(`/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    if (response.ok) {
      this.#fetchSection("users");
      showSuccess(
        `User ${user.firstName} ${user.lastName} has been ${user.isActive ? "Unbanned" : "Banned"}.`,
      );
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  #processLogin() {
    if (isLoggedIn()) {
      this.userInfo.style.display = "flex";
      this.avatar.textContent = getCurrentUser().apprvName;
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
    }
  }

  #processMenuOptions() {
    this.optionLogOut.addEventListener("click", () => {
      logout();
    });
  }
}
