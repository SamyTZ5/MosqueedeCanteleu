// AMCC - Unified scripts (reveal, sticky header, mobile nav)
(() => {
  "use strict";

  // Scroll reveal
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("active");
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));
  }

  // Header scroll effect
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 50) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu
  const burgerMenu = document.querySelector(".burger-menu");
  const mobileNav = document.getElementById("mobileNav");
  const closeMenu = document.getElementById("closeMenu");

  const openNav = () => mobileNav && mobileNav.classList.add("active");
  const closeNav = () => mobileNav && mobileNav.classList.remove("active");

  if (burgerMenu && mobileNav) burgerMenu.addEventListener("click", openNav);
  if (closeMenu && mobileNav) closeMenu.addEventListener("click", closeNav);

  // Close on link click
  document.querySelectorAll(".mobile-nav-content a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
})();
