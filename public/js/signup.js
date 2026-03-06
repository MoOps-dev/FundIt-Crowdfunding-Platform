export function InitConfirmPasswordToggle() {
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

export function InitSignUp() {
  const signupForm = document.getElementById("signup-form");
  const signupPasswordInput = document.getElementById("password");
  const signupConfirmPasswordInput = document.getElementById("confirmPassword");
  const signupInputs = signupForm.querySelectorAll(".primary-input");
  const signupTermsCheckbox = document.getElementById("check");
  const signupTermsErrorMsg =
    document.querySelector(".checkbox-row").lastElementChild;
  const signupConfirmPasswordError =
    signupConfirmPasswordInput.closest("div").nextElementSibling;

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    signupInputs.forEach((input) => {
      const error = input.closest("div").nextElementSibling;

      if (!input.checkValidity()) {
        input.classList.add("invalid");
        error.style.display = "block";
      } else {
        input.classList.remove("invalid");
        error.style.display = "none";
      }
    });

    if (!signupTermsCheckbox.checkValidity()) {
      signupTermsCheckbox.classList.add("invalid");
      signupTermsErrorMsg.style.display = "block";
    } else {
      signupTermsCheckbox.classList.remove("invalid");
      signupTermsErrorMsg.style.display = "none";
    }

    if (signupPasswordInput.value !== signupConfirmPasswordInput.value) {
      signupConfirmPasswordInput.classList.add("invalid");
      signupConfirmPasswordError.textContent = "Passwords do not match.";
      signupConfirmPasswordError.style.display = "block";
    }
  });
}
