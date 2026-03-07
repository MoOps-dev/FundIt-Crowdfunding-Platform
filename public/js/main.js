import { InitPasswordToggle } from "./login.js";
import { InitNavbar } from "./navbar.js";
import { InitConfirmPasswordToggle, InitSignUp } from "./signup.js";

if (window.location.pathname === "/index.html") InitNavbar();

if (window.location.pathname === "/login.html") InitPasswordToggle();

if (window.location.pathname === "/signup.html") {
  InitPasswordToggle();
  InitConfirmPasswordToggle();
  InitSignUp();
}

export function showSuccess(message) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}