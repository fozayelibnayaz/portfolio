/* ============================================================
   wireframe.js — Vintage-style monochrome 3D wireframe hero
   Icosahedron / tetrahedron / octahedron, slow rotation,
   perspective projection, depth-faded edges, drifting shards,
   cursor parallax. Zero libraries. Pauses off-screen/hidden.
   ============================================================ */
(function () {
  "use strict";

  /* v5.2: ink follows the theme — white on the dark stage, near-black in light mode */
  function ink() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "24,24,26" : "255,255,255";
  }

  var canvas = document.getElementById("hero-wire");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- geometry ---------- */
  function dist(a, b) {
    var dx = a[0] - b[0], dy = a[1] - b[1], dz = a[2] - b[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  function edgesFrom(minFactor) {
    return function (geo) {
      var edges = [], min = Infinity, i, j;
      for (i = 0; i < geo.v.length; i++)
        for (j = i + 1; j < geo.v.length; j++)
          min = Math.min(min, dist(geo.v[i], geo.v[j]));
      for (i = 0; i < geo.v.length; i++)
        for (j = i + 1; j < geo.v.length; j++)
          if (dist(geo.v[i], geo.v[j]) <= min * minFactor) edges.push([i, j]);
      return edges;
      };
  }
  function icosahedron() {
    var t = (1 + Math.sqrt(5)) / 2;
    var g = { v: [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]], e: [] };
    g.e = edgesFrom(1.05)(g);
    return g;
  }
  function tetrahedron() {
    var g = { v: [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], e: [] };
    for (var i = 0; i < 4; i++) for (var j = i + 1; j < 4; j++) g.e.push([i, j]);
    return g;
  }
  function octahedron() {
    var g = { v: [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], e: [] };
    for (var i = 0; i < 6; i++)
      for (var j = i + 1; j < 6; j++) {
        var sameAxis = (g.v[i][0] === -g.v[j][0] && g.v[i][1] === -g.v[j][1] && g.v[i][2] === -g.v[j][2]);
        if (!sameAxis) g.e.push([i, j]);
      }
    return g;
  }

  var W = 0, H = 0, dpr = 1;
  var shapes = [
    { geo: icosahedron(), scale: 165, fx: 0.70, fy: 0.44, rx: 0.6, ry: 0.4, rz: 0.1, sx: 0.00021, sy: 0.00030, sz: 0.00012, base: 0.42, zoff: 0 },
    { geo: tetrahedron(), scale: 82, fx: 0.55, fy: 0.16, rx: 1.1, ry: 0.7, rz: 0.2, sx: 0.00032, sy: 0.00024, sz: 0.00019, base: 0.30, zoff: 120 },
    { geo: octahedron(), scale: 210, fx: 0.82, fy: 0.80, rx: 0.2, ry: 1.2, rz: 0.5, sx: 0.00017, sy: 0.00021, sz: 0.00026, base: 0.34, zoff: -80 }
  ];

  var shards = [];
  function seedShards() {
    shards = [];
    var n = Math.max(14, Math.round(W * H / 48000));
    for (var i = 0; i < n; i++) {
      shards.push({
        x: Math.random() * W, y: Math.random() * H,
        s: 3 + Math.random() * 9,
        vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7 - 2,
        a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.0011,
        o: 0.05 + Math.random() * 0.16
      });
    }
  }

  /* ---------- pointer parallax ---------- */
  var mx = 0, my = 0, tx = 0, ty = 0;
  function onMove(e) {
    tx = (e.clientX / Math.max(1, W)) * 2 - 1;
    ty = (e.clientY / Math.max(1, H)) * 2 - 1;
  }
  window.addEventListener("pointermove", onMove, { passive: true });

  /* ---------- render ---------- */
  function project(v, rot, scale, pos) {
    var x = v[0], y = v[1], z = v[2];
    var cx = Math.cos(rot.rx), sx = Math.sin(rot.rx);
    var cy = Math.cos(rot.ry), sy = Math.sin(rot.ry);
    var cz = Math.cos(rot.rz), sz = Math.sin(rot.rz);
    var y1 = y * cx - z * sx, z1 = y * sx + z * cx;
    var x2 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
    var x3 = x2 * cz - y1 * sz, y3 = x2 * sz + y1 * cz;
    var f = 900 / (900 + z2 + 260);
    return { x: pos.x + x3 * scale * f, y: pos.y + y3 * scale * f, z: z2 };
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    mx += (tx - mx) * 0.045;
    my += (ty - my) * 0.045;

    var i, j, k;
    for (k = 0; k < shapes.length; k++) {
      var S = shapes[k];
      S.rx += S.sx * 16; S.ry += S.sy * 16; S.rz += S.sz * 16;
      var pos = {
        x: S.fx * W + mx * (26 + k * 8),
        y: S.fy * H + my * (18 + k * 6)
      };
      var rot = { rx: S.rx + my * 0.25, ry: S.ry + mx * 0.35, rz: S.rz };
      var pts = [];
      for (i = 0; i < S.geo.v.length; i++) pts.push(project(S.geo.v[i], rot, S.scale, pos));
      for (i = 0; i < S.geo.e.length; i++) {
        var a = pts[S.geo.e[i][0]], b = pts[S.geo.e[i][1]];
        var depth = ((a.z + b.z) / 2 + 220) / 440; /* 0..1 */
        var alpha = S.base * (0.28 + depth * 0.72);
        ctx.strokeStyle = "rgba(" + ink() + "," + alpha.toFixed(3) + ")";
        ctx.lineWidth = depth > 0.55 ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      /* vertices */
      for (i = 0; i < pts.length; i++) {
        var depth2 = (pts[i].z + 220) / 440;
        ctx.fillStyle = "rgba(" + ink() + "," + (S.base * 0.9 * (0.3 + depth2 * 0.7)).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, 1.6, 0, 6.2832);
        ctx.fill();
      }
    }

    /* shards */
    for (i = 0; i < shards.length; i++) {
      var s = shards[i];
      s.x += s.vx * 0.016; s.y += s.vy * 0.016; s.a += s.va * 16;
      if (s.x < -20) s.x = W + 18; if (s.x > W + 20) s.x = -18;
      if (s.y < -20) s.y = H + 18; if (s.y > H + 20) s.y = -18;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.a);
      ctx.strokeStyle = "rgba(" + ink() + "," + s.o.toFixed(3) + ")";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-s.s / 2, s.s / 3);
      ctx.lineTo(0, -s.s / 2);
      ctx.lineTo(s.s / 2, s.s / 3);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }

  /* ---------- loop management ---------- */
  var running = false, inView = true, raf = 0, last = 0;
  function frame(t) {
    if (!running) return;
    draw(t);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (running || reduce) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function sync() { (inView && !document.hidden && !reduce) ? start() : stop(); }

  function size() {
    var r = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    W = Math.max(1, Math.floor(r.width));
    H = Math.max(1, Math.floor(r.height));
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedShards();
  }

  function init() {
    size();
    if (reduce) { draw(0); return; } /* static frame */
    window.addEventListener("resize", function () { size(); if (reduce) draw(0); }, { passive: true });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; sync(); }, { threshold: 0.02 }).observe(canvas.parentElement);
    }
    document.addEventListener("visibilitychange", sync);
    sync();
  }

  window.FIYWire = { init: init, draw: draw, size: size, get running() { return running; } };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
