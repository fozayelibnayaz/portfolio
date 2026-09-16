/* ============================================================
   rain.js — canvas rain overlay (contact section)
   Subtle streaks; pauses off-screen / hidden tab / reduced motion.
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("rain-canvas");
  if (!canvas) { window.FIYRain = { setEnabled: function () {} }; return; }

  var ctx = canvas.getContext("2d");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var running = false, visible = false, enabled = true, inView = false;
  var drops = [], raf = 0, dpr = 1, W = 0, H = 0;

  function size() {
    var rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.floor(rect.width));
    H = Math.max(1, Math.floor(rect.height));
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeDrops() {
    var count = Math.round(W / 14); /* density scales with width */
    drops = [];
    for (var i = 0; i < count; i++) {
      drops.push({
        x: Math.random() * W,
        y: Math.random() * H,
        len: 9 + Math.random() * 16,
        speed: 340 + Math.random() * 420,
        drift: 40 + Math.random() * 50,
        o: 0.10 + Math.random() * 0.22
      });
    }
  }

  var last = 0;
  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (var i = 0; i < drops.length; i++) {
      var d = drops[i];
      ctx.strokeStyle = (document.documentElement.getAttribute("data-theme") === "light" ? "rgba(80,92,115," : "rgba(200,220,255,") + d.o + ")";
      ctx.beginPath();
      var dx = (d.drift / d.speed) * d.len;
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - dx, d.y - d.len);
      ctx.stroke();
      d.y += d.speed * dt;
      d.x -= d.drift * dt;
      if (d.y - d.len > H) { d.y = -10; d.x = Math.random() * (W + 80); }
      if (d.x < -20) d.x = W + 10;
    }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce || !enabled || !visible || !inView) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  function sync() { (visible && inView && enabled && !reduce && !document.hidden) ? start() : stop(); }

  function init() {
    size();
    makeDrops();
    window.addEventListener("resize", function () { size(); makeDrops(); }, { passive: true });
    document.addEventListener("visibilitychange", sync);

    var target = canvas.closest("section") || canvas;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        inView = en[0].isIntersecting;
        sync();
      }, { threshold: 0.02 }).observe(target);

      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        sync();
      }).observe(document.body);
    } else {
      inView = true; visible = true; start();
    }
    sync();
  }

  window.FIYRain = {
    setEnabled: function (on) { enabled = !!on; sync(); },
    init: init
  };
})();
