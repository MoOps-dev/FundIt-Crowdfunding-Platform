import { showSuccess } from "./utils.js";

export function initConfirmPasswordToggle() {
  const signupConfirmPasswordInput = document.getElementById("confirmPassword");
  const passwordToggleBtn = document.getElementById("toggleConfirmPassword");

  passwordToggleBtn.addEventListener("click", () => {
    const icon = passwordToggleBtn.querySelector("i");

    if (signupConfirmPasswordInput.type === "password") {
      signupConfirmPasswordInput.type = "text";
      icon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
      signupConfirmPasswordInput.type = "password";
      icon.classList.replace("bi-eye-slash", "bi-eye");
    }
  });
}

export function initSignUp() {
  const signupForm = document.getElementById("signup-form");
  const signupPasswordInput = document.getElementById("password");
  const signupConfirmPasswordInput = document.getElementById("confirmPassword");
  const signupInputs = signupForm.querySelectorAll(".primary-input");
  const signupTermsCheckbox = document.getElementById("check");
  const signupTermsErrorMsg =
    document.querySelector(".checkbox-row").lastElementChild;
  const signupConfirmPasswordError =
    signupConfirmPasswordInput.closest("div").nextElementSibling;
  const signupButton = document.getElementById("register");
  const signupEmailInput = document.getElementById("email");
  const signupEmailErrorMsg =
    signupEmailInput.closest("div").nextElementSibling;

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let valid = true;

    signupConfirmPasswordError.textContent = "Please confirm your password.";
    signupEmailErrorMsg.textContent =
      "Email is required and must be a valid email address (minimum 5 characters).";

    signupInputs.forEach((input) => {
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

    if (!signupTermsCheckbox.checkValidity()) {
      signupTermsCheckbox.classList.add("invalid");
      signupTermsErrorMsg.style.display = "block";
      valid = false;
    } else {
      signupTermsCheckbox.classList.remove("invalid");
      signupTermsErrorMsg.style.display = "none";
    }

    if (signupPasswordInput.value !== signupConfirmPasswordInput.value) {
      signupConfirmPasswordInput.classList.add("invalid");
      signupConfirmPasswordError.textContent = "Passwords do not match.";
      signupConfirmPasswordError.style.display = "block";
      valid = false;
    }

    if (!valid) return;

    const originalSignupButtonText = signupButton.textContent;

    signupButton.disabled = true;
    signupButton.textContent = "Creating your account...";

    const formData = new FormData(signupForm);

    const newUser = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: "user",
      isActive: true,
    };

    const exist = await checkUser(formData.get("email"));

    if (!exist) {
      await registerUser(newUser);
      showSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login.html";
      }, 2000);
    } else {
      signupEmailInput.classList.add("invalid");
      signupEmailErrorMsg.textContent =
        "An account with this email already exists.";
      signupEmailErrorMsg.style.display = "block";

      signupButton.disabled = false;
      signupButton.textContent = originalSignupButtonText;
    }
  });
}

async function checkUser(email) {
  const response = await fetch(
    `http://localhost:3000/users?email=${encodeURIComponent(email)}`,
  );

  const data = await response.json();
  if (data.length > 0) return true;

  return false;
}

async function registerUser(user) {
  const response = await fetch("http://localhost:3000/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
}
