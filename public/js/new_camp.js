import { getCurrentUser, isLoggedIn } from "./auth.js";
import { currencyFormatter, showSuccess } from "./utils.js";

export class NewCampaign {
  constructor() {
    this.currentStep = 1;

    this.startCampaignScreen = document.getElementById("start-campaign");
    this.loadingScreen = document.getElementById("loading");

    this.customSelect = document.getElementById("categorySelect");
    this.trigger = this.customSelect.querySelector(".custom-select-trigger");
    this.menu = this.customSelect.querySelector(".custom-select-menu");
    this.options = this.customSelect.querySelectorAll(".custom-select-option");
    this.categoryValueText = this.customSelect.querySelector(
      ".custom-select-value",
    );
    this.hiddenInput = this.customSelect.querySelector('input[type="hidden"]');
    this.categoryValueText.classList.add("placeholder");

    this.newCampForm = document.getElementById("new-camp-form");
    this.newCampInputs = this.newCampForm.querySelectorAll(".primary-input");
    this.categorySelect = document.getElementById("categorySelect");
    this.categorySelectErrorMsg =
      this.categorySelect.closest("div").nextElementSibling;
    this.firstStepForm = document.getElementById("new-camp-form");
    this.stepOneSection = document.getElementById("step-one-section");
    this.stepTwoSection = document.getElementById("step-two-section");
    this.stepThreeSection = document.getElementById("step-three-section");
    this.stepFourSection = document.getElementById("step-four-section");
    this.stepOne = document.getElementById("step-one");
    this.stepTwo = document.getElementById("step-two");
    this.stepThree = document.getElementById("step-three");
    this.stepFour = document.getElementById("step-four");

    this.prevBtn = document.getElementById("prevBtn");
    this.stepText = document.getElementById("step-text");

    this.imagePicker = document.getElementById("imagePicker");
    this.uploadTrigger = document.getElementById("picker-btn");
    this.imagePreview = document.getElementById("imagePreview");
    this.pickerArea = document.getElementById("picker-area");
    this.imagePickerSection = document.getElementById("picker-section");
    this.imagePickerErrorMsg =
      this.imagePickerSection.closest("div").nextElementSibling;
    this.removeImgBtn = document.getElementById("removeImage");

    this.nextStepBtn = document.getElementById("next-step");
    this.launchBtn = document.getElementById("launch-campaign");

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

    this.launchCampaignBtn = document.getElementById("launch-campaign");

    this.pickedBase64;
  }

  init() {
    if (isLoggedIn()) {
      this.#initCustomSelect();
      this.#initNewCamp();
      this.#initPreviousBtn();
      this.#initImagePicker();
    }
  }

  #initCustomSelect() {
    this.trigger.addEventListener("click", () => {
      const isOpen = this.customSelect.classList.contains("open");

      this.customSelect.classList.toggle("open");
      this.menu.classList.toggle("hidden");
      this.trigger.setAttribute("aria-expanded", String(!isOpen));
    });

    this.options.forEach((option) => {
      option.addEventListener("click", () => {
        this.options.forEach((item) => item.classList.remove("selected"));
        option.classList.add("selected");

        this.categoryValueText.textContent = option.textContent;
        this.categoryValueText.classList.remove("placeholder");
        this.hiddenInput.value = option.dataset.value;

        this.customSelect.classList.remove("invalid");
        this.customSelect.classList.remove("open");
        this.menu.classList.add("hidden");
        this.trigger.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!this.customSelect.contains(e.target)) {
        this.customSelect.classList.remove("open");
        this.menu.classList.add("hidden");
        this.trigger.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll('input[name="view"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.#resetRadios();
        document
          .querySelector(`.long-${e.target.value}`)
          .classList.remove("hidden");
      });
    });

    this.loadingScreen.style.display = "none";
    this.startCampaignScreen.style.display = "flex";
  }

  #initNewCamp() {
    this.#processSteps(1);

    this.newCampForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!this.#validateInputs()) return;

      if (this.currentStep !== 4) this.#processSteps(this.currentStep + 1);
    });
  }

  #validateInputs() {
    let valid = true;

    this.newCampInputs.forEach((input) => {
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

    if (this.categorySelect.offsetParent !== null) {
      if (this.hiddenInput.value === "") {
        this.customSelect.classList.add("invalid");
        this.categorySelectErrorMsg.style.display = "block";
        valid = false;
      } else {
        this.customSelect.classList.remove("invalid");
        this.categorySelectErrorMsg.style.display = "none";
      }
    }

    this.imagePickerErrorMsg.textContent =
      "Campaign image is required. (PNG, JPG up to 10MB)";

    if (this.imagePickerSection.offsetParent !== null) {
      if (!this.imagePicker.checkValidity()) {
        this.imagePickerSection.classList.add("invalid");
        this.imagePickerErrorMsg.style.display = "block";
        valid = false;
      } else {
        this.imagePickerSection.classList.remove("invalid");
        this.imagePickerErrorMsg.style.display = "none";
      }
    }

    return valid;
  }

  #initPreviousBtn() {
    this.prevBtn.addEventListener("click", () => {
      if (this.currentStep !== 0) {
        this.#processSteps(this.currentStep - 1);
      }
    });
  }

  #processSteps(step) {
    this.currentStep = step;
    this.stepText.textContent = `Step ${this.currentStep} or 4`;

    if (step === 1) {
      this.#processStepOne();
    } else if (step === 2) {
      this.#processStepTwo();
    } else if (step === 3) {
      this.#processStepThree();
    } else if (step === 4) {
      this.#processStepFour();
    }
  }

  #clearSelectedStep() {
    this.stepOne.classList.remove("selected");
    this.stepTwo.classList.remove("selected");
    this.stepThree.classList.remove("selected");
    this.stepFour.classList.remove("selected");
    this.stepOneSection.classList.add("hidden");
    this.stepTwoSection.classList.add("hidden");
    this.stepThreeSection.classList.add("hidden");
    this.stepFourSection.classList.add("hidden");
  }

  #processStepOne() {
    this.#clearSelectedStep();
    this.stepOneSection.classList.remove("hidden");
    this.stepOne.classList.add("selected");
    this.prevBtn.disabled = true;
  }

  #processStepTwo() {
    this.#clearSelectedStep();
    this.stepTwoSection.classList.remove("hidden");
    this.stepOne.classList.add("selected");
    this.stepTwo.classList.add("selected");
    this.prevBtn.disabled = false;
  }

  #processStepThree() {
    this.#clearSelectedStep();
    this.stepThreeSection.classList.remove("hidden");
    this.stepOne.classList.add("selected");
    this.stepTwo.classList.add("selected");
    this.stepThree.classList.add("selected");
    this.nextStepBtn.classList.remove("hidden");
    this.launchBtn.classList.add("hidden");
    this.prevBtn.disabled = false;
  }

  #processStepFour() {
    this.#clearSelectedStep();
    this.#initOverview();
    this.stepFourSection.classList.remove("hidden");
    this.stepOne.classList.add("selected");
    this.stepTwo.classList.add("selected");
    this.stepThree.classList.add("selected");
    this.stepFour.classList.add("selected");
    this.nextStepBtn.classList.add("hidden");
    this.launchBtn.classList.remove("hidden");
    this.prevBtn.disabled = false;
  }

  #initImagePicker() {
    this.removeImgBtn.addEventListener("click", () => {
      this.imagePicker.value = "";
      this.imagePreview.src = "";
      this.imagePreview.style.display = "none";
      this.pickerArea.classList.remove("hidden");
      this.removeImgBtn.style.display = "none";
    });

    this.uploadTrigger.addEventListener("click", () => imagePicker.click());

    this.imagePicker.addEventListener("change", async (event) => {
      const file = event.target.files[0];

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 5 * 1024 * 1024;

      if (!file) {
        this.imagePickerSection.classList.add("invalid");
        this.imagePickerErrorMsg.style.display = "block";
        return;
      } else if (!allowedTypes.includes(file.type)) {
        this.imagePicker.value = "";
        this.imagePickerSection.classList.add("invalid");
        this.imagePickerErrorMsg.textContent =
          "Only JPG and PNG files are allowed.";
        this.imagePickerErrorMsg.style.display = "block";
        return;
      } else if (file.size > maxSize) {
        this.imagePickerSection.classList.add("invalid");
        this.imagePickerErrorMsg.textContent = "File is too large. (max 10MB)";
        this.imagePickerErrorMsg.style.display = "block";
        return;
      } else {
        this.imagePickerSection.classList.remove("invalid");
        this.imagePickerErrorMsg.style.display = "none";
      }

      try {
        const base64String = await this.#readFileAsBase64(file);

        this.pickerArea.classList.add("hidden");
        this.imagePreview.src = base64String;
        this.pickedBase64 = base64String;
        this.imagePreview.style.display = "block";
        this.removeImgBtn.style.display = "block";
      } catch (error) {
        console.error("Error reading file:", error);
      }
    });
  }

  #readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  }

  #resetRadios() {
    document.querySelectorAll('input[name="view"]').forEach((radio) => {
      document.querySelector(`.long-${radio.value}`).classList.add("hidden");
    });
  }

  #initOverview() {
    const formData = new FormData(this.newCampForm);

    if (formData.get("video") !== "") {
      this.overviewVideo.style.display = "block";
      this.overviewVideo.addEventListener("click", () => {
        window.open(formData.get("video"), "_blank");
      });
    } else {
      this.overviewVideo.style.display = "none";
    }

    this.overviewTitle.textContent = formData.get("title");
    this.overviewCat.textContent = this.categoryValueText.textContent;
    this.overviewAmount.textContent = `Goal: ${currencyFormatter.format(formData.get("amount"))}`;
    this.overviewDays.textContent = `${formData.get("days")} Days`;
    this.overviewImg.src = this.pickedBase64;

    this.overviewShortDesc.textContent = formData.get("shortdesc");
    this.overviewLocation.textContent = formData.get("location");
    this.overviewRLdesc.textContent = formData.get("longdesc");
    this.overviewRLstory.textContent = formData.get("story");

    const defaultTab = document.querySelector('input[name="view"]:checked');

    if (defaultTab) {
      const desc = document.querySelector(`.long-${defaultTab.value}`);
      desc.classList.remove("hidden");
    }

    this.launchCampaignBtn.addEventListener("click", () => {
      this.#registerCampaign(formData);
    });
  }

  async #registerCampaign(formData) {
    const newCampaign = {
      title: formData.get("title"),
      category: this.categoryValueText.textContent.trim(),
      goal: formData.get("amount"),
      deadline: this.#processDeadline(parseInt(formData.get("days"))),
      img: this.pickedBase64,
      video: formData.get("video"),
      shortDesc: formData.get("shortdesc"),
      longDesc: formData.get("longdesc"),
      story: formData.get("story"),
      location: formData.get("location"),
      approved: false,
      owner_id: getCurrentUser().id,
    };

    this.#disableLaunchBtn();
    const success = await this.#fetchCampaignRegister(newCampaign);
    if (success) {
      showSuccess(
        "Your campaign has been launched successfully. Redirecting to home...",
      );
      setTimeout(() => {
        window.location.replace("/index.html");
      }, 3000);
    } else {
      this.#enableLaunchBtn();
    }
  }

  async #fetchCampaignRegister(campData) {
    const response = await fetch("/campaigns", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(campData),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return true;
  }

  #disableLaunchBtn() {
    this.launchCampaignBtn.disabled = true;
    this.launchCampaignBtn.textContent = "Launching...";
  }

  #enableLaunchBtn() {
    this.launchCampaignBtn.disabled = false;
    this.launchCampaignBtn.textContent = "Launch";
  }

  #processDeadline(daysToAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date;
  }
}
