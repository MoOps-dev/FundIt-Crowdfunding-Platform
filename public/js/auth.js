import { User } from "./user.js";

export function getCurrentUserData() {
  return (
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(sessionStorage.getItem("currentUser"))
  );
}

export function getCurrentUser() {
  const userData = getCurrentUserData();
  return userData ? new User(userData) : null;
}

export function isLoggedIn() {
  return !!getCurrentUserData();
}

export function preventAuth() {
  if (isLoggedIn()) {
    setTimeout(() => {
      window.location.replace("/index.html");
    }, 1000);

    return true;
  }

  return false;
}

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.replace("/login.html");
    return true;
  }

  return false;
}

export function logout() {
  localStorage.removeItem("currentUser");
  sessionStorage.removeItem("currentUser");
  window.location.replace("/index.html");
}
