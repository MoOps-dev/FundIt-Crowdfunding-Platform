import { isLoggedIn } from "./auth.js";
import { showSuccess } from "./utils.js";

export class Login {
  constructor() {
    this.mainScreen = document.getElementById("login-main");
    this.loadingScreen = document.getElementById("loading");
    this.loginPasswordInput = document.getElementById("password");
    this.passwordToggleBtn = document.getElementById("togglePassword");

    this.loginForm = document.getElementById("login-form");
    this.loginEmailInput = document.getElementById("email");
    this.loginInputs = this.loginForm.querySelectorAll(".primary-input");
    this.loginRememberMe = document.getElementById("check");
    this.signinButton = document.getElementById("login");
    this.loginIncorrectMsg =
      document.querySelector(".checkbox-row").lastElementChild;
    this.originalSigninButtonText = this.signinButton.textContent;
  }

  init() {
    if (!isLoggedIn()) {
      this.#initPasswordToggle();
      this.#initLogin();
    }
  }

  #initPasswordToggle() {
    this.passwordToggleBtn.addEventListener("click", () => {
      const icon = this.passwordToggleBtn.querySelector("i");
      const isHidden = this.loginPasswordInput.type === "password";

      if (isHidden) {
        this.loginPasswordInput.type = "text";
        icon.classList.replace("bi-eye", "bi-eye-slash");
      } else {
        this.loginPasswordInput.type = "password";
        icon.classList.replace("bi-eye-slash", "bi-eye");
      }
    });
  }

  #initLogin() {
    this.loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      this.#hideIncorrectMsg();

      if (!this.#validateInputs()) return;

      this.#disableSignInBtn();

      try {
        const userAuth = await this.#auth();
        const user = userAuth[0];

        if (userAuth.length > 0) {
          this.#login(user);
        } else {
          this.#notFound();
        }
      } catch (error) {
        console.error(error);
        this.#enableSignInBtn();
      }
    });

    this.loadingScreen.style.display = "none";
    this.mainScreen.style.display = "flex";
  }

  #hideIncorrectMsg() {
    this.loginIncorrectMsg.style.display = "none";
  }

  #validateInputs() {
    let valid = true;

    this.loginInputs.forEach((input) => {
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

    return valid;
  }

  #disableSignInBtn() {
    this.signinButton.disabled = true;
    this.signinButton.textContent = "Signing you in...";
  }

  #enableSignInBtn() {
    this.signinButton.disabled = false;
    this.signinButton.textContent = this.originalSigninButtonText;
  }

  async #auth() {
    const formData = new FormData(this.loginForm);

    const user = await this.#checkUser(
      formData.get("email"),
      formData.get("password"),
    );

    return user;
  }

  #login(user) {
    const loggedInUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };

    if (this.loginRememberMe.checked) {
      localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
    } else {
      sessionStorage.setItem("currentUser", JSON.stringify(loggedInUser));
    }

    showSuccess("Login successful. Redirecting to Home...");
    setTimeout(() => {
      window.location.replace("/index.html");
    }, 2000);
  }

  #notFound() {
    this.loginEmailInput.classList.add("invalid");
    this.loginPasswordInput.classList.add("invalid");
    this.loginIncorrectMsg.style.display = "block";

    this.#enableSignInBtn();
  }

  async #checkUser(email, password) {
    const response = await fetch(
      `/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    );

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  }
}
