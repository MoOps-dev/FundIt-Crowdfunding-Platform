import { InitPasswordToggle } from "./login.js";
import { InitNavbar } from "./navbar.js";
import { InitConfirmPasswordToggle } from "./signup.js";

if (window.location.pathname === "/index.html") InitNavbar();

if (window.location.pathname === "/login.html") InitPasswordToggle();

if (window.location.pathname === "/signup.html") {
  InitPasswordToggle();
  InitConfirmPasswordToggle();
}
