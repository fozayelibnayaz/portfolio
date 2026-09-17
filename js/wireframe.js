/* ============================================================
   wireframe.js — v6 "The Grid You Work On"
   ONE fixed, whole-site 3D wireframe world behind every section:
   • perspective grid terrain with topo-graph waves (scroll-linked)
   • rotating wireframe polyhedra at different depths
   • drifting shards + sparse pulsing data nodes
   Ink follows the theme (white on dark / near-black on light).
   A canvas-side legibility veil calms the middle of the page and
   releases again at the contact section. Fixed viewport buffer +
   scroll-linked camera = continuous world at 60fps.
   Exposes window.FIYBG = { canvas, size, draw, running }
   ============================================================ */
(function () {
  "use strict";

  var canvas = document.getElementById("fiy-bg");
  if (!canvas) { window.FIYBG = { running: false, size: function(){}, draw: function(){} }; return; }
  var ctx = canvas.getContext("2d");

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = 1, W = 0, H = 0, running = false, raf = 0;
  var scrollY = 0, docMax = 1;
  var px = 0, py = 0, tx = 0, ty = 0; /* pointer parallax */

  /* ---------- palette ---------- */
  function ink() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "24,24,26" : "255,255,255";
  }

  /* ---------- scene data ---------- */
  /* polyhedra: vertices on a sphere, edges = closest-pair factor (same language as v5 hero) */
  function sphereVerts(n, rnd) {
    var v = [];
    for (var i = 0; i < n; i++) {
      var phi = Math.acos(1 - 2 * (i + 0.5) / n);
      var th = Math.PI * (1 + Math.sqrt(5)) * i;
      var r = rnd ? (0.86 + rnd * 0.14) : 1;
      v.push([Math.cos(th) * Math.sin(phi) * r, Math.sin(th) * Math.sin(phi) * r, Math.cos(phi) * r]);
    }
    return v;
  }
  function edgesFor(v, factor) {
    var ds = [], mean = 0, edges = [];
    for (var i = 0; i < v.length; i++)
      for (var j = i + 1; j < v.length; j++) {
        var dx = v[i][0]-v[j][0], dy = v[i][1]-v[j][1], dz = v[i][2]-v[j][2];
        var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
        ds.push([d, i, j]); mean += d;
      }
    mean /= ds.length;
    for (var k = 0; k < ds.length; k++)
      if (ds[k][0] < mean * factor) edges.push([ds[k][1], ds[k][2]]);
    return edges;
  }
  function makeShape(vn, factor, rnd) { var v = sphereVerts(vn, rnd); return { v: v, e: edgesFor(v, factor) }; }
  var SHAPES = [
    makeShape(14, 0.62, 1),  /* icosahedron-ish */
    makeShape(7,  0.72, 0),  /* octahedron-ish  */
    makeShape(5,  0.85, 0)   /* tetrahedron-ish */
  ];
  var instances = [
    { s: 0, fx: 0.76, fy: 0.34, scale: 190, rx: 0.00021, ry: 0.00027, depth: 1.00 },
    { s: 1, fx: 0.17, fy: 0.60, scale: 120, rx: 0.00026, ry: 0.00019, depth: 0.62 },
    { s: 2, fx: 0.88, fy: 0.76, scale: 105, rx: 0.00017, ry: 0.00031, depth: 0.80 }
  ];
  var shards = [], nodes = [];
  var lastT = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    measureDoc();
    makeShards(); makeNodes();
    if (reduce) draw(lastT || 16);
  }

  function measureDoc() {
    docMax = Math.max(1, document.documentElement.scrollHeight - H);
  }

  function makeShards() {
    shards = [];
    var n = Math.max(8, Math.round((W * H) / 90000)); /* medium density */
    for (var i = 0; i < n; i++) {
      shards.push({
        x: Math.random() * W, y: Math.random() * H,
        r: 3 + Math.random() * 7,
        vx: (-4 - Math.random() * 10) / 60,
        vy: (-2 - Math.random() * 6) / 60,
        o: 0.10 + Math.random() * 0.2,
        depth: 0.3 + Math.random() * 0.7,
        a: Math.random() * Math.PI
      });
    }
  }

  function makeNodes() {
    nodes = [];
    var spots = [[0.12, 0.30], [0.30, 0.14], [0.55, 0.72], [0.68, 0.22], [0.90, 0.52], [0.44, 0.88]];
    for (var i = 0; i < spots.length; i++) {
      nodes.push({ fx: spots[i][0], fy: spots[i][1], ph: i * 900 + Math.random() * 800, depth: 0.5 + (i % 3) * 0.25 });
    }
  }

  /* ---------- legibility veil: calm mid-page, release at contact ---------- */
  function smooth(a, b, x) { x = Math.max(0, Math.min(1, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function veil() {
    var p = scrollY / docMax;
    return 0.32 * smooth(0.08, 0.22, p) * (1 - 0.72 * smooth(0.70, 0.88, p));
  }

  /* ---------- terrain ---------- */
  function drawTerrain(t, inkStr, vAlpha) {
    var y0 = H * 0.60 + py * 10;                 /* horizon */
    var cx = W * 0.5 + px * 26;                  /* vanishing x */
    var scroll = scrollY * 0.5 + t * 0.010;      /* flows toward you, scroll-linked */
    var K = 11, M = 13;

    /* horizontal topo lines (polylines with sine displacement) */
    for (var k = 0; k < K; k++) {
      var z = ((k + (scroll / 130) % 1) / K); z = z - Math.floor(z);
      var zz = Math.pow(z, 1.9);
      var y = y0 + (H - y0) * zz;
      var alpha = 0.07 + zz * 0.20;
      ctx.beginPath();
      for (var x = 0; x <= W; x += Math.max(28, W / 34)) {
        var w = Math.sin(x * 0.012 + t * 0.00042 + k * 1.7) * (1.6 + zz * 7)
              + Math.sin(x * 0.004 - t * 0.00023 + k) * (1 + zz * 4);
        if (x === 0) ctx.moveTo(x, y + w); else ctx.lineTo(x, y + w);
      }
      ctx.strokeStyle = "rgba(" + inkStr + "," + (alpha * vAlpha).toFixed(3) + ")";
      ctx.stroke();
    }

    /* converging verticals */
    for (var m = -M; m <= M; m++) {
      var bx = cx + m * (W * 0.085);
      if (bx < -80 || bx > W + 80) continue;
      ctx.beginPath();
      ctx.moveTo(cx + m * (W * 0.012), y0);
      ctx.lineTo(bx, H + 12);
      ctx.strokeStyle = "rgba(" + inkStr + "," + (0.10 * vAlpha).toFixed(3) + ")";
      ctx.stroke();
    }
    /* horizon hairline */
    ctx.beginPath();
    ctx.moveTo(0, y0); ctx.lineTo(W, y0);
    ctx.strokeStyle = "rgba(" + inkStr + "," + (0.13 * vAlpha).toFixed(3) + ")";
    ctx.stroke();
  }

  /* ---------- polyhedra ---------- */
  function drawShapes(t, inkStr, vAlpha) {
    for (var i = 0; i < instances.length; i++) {
      var it = instances[i], S = SHAPES[it.s];
      var drift = -((scrollY * 0.05 * it.depth) % (H + 420));
      var cy0 = it.fy * H + drift;
      if (cy0 < -260) cy0 += H + 420;
      if (cy0 > H + 260) cy0 -= H + 420;
      var cxx = it.fx * W + px * 18 * it.depth;
      var cyy = cy0 + py * 12 * it.depth;
      var ax = t * it.rx, ay = t * it.ry;
      var sc = it.scale, f = 900 / (900 + 160 * it.depth);
      var proj = [];
      for (var a = 0; a < S.v.length; a++) {
        var X = S.v[a][0], Y = S.v[a][1], Z = S.v[a][2];
        var y1 = Y * Math.cos(ax) - Z * Math.sin(ax);
        var z1 = Y * Math.sin(ax) + Z * Math.cos(ax);
        var x2 = X * Math.cos(ay) + z1 * Math.sin(ay);
        var z2 = -X * Math.sin(ay) + z1 * Math.cos(ay);
        var p = f / (1 + (z2 + 1.6) * 0.22);
        proj.push([cxx + x2 * sc * p, cyy + y1 * sc * p, z2]);
      }
      ctx.beginPath();
      for (var b = 0; b < S.e.length; b++) {
        var p1 = proj[S.e[b][0]], p2 = proj[S.e[b][1]];
        var depth = (p1[2] + p2[2]) / 2;
        var al = Math.max(0.07, 0.42 - depth * 0.11);
        ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
        ctx.strokeStyle = "rgba(" + inkStr + "," + (al * vAlpha).toFixed(3) + ")";
        ctx.stroke();
        ctx.beginPath();
      }
      for (var c = 0; c < proj.length; c++) {
        ctx.beginPath();
        ctx.arc(proj[c][0], proj[c][1], 1.5, 0, 6.2832);
        ctx.fillStyle = "rgba(" + inkStr + "," + (0.50 * vAlpha).toFixed(3) + ")";
        ctx.fill();
      }
    }
  }

  /* ---------- shards + nodes ---------- */
  function drawShards(t, inkStr, vAlpha) {
    for (var i = 0; i < shards.length; i++) {
      var s = shards[i];
      var y = s.y - (scrollY * 0.03 * s.depth) % (H + 60);
      if (y < -30) y += H + 60;
      ctx.beginPath();
      ctx.moveTo(s.x, y - s.r);
      ctx.lineTo(s.x + s.r * 0.9, y + s.r * 0.7);
      ctx.lineTo(s.x - s.r * 0.9, y + s.r * 0.7);
      ctx.closePath();
      ctx.strokeStyle = "rgba(" + inkStr + "," + (s.o * vAlpha).toFixed(3) + ")";
      ctx.stroke();
    }
  }

  function drawNodes(t, inkStr, vAlpha) {
    var pts = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var drift = -((scrollY * 0.04 * n.depth) % (H + 200));
      var y = n.fy * H + drift + py * 8 * n.depth;
      if (y < -80) y += H + 200;
      var x = n.fx * W + px * 14 * n.depth;
      pts.push([x, y]);
      var pulse = ((t + n.ph) % 4200) / 4200;
      if (pulse < 0.55) {
        ctx.beginPath();
        ctx.arc(x, y, 2 + pulse * 26, 0, 6.2832);
        ctx.strokeStyle = "rgba(" + inkStr + "," + ((0.20 * (1 - pulse / 0.55)) * vAlpha).toFixed(3) + ")";
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, 6.2832);
      ctx.fillStyle = "rgba(" + inkStr + "," + (0.65 * vAlpha).toFixed(3) + ")";
      ctx.fill();
    }
    for (var a = 0; a < pts.length; a++)
      for (var b = a + 1; b < pts.length; b++) {
        var dx = pts[a][0]-pts[b][0], dy = pts[a][1]-pts[b][1];
        var d = Math.sqrt(dx*dx + dy*dy);
        if (d < 240) {
          ctx.beginPath();
          ctx.moveTo(pts[a][0], pts[a][1]); ctx.lineTo(pts[b][0], pts[b][1]);
          ctx.strokeStyle = "rgba(" + inkStr + "," + ((1 - d / 240) * 0.12 * vAlpha).toFixed(3) + ")";
          ctx.stroke();
        }
      }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    var I = ink();
    var v = 1 - veil();
    /* veil: paint base so content zones stay readable */
    var base = document.documentElement.getAttribute("data-theme") === "light" ? "246,246,244" : "13,13,13";
    var vl = veil();
    if (vl > 0.004) {
      ctx.fillStyle = "rgba(" + base + "," + vl.toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }
    drawTerrain(t, I, v);
    drawShapes(t, I, v);
    drawShards(t, I, v);
    drawNodes(t, I, v);
  }

  function frame(t) {
    if (!running) return;
    px += (tx - px) * 0.045;
    py += (ty - py) * 0.045;
    var dt = Math.min(50, t - lastT || 16);
    lastT = t;
    scrollY = window.scrollY || window.pageYOffset || 0;
    draw(t);
    void dt;
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function init() {
    size();
    window.addEventListener("resize", function () { size(); }, { passive: true });
    window.addEventListener("scroll", function () { if (reduce) draw(lastT || 16); }, { passive: true });
    window.addEventListener("pointermove", function (e) {
      tx = (e.clientX / W - 0.5) * 2;
      ty = (e.clientY / H - 0.5) * 2;
    }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!reduce) start();
    });
    var themeBtn = document.querySelector(".theme-toggle");
    if (themeBtn) themeBtn.addEventListener("click", function () {
      setTimeout(function () { if (reduce) draw(lastT || 16); }, 60);
    });
    if (reduce) { draw(16); running = false; return; }
    start();
  }

  window.FIYBG = {
    canvas: canvas,
    size: size,
    draw: draw,
    get running() { return running; }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
