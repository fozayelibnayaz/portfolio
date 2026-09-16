/* ============================================================
   content.js — CMS overlay loader
   Priority: localStorage draft (admin preview) > content.json > HTML defaults
   Exposes window.FIYContent = { loadOverlay, applyOverlay, deepMerge }
   ============================================================ */
(function () {
  "use strict";

  function deepMerge(base, over) {
    if (Array.isArray(base) || Array.isArray(over)) return over !== undefined ? over : base;
    if (typeof base === "object" && base !== null && typeof over === "object" && over !== null) {
      var out = Object.assign({}, base);
      Object.keys(over).forEach(function (k) { out[k] = deepMerge(base ? base[k] : undefined, over[k]); });
      return out;
    }
    return over !== undefined ? over : base;
  }

  function readDraft() {
    try {
      var raw = localStorage.getItem("fiy-draft");
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function fetchContentJson() {
    return fetch("content.json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("no content.json"); return r.json(); })
      .catch(function () { return null; });
  }

  function loadOverlay() {
    var draft = readDraft();
    if (draft) return Promise.resolve(draft);
    return fetchContentJson();
  }

  /* Apply a content object to the DOM.
     - [data-cms="path.to.string"]  → text swap
     - [data-list="experience"] etc → re-rendered via FIYRender */
  function applyOverlay(c) {
    if (!c || typeof c !== "object") return;

    if (c.site) {
      if (c.site.title) document.title = c.site.title;
      var desc = document.querySelector('meta[name="description"]');
      if (desc && c.site.description) desc.setAttribute("content", c.site.description);
    }
    if (c.settings && c.settings.accent && /^#[0-9a-fA-F]{6}$/.test(c.settings.accent)) {
      document.documentElement.style.setProperty("--accent", c.settings.accent);
    }

    document.querySelectorAll("[data-cms]").forEach(function (el) {
      var path = el.getAttribute("data-cms").split(".");
      var val = c;
      for (var i = 0; i < path.length; i++) {
        if (val == null) break;
        val = val[path[i]];
      }
      if (typeof val === "string" && val.length) el.textContent = val;
    });

    if (window.FIYRender) {
      if (c.about && window.FIYRender.about) window.FIYRender.about(c.about);
      if (c.experience && c.experience.roles) window.FIYRender.experience(c.experience);
      if (c.skills && c.skills.groups) window.FIYRender.skills(c.skills);
      if (c.projects && c.projects.items) window.FIYRender.projects(c.projects);
      if (c.contact) window.FIYRender.contact(c.contact);
    }

    if (window.FIYHero && window.FIYHero.refresh) window.FIYHero.refresh();

    document.documentElement.setAttribute("data-content-applied", "1");
  }

  window.FIYContent = { loadOverlay: loadOverlay, applyOverlay: applyOverlay, deepMerge: deepMerge };
})();
