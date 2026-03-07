import { Register } from "./signup.js";
import { initNavbar } from "./navbar.js";
import { Login } from "./login.js";

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
  const loginPage = new Login();
  loginPage.init();
}

if (window.location.pathname === "/signup.html") {
  const RegisterPage = new Register();
  RegisterPage.init();
}
