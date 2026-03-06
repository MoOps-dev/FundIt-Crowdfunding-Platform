export function InitPasswordToggle() 
{
    const passwordInput = document.getElementById("password");
    const toggleBtn = document.getElementById("togglePassword");

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