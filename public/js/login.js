import { showSuccess } from "./utils.js";

export function initPasswordToggle() {
  const loginPasswordInput = document.getElementById("password");
  const passwordToggleBtn = document.getElementById("togglePassword");

  passwordToggleBtn.addEventListener("click", () => {
    const icon = passwordToggleBtn.querySelector("i");

    if (loginPasswordInput.type === "password") {
      loginPasswordInput.type = "text";
      icon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
      loginPasswordInput.type = "password";
      icon.classList.replace("bi-eye-slash", "bi-eye");
    }
  });
}

export function initLogin() {
  const loginForm = document.getElementById("login-form");
  const loginEmailInput = document.getElementById("email");
  const loginPasswordInput = document.getElementById("password");
  const loginInputs = loginForm.querySelectorAll(".primary-input");
  const loginRememberMe = document.getElementById("check");
  const signinButton = document.getElementById("login");
  const loginIncorrectMsg =
    document.querySelector(".checkbox-row").lastElementChild;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let valid = true;

    loginIncorrectMsg.style.display = "none";

    loginInputs.forEach((input) => {
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

    if (!valid) return;

    const originalSigninButtonText = signinButton.textContent;

    signinButton.disabled = true;
    signinButton.textContent = "Signing you in...";

    const formData = new FormData(loginForm);

    const user = await checkUser(
      formData.get("email"),
      formData.get("password"),
    );

    if (user.length > 0) {
      const loggedInUser = {
        id: user[0].id,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        email: user[0].email,
        role: user[0].role,
        isActive: user[0].isActive,
      };

      if (loginRememberMe.checked) {
        localStorage.setItem("currentUser", JSON.stringify(loggedInUser));
      } else {
        sessionStorage.setItem("currentUser", JSON.stringify(loggedInUser));
      }

      showSuccess("Login successful. Redirecting to Home...");
      setTimeout(() => {
        window.location.href = "/index.html";
      }, 2000);
    } else {
      loginEmailInput.classList.add("invalid");
      loginPasswordInput.classList.add("invalid");
      loginIncorrectMsg.style.display = "block";

      signinButton.disabled = false;
      signinButton.textContent = originalSigninButtonText;
    }
  });
}

async function checkUser(email, password) {
  const response = await fetch(
    `http://localhost:3000/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  );

  const data = await response.json();

  return data;
}
