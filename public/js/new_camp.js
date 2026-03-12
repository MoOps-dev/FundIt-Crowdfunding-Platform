import { isLoggedIn } from "./auth.js";

export class NewCampaign {
  constructor() {
    this.currentStep = 1;

    this.startCampaignScreen = document.getElementById("start-campaign");
    this.loadingScreen = document.getElementById("loading");

    this.customSelect = document.getElementById("categorySelect");
    this.trigger = this.customSelect.querySelector(".custom-select-trigger");
    this.menu = this.customSelect.querySelector(".custom-select-menu");
    this.options = this.customSelect.querySelectorAll(".custom-select-option");
    this.valueText = this.customSelect.querySelector(".custom-select-value");
    this.hiddenInput = this.customSelect.querySelector('input[type="hidden"]');
    this.valueText.classList.add("placeholder");

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

        this.valueText.textContent = option.textContent;
        this.valueText.classList.remove("placeholder");
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

    this.loadingScreen.style.display = "none";
    this.startCampaignScreen.style.display = "flex";
  }

  #initNewCamp() {
    this.#processSteps(4);

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

    this.imagePicker.addEventListener("change", (event) => {
      const file = event.target.files[0];

      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      const maxSize = 10 * 1024 * 1024;

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

      if (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
          this.pickerArea.classList.add("hidden");
          this.imagePreview.src = e.target.result;
          this.imagePreview.style.display = "block";
          this.removeImgBtn.style.display = "block";
        };

        reader.readAsDataURL(file);
      }
    });
  }
}
