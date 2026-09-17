/* ============================================================
   render.js — dynamic list renderers (used by CMS overlay)
   Exposes window.FIYRender = { about, experience, skills, projects, contact, heroMedia, esc }
   ============================================================ */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function fillList(containerSel, items, tpl) {
    var el = document.querySelector(containerSel);
    if (!el) return;
    el.innerHTML = items.map(tpl).join("");
  }

  var R = {};

  R.esc = esc;

  R.about = function (about) {
    if (!about) return;
    if (Array.isArray(about.paragraphs)) {
      fillList("[data-list='about-paras']", about.paragraphs, function (p) {
        return "<p>" + esc(p) + "</p>";
      });
    }
    if (Array.isArray(about.facts)) {
      fillList("[data-list='about-facts']", about.facts, function (f) {
        return "<li><span class='k'>" + esc(f.k || "") + "</span><span class='v'>" + esc(f.v || "") + "</span></li>";
      });
    }
  };

  R.experience = function (exp) {
    fillList("[data-list='experience']", exp.roles || [], function (r, i) {
      var bullets = (r.bullets || []).map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("");
      var tags = (r.tags || []).map(function (t) { return "<span class='tag'>" + esc(t) + "</span>"; }).join("");
      return "" +
        "<li class='tl-item reveal' style=\"--d:" + (i * 60) + "ms\">" +
          "<div class='tl-period'>" + esc(r.period || "") + "</div>" +
          "<div class='tl-card'>" +
            "<h3>" + esc(r.title || "") +
            (r.badge ? " <span class='tl-badge'>" + esc(r.badge) + "</span>" : "") +
            " <span class='at'>· " + esc(r.company || "") + "</span></h3>" +
            (r.summary ? "<p class='tl-summary'>" + esc(r.summary) + "</p>" : "") +
            (bullets ? "<ul>" + bullets + "</ul>" : "") +
            (tags ? "<div class='tags'>" + tags + "</div>" : "") +
          "</div>" +
        "</li>";
    });
  };

  R.skills = function (skills) {
    var groups = skills.groups || [];
    fillList("[data-list='skills']", groups, function (g, i) {
      var chips = (g.items || []).map(function (s) { return "<span class='chip'>" + esc(s) + "</span>"; }).join("");
      var wide = (i === groups.length - 1 && groups.length % 2 === 1) ? " skill-panel--wide" : "";
      return "" +
        "<div class='skill-panel reveal" + wide + "' style=\"--d:" + (i * 60) + "ms\">" +
          "<h3><span class='n'>0" + (i + 1) + "</span>" + esc(g.name || "") + "</h3>" +
          "<div class='chips'>" + chips + "</div>" +
        "</div>";
    });
    var note = document.querySelector("[data-cms='skills.note']");
    if (note && skills.note !== undefined) note.innerHTML = skills.note;
  };

  R.projects = function (projects) {
    fillList("[data-list='projects']", projects.items || [], function (p, i) {
      return "" +
        "<button class='proj-card reveal' type='button' data-project='" + (i) + "' aria-haspopup='dialog' style=\"--d:" + ((i % 3) * 60) + "ms\">" +
          "<span class='proj-stack'>" + esc(p.stack || "") + "</span>" +
          "<h3>" + esc(p.name || "") + "</h3>" +
          "<p>" + esc(p.blurb || "") + "</p>" +
          "<span class='proj-open'>Case study <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' stroke-width='1.8'><path d='M4 12L12 4M6 4h6v6'/></svg></span>" +
        "</button>";
    });
    if (window.FIYProjects) window.FIYProjects.setItems(projects.items || []);
  };

  R.contact = function (ct) {
    if (!ct) return;
    var list = document.querySelector("[data-list='contact-links']");
    if (list) {
      var links = [];
      if (ct.email) links.push("<a class='btn btn--primary' href='mailto:" + esc(ct.email) + "' data-contact='email' data-value='" + esc(ct.email) + "' data-href='mailto:" + esc(ct.email) + "'>Email</a>");
      if (ct.phone) links.push("<a class='btn btn--ghost' href='tel:" + esc(String(ct.phone).replace(/[^+\d]/g, "")) + "' data-contact='phone' data-value='" + esc(ct.phone) + "' data-href='tel:" + esc(String(ct.phone).replace(/[^+\d]/g, "")) + "'>Phone</a>");
      if (ct.github) links.push("<a class='btn btn--ghost' href='" + esc(ct.github) + "' target='_blank' rel='noopener' data-contact='github' data-value='github.com/fozayelibnayaz' data-href='" + esc(ct.github) + "'>GitHub</a>");
      if (ct.cv) links.push("<a class='btn btn--ghost' href='" + esc(ct.cv) + "' download data-contact='cv' data-value='Fozayel_Ibn_Ayaz.pdf' data-href='" + esc(ct.cv) + "'>CV ↓</a>");
      list.innerHTML = links.join("");
    }
    var mail = document.querySelector(".contact-mail");
    if (mail && ct.email) {
      mail.textContent = ct.email;
      mail.href = "mailto:" + ct.email;
      mail.setAttribute("data-value", ct.email);
      mail.setAttribute("data-href", "mailto:" + ct.email);
    }
    if (ct.footerNote) {
      var fn = document.querySelector("[data-cms='contact.footerNote']");
      if (fn) fn.textContent = ct.footerNote;
    }
  };

  window.FIYRender = R;
})();
