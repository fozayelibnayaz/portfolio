/* ============================================================
   hero.js — stacked masked headline lines (Vintage-style)
   "Fozayel" / "Ibn Ayaz" rise from behind their own masks when
   the loader lifts. Rebuilds lines when the CMS changes the name.
   ============================================================ */
(function () {
  "use strict";

  var title = document.querySelector("[data-hero-title]");
  if (!title) return;

  var last = "";

  function buildLines() {
    var text = (title.textContent || "").trim();
    if (!text) return;
    if (text === last) return;
    last = text;
    title.setAttribute("aria-label", text);

    var words = text.split(/\s+/);
    var lines = words.length > 1 ? [words[0], words.slice(1).join(" ")] : [text];

    title.innerHTML = "";
    lines.forEach(function (lineText, i) {
      var wrap = document.createElement("span");
      wrap.className = "line";
      wrap.setAttribute("aria-hidden", "true");
      var inner = document.createElement("span");
      inner.className = "line-inner";
      inner.style.setProperty("--d", (140 + i * 110) + "ms");
      inner.textContent = lineText;
      wrap.appendChild(inner);
      title.appendChild(wrap);
      if (i < lines.length - 1) title.appendChild(document.createTextNode(" "));
    });
  }

  buildLines();

  window.FIYHero = {
    refresh: function () { last = ""; buildLines(); },
    get lineCount() { return title.querySelectorAll(".line").length; }
  };
})();
