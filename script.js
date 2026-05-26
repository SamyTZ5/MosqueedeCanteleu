// AMCC — Mosquée El Mohsinine Canteleu — script.js v4.0
(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    // ── Header scroll ──
    const header = document.querySelector(".site-header");
    if (header) {
      const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 50);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // ── Mobile nav ──
    const burger    = document.querySelector(".burger-menu");
    const mobileNav = document.getElementById("mobileNav");
    const closeBtn  = document.getElementById("closeMenu");
    const open  = () => mobileNav?.classList.add("active");
    const close = () => mobileNav?.classList.remove("active");
    burger?.addEventListener("click", open);
    closeBtn?.addEventListener("click", close);
    document.querySelectorAll(".mobile-nav-content a").forEach(a => a.addEventListener("click", close));
    document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

    // ── Scroll reveal ──
    const reveals = document.querySelectorAll(".reveal");
    if (reveals.length) {
      const obs = new IntersectionObserver(
        entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("active"); }),
        { threshold: 0.08 }
      );
      reveals.forEach(el => obs.observe(el));
    }

    // ── Tabs ──
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(target)?.classList.add("active");
      });
    });

  });
})();
