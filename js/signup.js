export function InitConfirmPasswordToggle() {
  const passwordInput = document.getElementById("confirmPassword");
  const toggleBtn = document.getElementById("toggleConfirmPassword");

  toggleBtn.addEventListener("click", () => {
    const icon = toggleBtn.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.replace("bi-eye", "bi-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.replace("bi-eye-slash", "bi-eye");
    }
  });
}
