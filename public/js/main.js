import { initLogin, initPasswordToggle } from "./login.js";
import { initConfirmPasswordToggle, initSignUp } from "./signup.js";
import { initNavbar } from "./navbar.js";

if (window.location.pathname === "/index.html") {
  initNavbar();
  const currentRememberedUser = JSON.parse(localStorage.getItem("currentUser"));
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  const user = currentRememberedUser || currentUser;

  if (user) {
    console.log("logged in:", user);
  } else {
    console.log("not logged in");
  }
}

if (window.location.pathname === "/login.html") {
  initPasswordToggle();
  initLogin();
}

if (window.location.pathname === "/signup.html") {
  initPasswordToggle();
  initConfirmPasswordToggle();
  initSignUp();
}
