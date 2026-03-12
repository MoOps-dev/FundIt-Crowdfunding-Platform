import { Register } from "./signup.js";
import { Index } from "./index.js";
import { Login } from "./login.js";
import { getCurrentUser, getCurrentUserData, preventAuth, requireAuth } from "./auth.js";
import { NewCampaign } from "./new_camp.js";

const path = window.location.pathname;

if (getCurrentUserData) {
  getCurrentUser();
}

if (path === "/index.html" || path === "/") {
  const mainPage = new Index();
  mainPage.init();
}

if (path === "/login.html") {
  if (!preventAuth()) {
    const loginPage = new Login();
    loginPage.init();
  }
}

if (path === "/signup.html") {
  if (!preventAuth()) {
    const RegisterPage = new Register();
    RegisterPage.init();
  }
}

if (path === "/new-campaign.html") {
  if (!requireAuth()) {
    const NewCampaignPage = new NewCampaign();
    NewCampaignPage.init();}
}
