/* ============================================================
   projects.js — case-study modal (accessible, Esc + backdrop)
   ============================================================ */
(function () {
  "use strict";

  var backdrop = document.getElementById("project-modal");
  var modal = backdrop ? backdrop.querySelector(".modal") : null;
  var items = [];
  var lastFocus = null;

  function setItems(list) { items = Array.isArray(list) ? list : []; }

  function render(p) {
    if (!modal) return;
    var esc = window.FIYRender.esc;
    var stack = modal.querySelector(".proj-stack");
    var h3 = modal.querySelector("h3");
    var story = modal.querySelector(".story");
    var ext = modal.querySelector(".proj-ext");
    if (stack) stack.textContent = p.stack || "";
    if (h3) h3.textContent = p.name || "";
    if (story) {
      var rows = [];
      if (p.bullets && p.bullets.length) {
        var labels = ["Problem", "Build", "Result"];
        p.bullets.forEach(function (b, i) {
          rows.push("<li><span class='lbl'>" + (labels[i] || "Note " + (i + 1)) + "</span><span>" + esc(b) + "</span></li>");
        });
      }
      story.innerHTML = rows.join("");
    }
    if (ext) {
      var links = "";
      if (p.link) links += "<a href='" + esc(p.link) + "' target='_blank' rel='noopener'>Live ↗</a>";
      ext.innerHTML = links || "<span style='font-family:var(--font-mono);font-size:12px;color:var(--text-faint)'>Private / internal project</span>";
    }
  }

  function open(idx) {
    var p = items[idx];
    if (!p || !backdrop) return;
    render(p);
    lastFocus = document.activeElement;
    backdrop.classList.add("is-open");
    document.body.classList.add("modal-locked");
    var closeBtn = backdrop.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (!backdrop) return;
    backdrop.classList.remove("is-open");
    document.body.classList.remove("modal-locked");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function init() {
    if (!backdrop) return;
    document.addEventListener("click", function (e) {
      var card = e.target.closest("[data-project]");
      if (card) open(parseInt(card.getAttribute("data-project"), 10));
    });
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    var closeBtn = backdrop.querySelector(".modal-close");
    if (closeBtn) closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && backdrop.classList.contains("is-open")) close();
      if (e.key === "Tab" && backdrop.classList.contains("is-open")) {
        var focusables = backdrop.querySelectorAll("button, a[href]");
        if (!focusables.length) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
  }

  window.FIYProjects = { setItems: setItems, open: open, close: close, init: init };
})();
