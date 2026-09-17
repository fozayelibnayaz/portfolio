/* ============================================================
   Portfolio Admin — schema-driven content editor
   Static CMS for GitHub Pages:
     • edit everything visible on the site
     • live preview (iframe reads the same localStorage draft)
     • Publish → download content.json → commit to repo
   ============================================================ */
(function () {
  "use strict";

  /* ---------- password (SHA-256 of "fozayel2026") ---------- */
  var DEFAULT_HASH = "8fab402770501641932ff7f3ed94d2a6889af0dc5673b7c70c8aa5ace67d3a63";

  function sha256Hex(str) {
    if (!(window.crypto && crypto.subtle)) {
      /* insecure-context fallback (e.g. file://) — light obfuscation, not crypto */
      var h = 5381, out = [];
      var s = "fiy$" + str;
      for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; out.push(h); }
      return "fb" + out.join("-");
    }
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(str)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    });
  }

  function storedHash() { try { return localStorage.getItem("fiy-admin-hash") || DEFAULT_HASH; } catch (e) { return DEFAULT_HASH; } }

  /* ============================================================
     DEFAULT CONTENT — mirrors index.html; used until content.json exists
     ============================================================ */
  var DEFAULTS = {
    site: {
      title: "Fozayel Ibn Ayaz — Full-stack developer",
      description: "Fozayel Ibn Ayaz — full-stack developer and data analyst in Dhaka. WordPress platforms, React/Next.js apps, analytics pipelines (GA4, GTM, Looker), and the ops that keep them running."
    },
    hero: {
      eyebrow: "Full-stack developer · Dhaka, Bangladesh",
      name: "Fozayel Ibn Ayaz",
      subline: "I build WordPress platforms and web apps, wire up the analytics behind them, and keep the whole thing running in production.",
      status: "Open to work"
    },
    about: {
      kicker: "About",
      title: "Developer, analyst, and the person who keeps it running",
      paragraphs: [
        "I'm a full-stack developer and data analyst based in Dhaka. Day to day that means JavaScript, React and Next.js on the front end, PHP and Node.js on the back end, and WordPress as a serious delivery platform — ACF architectures, WooCommerce, Core Web Vitals budgets.",
        "On the data side I work with SQL, Python, GA4 and GTM, and build Looker Studio dashboards that teams actually use — including forecasting with Prophet, ARIMA and LSTM models.",
        "Currently a WordPress developer at Ekomedia and IT administrator at Café Lavista; previously a data analyst at Eagle 3D Streaming. I care about measurable work: fast pages, clean tracking, and deployments that don't surprise anyone."
      ],
      facts: [
        { k: "LOCATION", v: "Dhaka, Bangladesh (GMT+6)" },
        { k: "CURRENT", v: "WordPress Developer @ Ekomedia" },
        { k: "FOCUS", v: "WordPress · React/Next.js · Analytics" },
        { k: "EXPERIENCE", v: "4+ years across dev, data & IT" },
        { k: "STACK", v: "JS/TS · PHP · Python · SQL" },
        { k: "STATUS", v: "Open to work" }
      ]
    },
    experience: {
      kicker: "Experience",
      title: "Where I've worked",
      roles: [
        {
          period: "12/2025 — Present",
          title: "WordPress Developer",
          company: "Ekomedia",
          summary: "Building and maintaining client platforms end to end.",
          bullets: [
            "ACF-based WordPress architectures with reusable block patterns",
            "Technical SEO: JSON-LD schema, semantic markup, Core Web Vitals tuning",
            "Own QA and deployment workflows across client sites"
          ],
          tags: ["WordPress", "ACF", "PHP", "SEO", "Core Web Vitals"]
        },
        {
          period: "07/2024 — Present",
          title: "Digital Marketing & IT Manager",
          company: "Family business",
          summary: "Running the marketing, the website, and the tech for a family-run business.",
          bullets: [
            "Digital marketing end to end: content calendar, social media posts, and seasonal promos",
            "Local discovery: Google Business profile, local SEO, and review management",
            "GA4 + GTM on the website — tracking what actually brings people in",
            "Website uptime, security, backups and day-to-day tech support"
          ],
          tags: ["WordPress", "Digital marketing", "Social media", "Local SEO", "GA4"]
        },
        {
          period: "07/2024 — Present",
          title: "IT Administrator",
          company: "Cafe Lavista",
          summary: "Three business-critical WordPress properties, reliability, security, and remote support.",
          bullets: [
            "Build and run three business-critical WordPress properties end to end",
            "Reliability: uptime monitoring, core and plugin updates, scheduled backups",
            "Security hardening: access control, safe plugins, malware sweeps",
            "Remote support and fast fixes for day-to-day issues"
          ],
          tags: ["WordPress", "Security", "Backups", "IT support"]
        },
        {
          period: "07/2023 — 08/2026",
          title: "Data Analyst",
          company: "Eagle 3D Streaming",
          summary: "Analytics implementation and decision support.",
          bullets: [
            "GA4, GTM and YouTube Analytics implementation end to end",
            "Looker Studio dashboards for KPIs, revenue and anomaly tracking",
            "Forecasting with Prophet, ARIMA and LSTM models; marketing measurement across campaigns"
          ],
          tags: ["SQL", "Python", "GA4", "GTM", "Looker Studio"]
        },
        {
          period: "01/2023 — 06/2023",
          title: "IT Support Engineer",
          company: "n2sys Technology",
          summary: "First response for hardware, networks and applications.",
          bullets: [
            "Desktop, network and application support for business clients",
            "Infrastructure health monitoring and incident response"
          ],
          tags: ["Networking", "Hardware", "Support"]
        },
        {
          period: "08/2022 — 12/2022",
          title: "Coding Teacher",
          company: "Codingal",
          summary: "Programming fundamentals for school students.",
          bullets: ["Taught Scratch, Python and web basics with individualized learning paths"],
          tags: ["Teaching", "Python", "Scratch"]
        }
      ]
    },
    skills: {
      kicker: "Skills",
      title: "Tools I use to ship",
      note: "Currently improving: <code>system design</code> and <code>data engineering</code>.",
      groups: [
        { name: "Frontend", items: ["JavaScript (ES6+)", "TypeScript", "React", "Next.js", "HTML5", "CSS3"] },
        { name: "Backend & Data", items: ["Node.js", "Express", "PHP", "Python", "SQL", "MySQL", "Supabase"] },
        { name: "CMS & SEO", items: ["WordPress", "WooCommerce", "ACF", "Technical SEO", "JSON-LD", "GA4", "GTM", "Looker Studio"] },
        { name: "DevOps & QA", items: ["Docker", "GCP", "Kubernetes", "Playwright", "Postman", "Git"] },
        { name: "Digital Marketing", items: ["Offer positioning", "Content systems", "Social media", "Local SEO", "Campaign tracking (GA4 / GTM)", "Conversion basics"] }
      ]
    },
    projects: {
      kicker: "Projects",
      title: "Things I've built",
      sub: "Six projects, each with a short case study — click a card for the problem, the build, and the result.",
      items: [
        {
          name: "AI YouTube Command Center",
          stack: "Product · AI · Analytics",
          blurb: "Analytics command center for creators who want the story behind the numbers.",
          link: "",
          bullets: [
            "Creators had data scattered across YouTube Studio, sheets and guesswork.",
            "Built a dashboard that ingests YouTube Analytics and generates plain-language insights.",
            "Faster content decisions; weekly review time cut from hours to minutes."
          ]
        },
        {
          name: "Eagle 3D Streaming BI Hub",
          stack: "Data · BI · Automation",
          blurb: "One operational view for KPIs, customers, revenue and anomalies.",
          link: "",
          bullets: [
            "Reporting lived in five tools; nobody trusted a single number.",
            "Consolidated GA4, GTM, billing and product events into Looker Studio with automated refresh.",
            "Anomaly alerts reached the team the same day; leadership ran Monday reviews from one link."
          ]
        },
        {
          name: "EuroEdge Admission Group",
          stack: "WordPress · IA",
          blurb: "A clearer digital front door for a UK-based student consultancy.",
          link: "",
          bullets: [
            "The old site buried services and programs three levels deep.",
            "Rebuilt information architecture on WordPress with ACF; added JSON-LD for programs and FAQs.",
            "Contact conversions up; editors publish new program pages without a developer."
          ]
        },
        {
          name: "AEG Fournitures Storefront",
          stack: "WooCommerce · E-commerce",
          blurb: "French WooCommerce storefront for moving and packing supplies.",
          link: "",
          bullets: [
            "Solo build: catalog, shipping zones and French-language checkout.",
            "WooCommerce with tuned checkout flow, payment integration and schema markup.",
            "Live and processing real orders; admins manage the catalog themselves."
          ]
        },
        {
          name: "Things Worth Buying",
          stack: "Next.js · Content",
          blurb: "Product-discovery site for recommendations that earn the click.",
          link: "",
          bullets: [
            "Wanted a fast, honest review format instead of endless listicles.",
            "Next.js static site with structured data and a repeatable content pipeline.",
            "Pages pass Core Web Vitals; organic impressions grew month over month."
          ]
        },
        {
          name: "Moving & Storage Sites",
          stack: "WordPress · Maintenance",
          blurb: "Ongoing page development for two live businesses.",
          link: "",
          bullets: [
            "Two businesses needed steady page work, not another rebuild.",
            "Reusable page systems, local SEO pages and monthly maintenance.",
            "Zero downtime handovers; new landing pages ship within days."
          ]
        }
      ]
    },
    contact: {
      kicker: "Contact",
      title: "Let's build something.",
      sub: "Tell me what you need built, fixed or measured. I usually reply within a day.",
      email: "ibnayaz789@gmail.com",
      phone: "+8801726611455",
      github: "https://github.com/fozayelibnayaz",
      cv: "Fozayel_Ibn_Ayaz.pdf",
      footerNote: "© 2026 Fozayel Ibn Ayaz — Dhaka, Bangladesh"
    },
    settings: {
      accent: "#ff6363",
      rain: true
    }
  };

  /* ---------- schema ---------- */
  var IMG_ASSETS = [ "img/avatar.jpg" ];

  var SCHEMA = [
    {
      id: "site", label: "Site", icon: "◧", title: "Site settings",
      fields: [
        { key: "title", label: "Browser title", type: "text" },
        { key: "description", label: "Meta description", type: "textarea" }
      ]
    },
    {
      id: "hero", label: "Hero", icon: "▭", title: "Hero section",
      fields: [
        { key: "eyebrow", label: "Eyebrow", type: "text" },
        { key: "name", label: "Name / headline", type: "text" },
        { key: "subline", label: "Subline", type: "textarea" },
        { key: "status", label: "Status chip", type: "text" }
      ]
    },
    {
      id: "about", label: "About", icon: "☺", title: "About section",
      fields: [
        { key: "kicker", label: "Kicker", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "paragraphs", label: "Paragraphs", type: "list", item: { type: "textarea" } },
        { key: "facts", label: "Quick facts", type: "objlist",
          fields: [ { key: "k", label: "Label", type: "text" }, { key: "v", label: "Value", type: "text" } ] },
      ]
    },
    {
      id: "experience", label: "Experience", icon: "⌁", title: "Experience section",
      fields: [
        { key: "kicker", label: "Kicker", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "roles", label: "Roles (newest first)", type: "objlist", addLabel: "Add role",
          fields: [
            { key: "period", label: "Period", type: "text", hint: "e.g. 12/2025 — Present" },
            { key: "title", label: "Role title", type: "text" },
            { key: "company", label: "Company", type: "text" },
            { key: "summary", label: "One-line summary", type: "text" },
            { key: "bullets", label: "Bullets", type: "list", item: { type: "textarea", rows: 2 } },
            { key: "tags", label: "Tech tags", type: "list", item: { type: "text" } }
          ] }
      ]
    },
    {
      id: "skills", label: "Skills", icon: "◈", title: "Skills section",
      fields: [
        { key: "kicker", label: "Kicker", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "note", label: "Footnote (HTML allowed)", type: "textarea", rows: 2 },
        { key: "groups", label: "Groups", type: "objlist", addLabel: "Add group",
          fields: [
            { key: "name", label: "Group name", type: "text" },
            { key: "items", label: "Skills", type: "list", item: { type: "text" } }
          ] }
      ]
    },
    {
      id: "projects", label: "Projects", icon: "▤", title: "Projects section",
      fields: [
        { key: "kicker", label: "Kicker", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "sub", label: "Intro", type: "textarea", rows: 2 },
        { key: "items", label: "Projects", type: "objlist", addLabel: "Add project",
          fields: [
            { key: "name", label: "Project name", type: "text" },
            { key: "stack", label: "Stack line", type: "text" },
            { key: "blurb", label: "Card blurb", type: "textarea", rows: 2 },
            { key: "bullets", label: "Case study (Problem / Build / Result)", type: "list", item: { type: "textarea", rows: 2 } },
            { key: "link", label: "Live link (optional)", type: "text" }
          ] }
      ]
    },
    {
      id: "contact", label: "Contact", icon: "✉", title: "Contact & footer",
      fields: [
        { key: "kicker", label: "Kicker", type: "text" },
        { key: "title", label: "Title", type: "text" },
        { key: "sub", label: "Subline", type: "textarea", rows: 2 },
        { key: "email", label: "Email", type: "text" },
        { key: "phone", label: "Phone", type: "text" },
        { key: "github", label: "GitHub URL", type: "text" },
        { key: "cv", label: "CV file path", type: "text" },
        { key: "footerNote", label: "Footer note", type: "text" }
      ]
    },
    {
      id: "settings", label: "Settings", icon: "⚙", title: "Appearance & media",
      fields: [
        { key: "accent", label: "Accent color", type: "color" },
        { key: "rain", label: "Contact particles", type: "toggle" }
      ]
    }
  ];

  /* ============================================================
     State + helpers
     ============================================================ */
  var state = loadState();
  var currentSection = "hero";
  var saveTimer = 0;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function loadState() {
    try {
      var raw = localStorage.getItem("fiy-draft");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return clone(DEFAULTS);
  }

  function saveState(showToast) {
    try {
      localStorage.setItem("fiy-draft", JSON.stringify(state));
      flashSaved();
      schedulePreview();
      if (showToast) toast("Draft saved");
    } catch (e) {
      toast("Could not save (storage full or blocked)");
    }
  }

  function flashSaved() {
    var el = document.getElementById("save-state");
    if (!el) return;
    var d = new Date();
    el.textContent = "Saved " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    el.style.opacity = "1";
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(function () { el.style.opacity = "0"; }, 2200);
  }

  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  /* ============================================================
     Form renderer
     ============================================================ */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function fieldLabel(def, parentKey) {
    var w = el("div", "field");
    var lab = el("label", null, esc(def.label || def.key));
    w.appendChild(lab);
    return w;
  }

  function makeInput(def, value, onInput) {
    var type = def.type;
    if (type === "textarea") {
      var ta = document.createElement("textarea");
      ta.value = value || "";
      if (def.rows) ta.rows = def.rows;
      ta.addEventListener("input", function () { onInput(ta.value); });
      return ta;
    }
    if (type === "select") {
      var sel = document.createElement("select");
      (def.options || []).forEach(function (o) {
        var opt = document.createElement("option");
        opt.value = o.v; opt.textContent = o.l;
        if (o.v === value) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener("change", function () { onInput(sel.value); });
      return sel;
    }
    if (type === "color") {
      var wrap = el("div", "inline-controls");
      var c = document.createElement("input");
      c.type = "color"; c.value = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ff6363";
      var t = document.createElement("input");
      t.type = "text"; t.value = value || "";
      t.style.fontFamily = "var(--font-mono)";
      c.addEventListener("input", function () { t.value = c.value; onInput(c.value); });
      t.addEventListener("change", function () { if (/^#[0-9a-fA-F]{6}$/.test(t.value)) { c.value = t.value; onInput(t.value); } });
      wrap.appendChild(c); wrap.appendChild(t);
      return wrap;
    }
    if (type === "toggle") {
      var tg = el("label", "toggle");
      var chk = document.createElement("input");
      chk.type = "checkbox"; chk.checked = !!value;
      var track = el("span", "track");
      chk.addEventListener("change", function () { onInput(chk.checked); });
      tg.appendChild(chk); tg.appendChild(track);
      return tg;
    }
    /* text */
    var inp = document.createElement("input");
    inp.type = "text";
    inp.value = value || "";
    inp.addEventListener("input", function () { onInput(inp.value); });
    return inp;
  }

  function renderSimpleField(host, def, get, set) {
    var w = fieldLabel(def);
    var ctrl = makeInput(def, get(), set);
    ctrl.setAttribute("data-path", (currentSection || "") + "." + def.key);
    w.appendChild(ctrl);
    if (def.hint) w.appendChild(el("p", "hint", esc(def.hint)));
    host.appendChild(w);
  }

  function renderListField(host, def, arr, onChange) {
    var w = fieldLabel(def);
    var wrap = el("div");
    arr.forEach(function (item, i) {
      var row = el("div", "obj-card");
      var head = el("div", "obj-card-head");
      head.appendChild(el("span", "title", esc(def.label + " " + (i + 1))));
      head.appendChild(moveBtn("↑", function () { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); onChange(); renderSection(); } }));
      head.appendChild(moveBtn("↓", function () { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); onChange(); renderSection(); } }));
      head.appendChild(moveBtn("✕", function () { arr.splice(i, 1); onChange(); renderSection(); }, "danger"));
      row.appendChild(head);
      var input = makeInput(def.item || { type: "text" }, item, function (v) {
        arr[i] = v; onChange();
      });
      input.style.marginTop = "0";
      row.appendChild(input);
      wrap.appendChild(row);
    });
    var add = el("button", "btn add-row", "+ " + esc(def.addLabel || "Add item"));
    add.type = "button";
    add.addEventListener("click", function () {
      arr.push(def.item && def.item.type === "textarea" ? "" : "");
      onChange(); renderSection();
    });
    wrap.appendChild(add);
    w.appendChild(wrap);
    host.appendChild(w);
  }

  function renderObjListField(host, def, arr, onChange) {
    var w = fieldLabel(def);
    var wrap = el("div");
    arr.forEach(function (item, i) {
      var card = el("div", "obj-card");
      var head = el("div", "obj-card-head");
      head.appendChild(el("span", "title", esc(item.title || item.name || (def.label + " " + (i + 1)))));
      head.appendChild(moveBtn("↑", function () { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); onChange(); renderSection(); } }));
      head.appendChild(moveBtn("↓", function () { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); onChange(); renderSection(); } }));
      head.appendChild(moveBtn("✕", function () { arr.splice(i, 1); onChange(); renderSection(); }, "danger"));
      card.appendChild(head);

      (def.fields || []).forEach(function (sub) {
        if (sub.type === "list") {
          if (!Array.isArray(item[sub.key])) item[sub.key] = [];
          renderListField(card, sub, item[sub.key], onChange);
        } else {
          renderSimpleField(card, sub,
            function () { return item[sub.key]; },
            function (v) { item[sub.key] = v; onChange(); });
        }
      });
      wrap.appendChild(card);
    });
    var add = el("button", "btn add-row", "+ " + esc(def.addLabel || "Add"));
    add.type = "button";
    add.addEventListener("click", function () {
      var fresh = {};
      (def.fields || []).forEach(function (sub) { fresh[sub.key] = sub.type === "list" ? [] : ""; });
      arr.push(fresh);
      onChange(); renderSection();
    });
    wrap.appendChild(add);
    w.appendChild(wrap);
    host.appendChild(w);
  }

  function renderImageField(host, def, arr, onChange) {
    var w = fieldLabel(def);
    var wrap = el("div");
    arr.forEach(function (src, i) {
      var row = el("div", "obj-card");
      var head = el("div", "obj-card-head");
      head.appendChild(el("span", "title", "Image " + (i + 1)));
      head.appendChild(moveBtn("↑", function () { if (i > 0) { arr.splice(i - 1, 0, arr.splice(i, 1)[0]); onChange(); renderSection(); } }));
      head.appendChild(moveBtn("↓", function () { if (i < arr.length - 1) { arr.splice(i + 1, 0, arr.splice(i, 1)[0]); onChange(); renderSection(); } }));
      head.appendChild(moveBtn("✕", function () { arr.splice(i, 1); onChange(); renderSection(); }, "danger"));
      row.appendChild(head);

      var grid = el("div", null);
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "96px 1fr";
      grid.style.gap = "10px";
      grid.style.alignItems = "start";
      var thumb = el("img");
      thumb.src = src || "";
      thumb.alt = "";
      thumb.style.width = "96px";
      thumb.style.height = "72px";
      thumb.style.objectFit = "cover";
      thumb.style.borderRadius = "8px";
      thumb.style.border = "1px solid var(--border)";
      grid.appendChild(thumb);

      var col = el("div");
      var sel = document.createElement("select");
      sel.style.marginBottom = "8px";
      var blank = document.createElement("option");
      blank.value = ""; blank.textContent = "— pick from library —";
      sel.appendChild(blank);
      IMG_ASSETS.forEach(function (a) {
        var o = document.createElement("option");
        o.value = a; o.textContent = a;
        if (a === src) o.selected = true;
        sel.appendChild(o);
      });
      sel.addEventListener("change", function () {
        if (sel.value) { arr[i] = sel.value; thumb.src = sel.value; onChange(); }
      });
      col.appendChild(sel);

      var inp = document.createElement("input");
      inp.type = "text";
      inp.placeholder = "…or paste a path / URL";
      inp.value = src || "";
      inp.addEventListener("change", function () {
        arr[i] = inp.value;
        thumb.src = inp.value;
        onChange();
      });
      col.appendChild(inp);
      grid.appendChild(col);
      row.appendChild(grid);
      wrap.appendChild(row);
    });
    var add = el("button", "btn add-row", "+ Add image");
    add.type = "button";
    add.addEventListener("click", function () { arr.push(""); onChange(); renderSection(); });
    wrap.appendChild(add);
    w.appendChild(wrap);
    host.appendChild(w);
  }

  function moveBtn(label, fn, cls) {
    var b = el("button", "mini-btn" + (cls ? " " + cls : ""), label);
    b.type = "button";
    b.addEventListener("click", fn);
    return b;
  }

  function renderSection() {
    var body = document.getElementById("editor-body");
    var sec = SCHEMA.find(function (s) { return s.id === currentSection; });
    document.getElementById("sec-title").textContent = sec.title;
    document.getElementById("crumb").textContent = "Content / " + sec.label;
    body.innerHTML = "";

    var data = state[sec.id];
    sec.fields.forEach(function (def) {
      var val = data ? data[def.key] : undefined;
      if (def.type === "list") {
        if (!Array.isArray(val)) val = data[def.key] = [];
        renderListField(body, def, val, saveDebounced);
      } else if (def.type === "objlist") {
        if (!Array.isArray(val)) val = data[def.key] = [];
        renderObjListField(body, def, val, saveDebounced);
      } else if (def.type === "image") {
        if (!Array.isArray(val)) val = data[def.key] = [];
        renderImageField(body, def, val, saveDebounced);
      } else {
        renderSimpleField(body, def,
          function () { return data[def.key]; },
          function (v) { data[def.key] = v; saveDebounced(); });
      }
    });

    Array.prototype.forEach.call(document.querySelectorAll("#side-nav button"), function (b) {
      b.classList.toggle("active", b.getAttribute("data-sec") === currentSection);
    });
  }

  function saveDebounced() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { saveState(false); }, 500);
  }

  /* ============================================================
     Sidebar + boot
     ============================================================ */
  function buildSidebar() {
    var nav = document.getElementById("side-nav");
    nav.innerHTML = "";
    SCHEMA.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("data-sec", s.id);
      b.innerHTML = "<span class='ico'>" + s.icon + "</span>" + esc(s.label) +
        countBadge(s.id);
      b.addEventListener("click", function () {
        currentSection = s.id;
        renderSection();
        if (window.innerWidth < 761) document.getElementById("editor").scrollIntoView({ behavior: "smooth" });
      });
      nav.appendChild(b);
    });
  }

  function countBadge(id) {
    var d = state[id];
    var n = d && (d.roles ? d.roles.length : d.items ? d.items.length : d.groups ? d.groups.length : 0);
    return n ? "<span class='cnt'>" + n + "</span>" : "";
  }

  /* ---------- preview sync ---------- */
  var frame = document.getElementById("preview-frame");
  var previewTimer = 0;
  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(function () {
      try { frame.contentWindow.location.reload(); } catch (e) { frame.src = frame.src; }
    }, 700);
  }

  /* ---------- publish ---------- */
  function publish() {
    try { localStorage.removeItem("fiy-draft"); } catch (e) {}
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "content.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    document.getElementById("publish-modal").classList.add("show");
    schedulePreview();
  }

  /* ---------- import / export / reset ---------- */
  function exportJson() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "portfolio-content-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
    toast("Exported JSON");
  }

  function importJson(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var parsed = JSON.parse(r.result);
        state = parsed;
        saveState(false);
        renderSection();
        buildSidebar();
        schedulePreview();
        toast("Imported ✓");
      } catch (e) {
        toast("Invalid JSON file");
      }
    };
    r.readAsText(file);
  }

  function resetDraft() {
    if (!confirm("Reset all edits back to the built-in content? This cannot be undone.")) return;
    try { localStorage.removeItem("fiy-draft"); } catch (e) {}
    state = clone(DEFAULTS);
    renderSection();
    buildSidebar();
    schedulePreview();
    toast("Draft reset to defaults");
  }

  /* ---------- login ---------- */
  function initLogin() {
    var gate = document.getElementById("login-gate");
    var dash = document.getElementById("dash");
    var form = document.getElementById("login-form");
    var pass = document.getElementById("login-pass");
    var err = document.getElementById("login-error");

    function unlock() {
      gate.style.display = "none";
      dash.hidden = false;
      buildSidebar();
      renderSection();
    }

    try { if (sessionStorage.getItem("fiy-admin") === "1") { unlock(); return; } } catch (e) {}

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = pass.value;
      sha256Hex(val).then(function (hex) {
        if (hex === storedHash()) {
          try { sessionStorage.setItem("fiy-admin", "1"); } catch (e2) {}
          unlock();
        } else {
          err.hidden = false;
          pass.value = "";
          pass.focus();
        }
      });
    });
  }

  /* ---------- wire up ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initLogin();

    document.getElementById("btn-publish").addEventListener("click", publish);
    document.getElementById("btn-export").addEventListener("click", exportJson);
    document.getElementById("btn-import").addEventListener("click", function () {
      document.getElementById("file-import").click();
    });
    document.getElementById("file-import").addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) importJson(e.target.files[0]);
      e.target.value = "";
    });
    document.getElementById("btn-reset").addEventListener("click", resetDraft);
    document.getElementById("btn-preview-reload").addEventListener("click", function () {
      try { frame.contentWindow.location.reload(); } catch (e) { frame.src = frame.src; }
    });
    document.getElementById("btn-preview-toggle").addEventListener("click", function () {
      document.getElementById("dash").classList.toggle("with-preview");
    });
    document.getElementById("pub-ok").addEventListener("click", function () {
      document.getElementById("publish-modal").classList.remove("show");
    });
    document.getElementById("pub-close").addEventListener("click", function () {
      document.getElementById("publish-modal").classList.remove("show");
    });

    /* autosave on leave, just in case */
    window.addEventListener("beforeunload", function () {
      clearTimeout(saveTimer);
      try { localStorage.setItem("fiy-draft", JSON.stringify(state)); } catch (e) {}
    });
  });
})();
