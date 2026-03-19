import { getCurrentUser, isLoggedIn, logout } from "./auth.js";
import {
  currencyFormatter,
  formattedDate,
  getDaysLeft,
  showSuccess,
} from "./utils.js";

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

    this.badgeFunded = document.querySelector(".badge-funded");
    this.badgeCategory = document.querySelector(".badge-category");
    this.amountRaised = document.querySelector(".amount-raised");
    this.goalText = document.querySelector(".goal-text");
    this.progressFill = document.querySelector(".progress-fill");
    this.backers = document.getElementById("backers");
    this.days = document.getElementById("days-to-go");
    this.deadline = document.getElementById("deadline");
    this.location = document.getElementById("location");
    this.owner = document.querySelector(".window-info");

    this.btnDiscover = document.getElementById("discover-btn");
    this.heroSection = document.querySelector(".hero");
    this.discoverSection = document.querySelector(".discover");

    this.discoverTitle = document.querySelector(".discover-header h2");
    this.searchBox = document.getElementById("search");
    this.searchBoxRes = document.getElementById("search-res");

    this.backCampaign = document.querySelector(".btn-back-project");
    this.fundingPay = document.querySelector(".funding-pay");
    this.fundingBack = document.querySelector(".funding-back");
    this.descSection = document.querySelector(".camp-info-desc");
    this.modalImg = document.querySelector(".modal-top-image");
    this.paymentFlow = document.getElementById("pledge-form");
    this.paymentInputs = this.paymentFlow.querySelectorAll(".primary-input");
    this.backToCampInfo = document.getElementById("back-to-camp-info");
    this.pledgeBtn = document.getElementById("pledge-button");

    this.paymentTermsCheckbox = document.getElementById("check");
    this.paymentTermsErrorMsg =
      document.querySelector(".terms-label").lastElementChild;

    this.amountInput = document.getElementById("amount");
    this.initialAmount = document.getElementById("initial-amount");
    this.feeAmount = document.getElementById("fee-amount");
    this.totalAmount = document.getElementById("total-amount");

    this.formatter_global = currencyFormatter(0);

    this.originalCampHeader;

    this.ITEMS_PER_PAGE = 8;
    this.currentPage = 1;
  }

  init() {
    this.#initNavbar();
    this.#fetchCampaigns();
    this.#initSearchFilters();
    this.#initPaymentFlow();
    this.#initSubmit();
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

    this.navMenu.addEventListener("click", () => {
      this.navMenu.classList.remove("active");
      document.body.style.overflow = "auto";
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

    this.btnDiscover.addEventListener("click", (e) => {
      if (e.target.textContent === "Discover") {
        this.#hideHero();
      } else {
        this.#showHero();
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

  async #fetchCampaigns(query = "") {
    const trimmedQuery = query.trim();
    const currentTab = document.querySelector('input[name="category"]:checked');

    let filter = `{"or":[{"title":{"contains":"${trimmedQuery}"}},{"goal":{"contains":"${trimmedQuery}"}},{"category":{"contains":"${trimmedQuery}"}},{"shortDesc":{"contains":"${trimmedQuery}"}}]}`;

    const response = await fetch(
      `/campaigns?${query !== "" ? `_where=${encodeURIComponent(filter)}` : ""}`,
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    this.#loadCampaigns(
      data.filter((e) => {
        if (currentTab.value !== "") {
          return (e.approved === true) & (e.category === currentTab.value);
        } else {
          return e.approved === true;
        }
      }),
    );
  }

  #loadCampaigns(data) {
    const count = document.querySelector(".discover-header span");
    const noCamp = document.querySelector(".no-camps");
    const campaignCount = data.length;

    const startIndex = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
    const endIndex = startIndex + this.ITEMS_PER_PAGE;
    const paginatedData = data.slice(startIndex, endIndex);

    if (data.length < 1) {
      noCamp.classList.remove("hidden");
      this.#hideHero();
    } else {
      noCamp.classList.add("hidden");
    }

    count.textContent = `${campaignCount < 1 ? 0 : startIndex + 1}-${endIndex > campaignCount ? campaignCount : endIndex} of ${campaignCount} Campaigns`;
    const template = document.getElementById("campaign-card-template");

    this.sectionContainer.replaceChildren();

    paginatedData.forEach(async (camp) => {
      const clone = template.content.cloneNode(true);

      clone.querySelector(".campaign-title").textContent = camp.title;
      clone.querySelector(".category-badge").textContent = camp.category;
      clone.querySelector(".campaign-img").src = camp.img;
      clone.querySelector(".campaign-desc").textContent = camp.shortDesc;
      const campOwner = await this.#getCampaignAuthor(camp.owner_id);
      clone.querySelector(".author-name").textContent = campOwner;

      clone.querySelector(".goal-amount").textContent =
        this.formatter_global.format(camp.goal);
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
        this.formatter_global.format(raisedAmount);
      clone.querySelector(".backers-count").textContent = backersCount;

      const percentage = (parseInt(raisedAmount) / parseInt(camp.goal)) * 100;
      const safePercentage = Math.min(Math.max(percentage, 0), 100);

      const progressFill = clone.querySelector(".progress-fill");
      progressFill.style.width = `${safePercentage}%`;

      clone.querySelector(".bi-geo-alt").textContent = camp.location;

      const card = clone.querySelector(".campaign-card");

      card.addEventListener("click", (e) => {
        if (e.target.tagName === "BUTTON") return;

        this.#resetModal();

        const modal = document.getElementById("campaign-modal");
        modal.classList.remove("hidden");

        const closeBtn = document.getElementById("close-modal");

        document.body.style.overflow = "hidden";

        const closeModal = () => {
          modal.classList.add("hidden");
          document.body.style.overflow = "auto";
        };

        closeBtn.addEventListener("click", closeModal, { once: true });

        document.addEventListener(
          "keydown",
          (e) => {
            if (e.key === "Escape" && !modal.classList.contains("hidden")) {
              closeModal();
            }
          },
          { once: true },
        );

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

        this.badgeFunded.textContent =
          safePercentage >= 100
            ? "Funded"
            : `${Math.floor(safePercentage)}% Funded`;

        this.badgeCategory.textContent = camp.category;

        this.progressFill.style.width = `${safePercentage}%`;
        const defaultTab = document.querySelector('input[name="view"]:checked');

        if (defaultTab) {
          const desc = document.querySelector(`.long-${defaultTab.value}`);
          desc.classList.remove("hidden");
        }

        this.amountRaised.textContent =
          this.formatter_global.format(raisedAmount);
        this.backers.textContent = backersCount;
        this.days.textContent = daysLeft;
        this.goalText.textContent = `pledged of ${this.formatter_global.format(camp.goal)} goal`;
        this.deadline.textContent = `Ends ${formattedDate(camp.deadline)}`;
        this.location.textContent = camp.location;
        this.owner.textContent = `Campaign by ${campOwner}`;
        this.originalCampHeader = this.owner.textContent;

        document.querySelectorAll('input[name="view"]').forEach((radio) => {
          radio.addEventListener("change", (e) => {
            this.#resetRadiosIndex();
            document
              .querySelector(`.long-${e.target.value}`)
              .classList.remove("hidden");
          });
        });

        this.pledgeBtn.dataset.id = camp.id;
      });

      this.sectionContainer.appendChild(clone);
    });

    this.#renderPaginationControls(data.length);
  }

  #renderPaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / this.ITEMS_PER_PAGE);
    const controlsContainer = document.getElementById("pagination-controls");
    controlsContainer.innerHTML = "";

    if (totalPages <= 1) return;

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.className = i === this.currentPage ? "active-page" : "page-btn";
      btn.addEventListener("click", () => {
        this.currentPage = i;
        this.#fetchCampaigns(this.searchBox.value);
      });
      controlsContainer.appendChild(btn);
    }
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

  #hideHero() {
    this.heroSection.classList.add("hidden");
    this.btnDiscover.textContent = "Home";
    this.discoverSection.classList.add("focused");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  #showHero() {
    this.heroSection.classList.remove("hidden");
    this.btnDiscover.textContent = "Discover";
    this.discoverSection.classList.remove("focused");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  #initSearchFilters() {
    document.querySelectorAll('input[name="category"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.#hideHero();
        const searchValue = this.searchBox.value || this.searchBoxRes.value;
        this.#fetchCampaigns(searchValue);
        if (e.target.value !== "") {
          this.discoverTitle.textContent = `${e.target.value} Campaigns`;
        } else {
          this.discoverTitle.textContent = "Discover";
        }
      });
    });

    const categories = document.querySelectorAll(".cat-list li");

    categories.forEach((item, index) => {
      const text = item.textContent.trim();
      item.addEventListener("click", () => {
        const targetRadio = document.querySelector(
          `input[name="category"][value="${text}"]`,
        );

        if (targetRadio) {
          targetRadio.checked = true;
          targetRadio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
    });

    let searchTimer;
    this.searchBox.addEventListener("input", (e) => {
      const value = e.target.value;
      clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        this.#hideHero();
        this.#fetchCampaigns(value);
      }, 1000);
    });

    this.searchBoxRes.addEventListener("input", (e) => {
      const value = e.target.value;
      clearTimeout(searchTimer);

      searchTimer = setTimeout(() => {
        this.#hideHero();
        this.#fetchCampaigns(value);
      }, 1000);
    });
  }

  #initPaymentFlow() {
    this.backCampaign.addEventListener("click", (e) => {
      if (!isLoggedIn()) {
        window.location.replace("./login.html");
        return;
      }

      const defaultTab = document.querySelector(
        'input[name="payment-method"]:checked',
      );

      if (defaultTab) {
        const desc = document.querySelector(`.pay-${defaultTab.value}`);
        desc.classList.remove("hidden");
      }

      this.backToCampInfo.addEventListener("click", () => {
        this.#resetModal();
      });

      document
        .querySelectorAll('input[name="payment-method"]')
        .forEach((radio) => {
          radio.addEventListener("change", (e) => {
            this.#resetPayRadios();
            document
              .querySelector(`.pay-${e.target.value}`)
              .classList.remove("hidden");
          });
        });

      this.fundingPay.classList.remove("hidden");
      this.backToCampInfo.classList.remove("hidden");
      this.paymentFlow.classList.remove("hidden");
      this.descSection.classList.add("hidden");
      this.modalImg.classList.add("hidden");
      this.fundingBack.classList.add("hidden");
      this.owner.textContent = "Back this Campaign";

      this.amountInput.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value) || 0;
        const fee = (value * 5) / 100;
        const formatter_pledge = currencyFormatter(1);

        this.initialAmount.textContent = formatter_pledge.format(value);
        this.feeAmount.textContent = formatter_pledge.format(fee);
        this.totalAmount.textContent = formatter_pledge.format(value + fee);
        this.pledgeBtn.textContent = `Pledge ${this.totalAmount.textContent}`;
        this.pledgeBtn.dataset.amount = value;
      });
    });
  }

  #initSubmit() {
    this.paymentFlow.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!this.#validateInputs()) return;

      this.#disablePledgeButton();

      const campId = this.pledgeBtn.dataset.id;
      const pledgeAmount = this.pledgeBtn.dataset.amount;

      const method = document.querySelector(
        'input[name="payment-method"]:checked',
      );

      const pledgeData = {
        campaign: campId,
        backerName: getCurrentUser().fullName,
        backerEmail: getCurrentUser().email,
        amount: parseInt(pledgeAmount),
        method: method.value,
        date: new Date(),
      };

      const success = await this.#fetchPledgePayment(pledgeData);
      if (success) {
        setTimeout(() => {
          showSuccess(
            "Your payment has been proccessed successfuly, Thanks your for your support <3",
          );
          this.#fetchCampaigns();
          this.#resetModal();
        }, 3000);
      } else {
        this.#enablePledgeButton();
      }
    });
  }

  async #fetchPledgePayment(data) {
    const response = await fetch("/pledges", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return true;
  }

  #validateInputs() {
    let valid = true;

    this.paymentInputs.forEach((input) => {
      if (input.offsetParent !== null) {
        const error = input.closest("div").nextElementSibling;

        if (!input.checkValidity()) {
          input.classList.add("invalid");
          error.style.display = "block";
          valid = false;
        } else {
          input.classList.remove("invalid");
          error.style.display = "none";
        }
      }
    });

    if (!this.paymentTermsCheckbox.checkValidity()) {
      this.paymentTermsCheckbox.classList.add("invalid");
      this.paymentTermsErrorMsg.style.display = "block";
      valid = false;
    } else {
      this.paymentTermsCheckbox.classList.remove("invalid");
      this.paymentTermsErrorMsg.style.display = "none";
    }

    return valid;
  }

  #resetModal() {
    this.fundingBack.classList.remove("hidden");
    this.fundingPay.classList.add("hidden");
    this.backToCampInfo.classList.add("hidden");
    this.paymentFlow.classList.add("hidden");
    this.descSection.classList.remove("hidden");
    this.modalImg.classList.remove("hidden");
    this.owner.textContent = this.originalCampHeader;
    this.#enablePledgeButton();
  }

  #resetPayRadios() {
    document
      .querySelectorAll('input[name="payment-method"]')
      .forEach((radio) => {
        document.querySelector(`.pay-${radio.value}`).classList.add("hidden");
      });
  }

  #disablePledgeButton() {
    this.pledgeBtn.disabled = true;
    this.pledgeBtn.textContent = "Processing Payment...";
  }

  #enablePledgeButton() {
    this.pledgeBtn.disabled = false;
    this.pledgeBtn.textContent = `Pledge ${this.totalAmount.textContent}`;
  }
}
