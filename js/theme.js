/* ============================================================
   theme.js — dark/light toggle with persistence
   (pre-paint snippet lives inline in <head>)
   ============================================================ */
(function () {
  "use strict";

  var KEY = "fiy-theme";

  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    var btn = document.querySelector(".theme-toggle");
    if (btn) btn.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " theme");
  }

  function init() {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var cur = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      apply(cur === "dark" ? "light" : "dark");
    });
  }

  window.FIYTheme = { apply: apply, init: init };
})();
