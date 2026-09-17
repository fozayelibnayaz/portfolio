/* ============================================================
   loader.js — Vintage-style loading screen → hero entrance
   counter 00→100 + progress bar → curtain lift → hero lines rise
   Skipped for reduced-motion; failsafe reveal after 4s.
   ============================================================ */
(function () {
  "use strict";

  var loader = document.getElementById("loader");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var done = false;

  function finish() {
    if (done) return;
    done = true;
    document.documentElement.classList.remove("is-loading");
    var hero = document.querySelector(".hero");
    if (hero) hero.classList.add("is-in");
    document.body.classList.add("is-loaded");
    if (loader) {
      loader.classList.add("is-done");
      setTimeout(function () { loader.style.display = "none"; }, 950);
    }
    try { window.dispatchEvent(new Event("fiy:enter")); } catch (e) {}
  }

  function start() {
    if (!loader || reduce) { finish(); return; }
    document.documentElement.classList.add("is-loading");
    var num = document.getElementById("loader-num");
    var fill = document.getElementById("loader-fill");
    var D = 1400;
    var t0 = performance.now();

    function tick(t) {
      if (done) return;
      var p = Math.min(1, (t - t0) / D);
      var e = 1 - Math.pow(1 - p, 3); /* ease-out cubic */
      var v = Math.round(e * 100);
      if (num) num.textContent = (v < 10 ? "0" : "") + v;
      if (fill) fill.style.transform = "scaleX(" + e + ")";
      if (p < 1) requestAnimationFrame(tick);
      else setTimeout(finish, 200);
    }
    requestAnimationFrame(tick);
    /* failsafe: whatever happens, the site reveals */
    setTimeout(finish, 4000);
  }

  window.FIYLoader = { finish: finish, start: start };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
