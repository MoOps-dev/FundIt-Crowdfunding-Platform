import { getCurrentUser, isLoggedIn, logout } from "./auth.js";
import { currencyFormatter, getDaysLeft, showSuccess } from "./utils.js";

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

    this.overviewTitle = document.getElementById("campaign-title-overview");
    this.overviewCat = document.getElementById("overview-cat");
    this.overviewAmount = document.getElementById("overview-amount");
    this.overviewDays = document.getElementById("overview-days");
    this.overviewImg = document.getElementById("overview-img");
    this.overviewShortDesc = document.getElementById("overview-sdesc");
    this.overviewLocation = document.getElementById("overview-location");
    this.overviewVideo = document.getElementById("over-video");
    this.overviewRadioBtns = document.querySelectorAll(".tab-switcher input");
    this.overviewRLdesc = document.getElementById("overview-ldesc");
    this.overviewRLstory = document.getElementById("overview-lstory");

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
      this.#loadCampaigns(data.sort((a, b) => a.approved - b.approved));
    }
  }

  async #SearchSection(section, query) {
    const trimmedQuery = query.trim();
    let filter;

    if (section === "users") {
      filter = `{"or":[{"firstName":{"contains":"${trimmedQuery}"}},{"lastName":{"contains":"${trimmedQuery}"}},{"role":{"contains":"${trimmedQuery}"}},{"email":{"contains":"${trimmedQuery}"}}]}`;
    } else if (section === "campaigns") {
      filter = `{"or":[{"title":{"contains":"${trimmedQuery}"}},{"goal":{"contains":"${trimmedQuery}"}},{"shortDesc":{"contains":"${trimmedQuery}"}},{"category":{"contains":"${trimmedQuery}"}}]}`;
    }
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
      this.#loadCampaigns(data.sort((a, b) => a.approved - b.approved));
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

  #loadCampaigns(data) {
    const template = document.getElementById("campaign-card-template");

    this.sectionContainer.replaceChildren();

    data.forEach(async (camp) => {
      const clone = template.content.cloneNode(true);

      clone.querySelector(".campaign-title").textContent = camp.title;
      clone.querySelector(".category-badge").textContent = camp.category;
      clone.querySelector(".campaign-img").src = camp.img;
      clone.querySelector(".campaign-desc").textContent = camp.shortDesc;
      clone.querySelector(".author-name").textContent =
        await this.#getCampaignAuthor(camp.owner_id);
      clone.querySelector(".goal-amount").textContent =
        currencyFormatter.format(camp.goal);
      if (camp.approved) {
        clone.querySelector(".status-pill").textContent = "Approved";
        clone.querySelector(".status-pill").classList.add("approved");
        clone.querySelector(".admin-actions").classList.add("hidden");
      } else {
        clone.querySelector(".status-pill").textContent = "Pending Approval";
        clone.querySelector(".status-pill").classList.add("waiting");
      }

      const daysLeft = getDaysLeft(camp.deadline);

      clone.querySelector(".days-left").textContent = `${daysLeft} days left`;
      if (daysLeft <= 1) {
        clone.querySelector(".days-left").textContent = `Ended`;
        clone.querySelector(".days-left").style.color = "var(--destructive)";
      }

      let [raisedAmount, backersCount] = await this.#getCampaignPledges(
        camp.id,
      );

      clone.querySelector(".raised-amount").textContent =
        currencyFormatter.format(raisedAmount);
      clone.querySelector(".backers-count").textContent = backersCount;

      const percentage = (parseInt(raisedAmount) / parseInt(camp.goal)) * 100;
      const safePercentage = Math.min(Math.max(percentage, 0), 100);

      const progressFill = clone.querySelector(".progress-fill");
      progressFill.style.width = `${safePercentage}%`;

      clone.querySelector(".bi-geo-alt").textContent = camp.location;

      const approveBtn = clone.querySelector(".btn-approve");
      approveBtn.addEventListener("click", () => {
        this.#approveCamp(camp);
      });

      const deleteeBtn = clone.querySelector(".btn-delete");
      deleteeBtn.addEventListener("click", () => {
        this.#deleteCamp(camp);
      });

      const card = clone.querySelector(".campaign-card");

      card.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") return;

        const modal = document.getElementById("campaign-modal");
        modal.classList.remove("hidden");

        const closeBtn = document.getElementById("close-modal");

        document.body.style.overflow = "hidden";

        closeBtn.addEventListener("click", () => {
          modal.classList.add("hidden");
          document.body.style.overflow = "auto";
        });

        if (camp.video !== "") {
          this.overviewVideo.style.display = "block";
          this.overviewVideo.addEventListener("click", () => {
            window.open(camp.video, "_blank");
          });
        } else {
          this.overviewVideo.style.display = "none";
        }

        this.overviewTitle.textContent = camp.title;
        this.overviewCat.textContent = camp.category;
        this.overviewAmount.textContent = `Goal: ${currencyFormatter.format(camp.goal)}`;
        const daysLeft = getDaysLeft(camp.deadline);
        this.overviewDays.textContent = `${daysLeft} Days`;
        this.overviewImg.src = camp.img;

        this.overviewShortDesc.textContent = camp.shortDesc;
        this.overviewLocation.textContent = camp.location;
        this.overviewRLdesc.textContent = camp.longDesc;
        this.overviewRLstory.textContent = camp.story;

        const defaultTab = document.querySelector('input[name="view"]:checked');

        if (defaultTab) {
          const desc = document.querySelector(`.long-${defaultTab.value}`);
          desc.classList.remove("hidden");
        }

        document.querySelectorAll('input[name="view"]').forEach((radio) => {
          radio.addEventListener("change", (e) => {
            this.#resetRadios();
            document
              .querySelector(`.long-${e.target.value}`)
              .classList.remove("hidden");
          });
        });
      });

      this.sectionContainer.appendChild(clone);
    });
  }

  #resetRadios() {
    document.querySelectorAll('input[name="view"]').forEach((radio) => {
      document.querySelector(`.long-${radio.value}`).classList.add("hidden");
    });
  }

  async #getCampaignPledges(id) {
    const response = await fetch(`/pledges?campaign=${encodeURIComponent(id)}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    return [
      data.reduce((sum, item) => sum + parseInt(item.amount), 0),
      data.length,
    ];
  }

  async #getCampaignAuthor(id) {
    const response = await fetch(`/users/${id}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    return `${data.firstName} ${data.lastName}`;
  }

  async #approveCamp(camp) {
    camp.approved = !camp.approved;

    const response = await fetch(`/campaigns/${camp.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(camp),
    });

    if (response.ok) {
      this.#fetchSection("campaigns");
      showSuccess(`The selected campaign has been approved.`);
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
  }

  async #deleteCamp(camp) {
    const response = await fetch(`/campaigns/${camp.id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      this.#fetchSection("campaigns");
      showSuccess(`The selected campaign has been deleted.`);
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
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
