import { getCurrentUser, isLoggedIn, logout } from "./auth.js";
import { currencyFormatter, formattedDate, getDaysLeft } from "./utils.js";

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

    this.sectionContainer = document.querySelector(".projects");

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

    this.badge = document.querySelector(".badge");
    this.amountRaised = document.querySelector(".amount-raised");
    this.goalText = document.querySelector(".goal-text");
    this.progressFill = document.querySelector(".progress-fill");
    this.backers = document.getElementById("backers");
    this.days = document.getElementById("days");
    this.deadline = document.getElementById("deadline");
    this.location = document.getElementById("location");
    this.owner = document.querySelector(".window-info");
  }

  init() {
    this.#initNavbar();
    this.#fetchCampaigns();
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

  async #fetchCampaigns() {
    const response = await fetch(`/campaigns?approved=true`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    this.#loadCampaigns(data.sort((a, b) => a.approved - b.approved));
  }

  #loadCampaigns(data) {
    const count = document.querySelector(".discover-header span");
    count.textContent = `${data.length} Campaigns`;
    const template = document.getElementById("campaign-card-template");

    this.sectionContainer.replaceChildren();

    data.forEach(async (camp) => {
      const clone = template.content.cloneNode(true);

      clone.querySelector(".campaign-title").textContent = camp.title;
      clone.querySelector(".category-badge").textContent = camp.category;
      clone.querySelector(".campaign-img").src = camp.img;
      clone.querySelector(".campaign-desc").textContent = camp.shortDesc;
      const campOwner = await this.#getCampaignAuthor(camp.owner_id);
      clone.querySelector(".author-name").textContent =campOwner;
        
      clone.querySelector(".goal-amount").textContent =
        currencyFormatter.format(camp.goal);
      if (camp.approved) {
        clone.querySelector(".status-pill").textContent = "Approved";
        clone.querySelector(".status-pill").classList.add("approved");
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

      const card = clone.querySelector(".campaign-card");

      card.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") return;

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

        this.badge.textContent =
          safePercentage >= 100
            ? "Funded"
            : `${Math.floor(safePercentage)}% Funded`;

        this.progressFill.style.width = `${safePercentage}%`;
        const defaultTab = document.querySelector('input[name="view"]:checked');

        this.amountRaised.textContent = currencyFormatter.format(raisedAmount);
        this.backers.textContent = backersCount;
        this.days.textContent = daysLeft;
        this.goalText.textContent = `pledged of ${currencyFormatter.format(camp.goal)} goal`;
        this.deadline.textContent = `Ends ${formattedDate(camp.deadline)}`;
        this.location.textContent = camp.location;
        this.owner.textContent = `Campaign by ${campOwner}`;

        if (defaultTab) {
          const desc = document.querySelector(`.long-${defaultTab.value}`);
          desc.classList.remove("hidden");
        }

        document.querySelectorAll('input[name="view"]').forEach((radio) => {
          radio.addEventListener("change", (e) => {
            this.#resetRadiosIndex();
            document
              .querySelector(`.long-${e.target.value}`)
              .classList.remove("hidden");
          });
        });
      });

      this.sectionContainer.appendChild(clone);
    });
  }

  #resetRadiosIndex() {
    document.querySelectorAll('input[name="view"]').forEach((radio) => {
      document.querySelector(`.long-${radio.value}`).classList.add("hidden");
    });
  }

  async #getCampaignAuthor(id) {
    const response = await fetch(`/users/${id}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    return `${data.firstName} ${data.lastName}`;
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
}
