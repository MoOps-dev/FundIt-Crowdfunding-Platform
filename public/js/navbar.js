export function initNavbar() {
  const button = document.querySelector(".menu-btn");
  const menu = document.querySelector(".nav-links");

  button.addEventListener("click", () => {
    menu.classList.toggle("active");
    if (document.body.style.overflow === "hidden") {
      document.body.style.overflow = "auto";
      return;
    }
    document.body.style.overflow = "hidden";
  });
}
