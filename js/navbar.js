export function InitNavbar() {
    const button = document.querySelector(".menu-btn");
    const menu = document.querySelector(".nav-links");

    button.addEventListener("click", () => {
      menu.classList.toggle("active");
    });
}