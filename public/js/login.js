export function InitPasswordToggle() {
  const loginPasswordInput = document.getElementById("password");
  const passwordToggleBtn = document.getElementById(
    "togglePassword",
  );

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
