/* ============================================================
   main.js — boot sequence + Dhaka clock
   ============================================================ */
(function () {
  "use strict";

  /* ---------- live Dhaka clock (footer) ---------- */
  function tickClock() {
    var el = document.getElementById("local-time");
    if (!el) return;
    var hh = "—", mm = "—", ss = "—";
    try {
      var f = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      });
      var parts = f.formatToParts(new Date());
      var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
      hh = get("hour"); mm = get("minute"); ss = get("second");
    } catch (e) {
      var now = new Date(Date.now() + (6 * 60 + new Date().getTimezoneOffset()) * 60000);
      hh = ("0" + now.getUTCHours()).slice(-2);
      mm = ("0" + now.getUTCMinutes()).slice(-2);
      ss = ("0" + now.getUTCSeconds()).slice(-2);
    }
    el.textContent = "Dhaka · " + hh + ":" + mm + ":" + ss + " GMT+6";
  }
  setInterval(tickClock, 1000);
  tickClock();

  /* ---------- back to top ---------- */
  var toTop = document.getElementById("to-top");
  if (toTop) toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(function () {
      if (window.scrollY > 2) {
        /* force instant — "auto" would inherit CSS smooth and can crawl/starve */
        try { window.scrollTo({ top: 0, behavior: "instant" }); }
        catch (e) { document.documentElement.scrollTop = 0; }
      }
    }, 900);
  });

  /* ---------- headline glitch flicker (Vintage-style, monochrome) ---------- */
  var h1 = document.querySelector("[data-hero-title]");
  if (h1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    (function glitch() {
      setTimeout(function () {
        h1.classList.add("glitch");
        setTimeout(function () { h1.classList.remove("glitch"); glitch(); }, 240);
      }, 2800 + Math.random() * 2600);
    })();
  }

  function boot() {
    if (window.FIYTheme) window.FIYTheme.init();
    if (window.FIYProjects) window.FIYProjects.init();
    if (window.FIYRain) window.FIYRain.init();

    var apply = function (overlay) {
      if (overlay && window.FIYContent) window.FIYContent.applyOverlay(overlay);
      if (window.FIYHero && window.FIYHero.refresh) window.FIYHero.refresh();
      if (window.FIYReveal) window.FIYReveal.scan();
    };

    if (window.FIYContent) {
      window.FIYContent.loadOverlay().then(apply).catch(function () {
        if (window.FIYHero && window.FIYHero.refresh) window.FIYHero.refresh();
        if (window.FIYReveal) window.FIYReveal.scan();
      });
    } else if (window.FIYReveal) {
      window.FIYReveal.scan();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
