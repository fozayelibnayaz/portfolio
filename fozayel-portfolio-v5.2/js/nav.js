/* ============================================================
   nav.js — mobile menu, scroll state, scroll-spy
   ============================================================ */
(function () {
  "use strict";

  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".nav-burger");
  var panel = document.querySelector(".nav-mobile");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link[href^='#']"));

  function closePanel() {
    if (!panel) return;
    panel.classList.remove("is-open");
    if (burger) {
      burger.setAttribute("aria-expanded", "false");
    }
  }

  function togglePanel() {
    if (!panel) return;
    var open = !panel.classList.contains("is-open");
    panel.classList.toggle("is-open", open);
    if (burger) burger.setAttribute("aria-expanded", String(open));
  }

  if (burger) burger.addEventListener("click", togglePanel);

  document.addEventListener("click", function (e) {
    if (panel && panel.classList.contains("is-open") &&
        !panel.contains(e.target) && !burger.contains(e.target)) closePanel();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePanel();
  });

  links.forEach(function (l) {
    l.addEventListener("click", closePanel);
  });

  /* scrolled state */
  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* scroll spy (viewport-relative — robust against offsetParent quirks) */
  var sections = ["about", "experience", "skills", "projects", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function spy() {
    var mark = window.innerHeight * 0.32;
    var doc = document.documentElement;
    var atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
    var current = null;
    if (atBottom && sections.length) {
      current = sections[sections.length - 1].id;
    } else {
      sections.forEach(function (s) {
        if (s.getBoundingClientRect().top <= mark) current = s.id;
      });
    }
    links.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", spy, { passive: true });
  window.addEventListener("resize", spy);
  spy();
})();
