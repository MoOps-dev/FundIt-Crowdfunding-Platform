import { InitPasswordToggle } from "./login.js";
import { InitNavbar } from "./navbar.js";

if (window.location.pathname === "/index.html") InitNavbar();

if (window.location.pathname === "/login.html") InitPasswordToggle();
