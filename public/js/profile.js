import { getCurrentUser, isLoggedIn, logout } from "./auth.js";
import {
  currencyFormatter,
  formattedDate,
  formattedDateDetailed,
  getDaysLeft,
  showSuccess,
} from "./utils.js";

export class Profile {
  constructor() {
    this.adminMain = document.querySelector(".admin-main");
    this.loadingScreen = document.getElementById("loading");
    this.optionAdminDb = document.getElementById("admin-dashboard");
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

    this.formatter_global = currencyFormatter(0);

    this.activeSection;
  }

  init() {
    if (isLoggedIn()) {
      this.#initNavbar();
      this.#initSidePanel();
    }
  }

  #initNavbar() {
    this.#processLogin();
    this.#ProcessUserMenu();
    this.#processMenuContent();
    this.#processMenuOptions();
  }

  #initSidePanel() {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section") || 0;

    const page = this.listItems[section];
    page.classList.add("active");
    const initSection = page.querySelector("span").dataset.section;
    this.#fetchSection(initSection);
    this.activeSection = initSection;
    this.sectionTitle.textContent = page.textContent;

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

    this.loadingScreen.style.display = "none";
    this.adminMain.style.display = "flex";
  }

  async #fetchSection(section) {
    let filter;
    let grapper;

    if (section === "campaigns") {
      filter = `owner_id`;
      grapper = getCurrentUser().id;
    } else {
      filter = `backerEmail`;
      grapper = getCurrentUser().email;
    }

    const response = await fetch(`/${section}?${filter}=${grapper}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (section === "campaigns") {
      this.#loadCampaigns(data.sort((a, b) => a.approved - b.approved));
    } else if (section === "pledges") {
      this.#loadPledges(
        data.sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
    }
  }

  async #SearchSection(section, query) {
    const trimmedQuery = query.trim();
    let filter;

    if (section === "campaigns") {
      filter = `{"or":[{"title":{"contains":"${trimmedQuery}"}},{"goal":{"contains":"${trimmedQuery}"}},{"shortDesc":{"contains":"${trimmedQuery}"}},{"category":{"contains":"${trimmedQuery}"}}]}`;
    } else {
      filter = `{"or":[{"method":{"contains":"${trimmedQuery}"}},{"date":{"contains":"${trimmedQuery}"}}]}`;
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

    if (section === "campaigns") {
      const filtered = data.filter((e) => {
        return e.owner_id === getCurrentUser().id;
      });

      this.#loadCampaigns(filtered.sort((a, b) => a.approved - b.approved));
    } else {
      const filtered = data.filter((e) => {
        return e.backerEmail === getCurrentUser().email;
      });

      this.#loadPledges(
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date)),
      );
    }
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
        this.formatter_global.format(camp.goal);
      if (camp.approved) {
        clone.querySelector(".status-pill").textContent = "Approved";
        clone.querySelector(".status-pill").classList.add("approved");
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
        this.formatter_global.format(raisedAmount);
      clone.querySelector(".backers-count").textContent = backersCount;

      const percentage = (parseInt(raisedAmount) / parseInt(camp.goal)) * 100;
      const safePercentage = Math.min(Math.max(percentage, 0), 100);

      const progressFill = clone.querySelector(".progress-fill");
      progressFill.style.width = `${safePercentage}%`;

      clone.querySelector(".bi-geo-alt").textContent = camp.location;

      const editBtn = clone.querySelector(".btn-edit");
      editBtn.addEventListener("click", () => {
        window.location.href = `./new-campaign.html?edit=true&id=${camp.id}`;
      });

      const card = clone.querySelector(".campaign-card");

      card.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") return;

        this.#loadCampModal(camp);
      });

      this.sectionContainer.appendChild(clone);
    });
  }

  #loadCampModal(camp) {
    const modal = document.getElementById("campaign-modal");
    modal.classList.remove("hidden");

    const closeBtn = document.getElementById("close-modal");

    document.body.style.overflow = "hidden";

    const closeModal = () => {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
    };

    closeBtn.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
      }
    });

    const oldElement = this.overviewVideo;
    const newElement = oldElement.cloneNode(true);
    oldElement.replaceWith(newElement);
    this.overviewVideo = newElement;

    if (camp.video !== "") {
      newElement.style.display = "block";
      newElement.addEventListener("click", () => {
        window.open(camp.video, "_blank");
      });
    } else {
      newElement.style.display = "none";
    }

    this.overviewTitle.textContent = camp.title;
    this.overviewCat.textContent = camp.category;
    this.overviewAmount.textContent = `Goal: ${this.formatter_global.format(camp.goal)}`;
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
  }

  async #fetchSignleCampaign(id) {
    const response = await fetch(`/campaigns/${id}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    return data;
  }

  async #loadPledges(data) {
    const template = document.getElementById("pledge-card-template");

    this.sectionContainer.replaceChildren();

    for (const pledge of data) {
      const clone = template.content.cloneNode(true);

      clone.querySelector(".user-meta h4").textContent = pledge.backerName;
      clone.querySelector(".user-meta p").textContent = pledge.backerEmail;
      clone.querySelector(".amount").textContent = this.formatter_global.format(
        pledge.amount,
      );
      clone.querySelector(".status-pill").textContent = pledge.method;
      clone.querySelector(".method").textContent = pledge.method;
      clone.querySelector(".date").textContent = formattedDateDetailed(
        pledge.date,
      );

      const camData = await this.#fetchSignleCampaign(pledge.campaign);

      clone.querySelector(".btn-text").textContent = camData.title;
      const infoBtn = clone.querySelector(".btn-ban");

      infoBtn.addEventListener("click", () => {
        this.#loadCampModal(camData);
      });

      this.sectionContainer.appendChild(clone);
    }
  }

  #resetRadios() {
    document.querySelectorAll('input[name="view"]').forEach((radio) => {
      document.querySelector(`.long-${radio.value}`).classList.add("hidden");
    });
  }

  async #getCampaignPledges(id) {
    const response = await fetch(`/pledges?campaign=${id}`);

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

    if (getCurrentUser().role === "admin") {
      this.optionAdminDb.classList.remove("hidden");
    }
  }

  #processMenuOptions() {
    this.optionLogOut.addEventListener("click", () => {
      logout();
    });
  }
}
