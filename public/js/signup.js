import { isLoggedIn } from "./auth.js";
import { showSuccess } from "./utils.js";

export class Register {
  constructor() {
    this.mainScreen = document.getElementById("signup-main");
    this.loadingScreen = document.getElementById("loading");
    this.signupConfirmPasswordInput =
      document.getElementById("confirmPassword");
    this.passwordToggleBtn = document.getElementById("togglePassword");
    this.confirmPasswordToggleBtn = document.getElementById(
      "toggleConfirmPassword",
    );

    this.signupForm = document.getElementById("signup-form");
    this.signupPasswordInput = document.getElementById("password");
    this.signupInputs = this.signupForm.querySelectorAll(".primary-input");
    this.signupTermsCheckbox = document.getElementById("check");
    this.signupTermsErrorMsg =
      document.querySelector(".checkbox-row").lastElementChild;
    this.signupConfirmPasswordError =
      this.signupConfirmPasswordInput.closest("div").nextElementSibling;
    this.signupButton = document.getElementById("register");
    this.signupEmailInput = document.getElementById("email");
    this.signupEmailErrorMsg =
      this.signupEmailInput.closest("div").nextElementSibling;
    this.originalSignupButtonText = this.signupButton.textContent;
  }

  init() {
    if (!isLoggedIn()) {
      this.#initPasswordToggle();
      this.#initConfirmPasswordToggle();
      this.#initRegister();
    }
  }

  #initPasswordToggle() {
    this.passwordToggleBtn.addEventListener("click", () => {
      const icon = this.passwordToggleBtn.querySelector("i");
      const isHidden = this.signupPasswordInput.type === "password";

      if (isHidden) {
        this.signupPasswordInput.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
      } else {
        this.signupPasswordInput.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
      }
    });
  }

  #initConfirmPasswordToggle() {
    this.confirmPasswordToggleBtn.addEventListener("click", () => {
      const icon = this.confirmPasswordToggleBtn.querySelector("i");

      if (this.signupConfirmPasswordInput.type === "password") {
        this.signupConfirmPasswordInput.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
      } else {
        this.signupConfirmPasswordInput.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
      }
    });
  }

  #initRegister() {
    this.signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      this.#resetCustomErrorMessages();

      if (!this.#validateInputs()) return;

      this.#disableSignUpBtn();

      try {
        const newUser = await this.#createUser();

        if (newUser) {
          await this.#register(newUser);
        } else {
          this.#userExistsError();
          this.#enableSignUpBtn();
        }
      } catch (error) {
        console.error(error);
        this.#enableSignUpBtn();
      }
    });

    this.loadingScreen.style.display = "none";
    this.mainScreen.style.display = "flex";
  }

  #resetCustomErrorMessages() {
    this.signupConfirmPasswordError.textContent =
      "Please confirm your password.";
    this.signupEmailErrorMsg.textContent =
      "Email is required and must be a valid email address (minimum 5 characters).";
  }

  #validateInputs() {
    let valid = true;

    this.signupInputs.forEach((input) => {
      const error = input.closest("div").nextElementSibling;

      if (!input.checkValidity()) {
        input.classList.add("invalid");
        error.style.display = "block";
        valid = false;
      } else {
        input.classList.remove("invalid");
        error.style.display = "none";
      }
    });

    if (!this.signupTermsCheckbox.checkValidity()) {
      this.signupTermsCheckbox.classList.add("invalid");
      this.signupTermsErrorMsg.style.display = "block";
      valid = false;
    } else {
      this.signupTermsCheckbox.classList.remove("invalid");
      this.signupTermsErrorMsg.style.display = "none";
    }

    if (
      this.signupPasswordInput.value !== this.signupConfirmPasswordInput.value
    ) {
      this.signupConfirmPasswordInput.classList.add("invalid");
      this.signupConfirmPasswordError.textContent = "Passwords do not match.";
      this.signupConfirmPasswordError.style.display = "block";
      valid = false;
    } else if (this.signupConfirmPasswordInput.checkValidity()) {
      this.signupConfirmPasswordInput.classList.remove("invalid");
      this.signupConfirmPasswordError.style.display = "none";
    }

    return valid;
  }

  #disableSignUpBtn() {
    this.signupButton.disabled = true;
    this.signupButton.textContent = "Creating your account...";
  }

  #enableSignUpBtn() {
    this.signupButton.disabled = false;
    this.signupButton.textContent = this.originalSignupButtonText;
  }

  #userExistsError() {
    this.signupEmailInput.classList.add("invalid");
    this.signupEmailErrorMsg.textContent =
      "An account with this email already exists.";
    this.signupEmailErrorMsg.style.display = "block";
  }

  async #createUser() {
    const formData = new FormData(this.signupForm);

    const newUser = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: "user",
      isActive: true,
    };

    const exist = await this.#checkUser(formData.get("email"));

    if (exist.length > 0) return null;

    return newUser;
  }

  async #checkUser(email) {
    const response = await fetch(`/users?email=${encodeURIComponent(email)}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async #register(newUser) {
    const success = await this.#registerUser(newUser);
    if (success) {
      showSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        window.location.replace("/login.html");
      }, 2000);
    }
  }

  async #registerUser(user) {
    const response = await fetch("/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return true;
  }
}
