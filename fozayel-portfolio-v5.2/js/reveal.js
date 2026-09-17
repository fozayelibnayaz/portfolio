/* ============================================================
   reveal.js — IntersectionObserver reveal-on-scroll
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function scan() {
    var els = document.querySelectorAll(".reveal:not(.in):not(.obs)");
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach ? els.forEach(function (el) { el.classList.add("in"); })
        : Array.prototype.forEach.call(els, function (el) { el.classList.add("in"); });
      return;
    }
    if (!window.__fiyIO) {
      window.__fiyIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            window.__fiyIO.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    Array.prototype.forEach.call(els, function (el) {
      el.classList.add("obs");
      window.__fiyIO.observe(el);
    });
  }

  window.FIYReveal = { scan: scan };
})();
