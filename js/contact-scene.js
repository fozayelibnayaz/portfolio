/* ============================================================
   contact-scene.js — walking silhouette behind the buttons
   Walks left↔right; on any contact click he walks over to that
   button and plays an action bubble (Emailing… / Phoning… /
   Opening GitHub… / Downloading CV…). Reduced-motion: hidden.
   ============================================================ */
(function () {
  "use strict";

  var strip = document.querySelector(".contact-scene");
  if (!strip) return;
  var walker = strip.querySelector(".walker");
  var bubble = strip.querySelector(".walker-bubble");
  if (!walker || !bubble) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { strip.style.display = "none"; return; }

  var SPEED = 62;            /* casual stroll, px/s */
  var HURRY = 340;           /* responding to a click */
  var MARGIN = 10;
  var x = MARGIN, dir = 1;
  var mode = "walk";         /* walk | goto | acting */
  var targetX = 0;
  var actingUntil = 0;
  var W = 1, bob = 0;

  var LABELS = {
    email: "✉  Emailing…",
    phone: "☎  Phoning…",
    github: "⌂  Opening GitHub…",
    cv: "↓  Downloading CV…"
  };

  function size() {
    W = Math.max(1, strip.getBoundingClientRect().width);
    if (x > W - MARGIN - 40) x = Math.max(MARGIN, W - MARGIN - 40);
  }

  function frame(t) {
    var dt = Math.min(0.05, (frame._l ? (t - frame._l) / 1000 : 0.016));
    frame._l = t;

    if (mode === "goto") {
      var d = targetX - x;
      if (Math.abs(d) < 4) {
        mode = "acting";
        actingUntil = t + 2400;
        walker.classList.add("is-acting");
        walker.classList.remove("is-walking");
      } else {
        dir = d > 0 ? 1 : -1;
        x += dir * HURRY * dt;
      }
    } else if (mode === "walk") {
      x += dir * SPEED * dt;
      if (x > W - MARGIN - 40) { x = W - MARGIN - 40; dir = -1; }
      if (x < MARGIN) { x = MARGIN; dir = 1; }
    } else if (mode === "acting" && t > actingUntil) {
      mode = "walk";
      walker.classList.remove("is-acting");
      walker.classList.add("is-walking");
      bubble.classList.remove("show");
    }

    bob = mode === "acting" ? 0 : Math.sin(t / 110) * 1.6;
    walker.style.transform = "translateX(" + x.toFixed(1) + "px) translateY(" + bob.toFixed(1) + "px) scaleX(" + dir + ")";
    var bw = bubble.offsetWidth || 120;
    var bx = Math.max(bw / 2 + 10, Math.min(x + 17, W - bw / 2 - 10));
    bubble.style.left = bx.toFixed(1) + "px";
    requestAnimationFrame(frame);
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-contact]");
    if (!a) return;
    var kind = a.getAttribute("data-contact");
    if (!LABELS[kind]) return;
    var btnRect = a.getBoundingClientRect();
    var stripRect = strip.getBoundingClientRect();
    targetX = Math.max(MARGIN, Math.min(W - MARGIN - 40, btnRect.left + btnRect.width / 2 - stripRect.left - 17));
    mode = "goto";
    walker.classList.add("is-walking");
    walker.classList.remove("is-acting");
    /* announce immediately, then jog over */
    bubble.textContent = LABELS[kind];
    setTimeout(function () { bubble.classList.add("show"); }, 150);
  });

  window.addEventListener("resize", size, { passive: true });

  function init() {
    size();
    walker.classList.add("is-walking");
    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
