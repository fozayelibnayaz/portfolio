/* ============================================================
   contact.js — every contact click responds, everywhere
   email/phone → in-page contact card (copy + native handoff)
   github/cv   → native open; if blocked, the card shows the link
   ============================================================ */
(function () {
  "use strict";

  var backdrop = document.getElementById("contact-modal");
  if (!backdrop) return;

  var valueEl = backdrop.querySelector(".cm-value");
  var titleEl = backdrop.querySelector(".cm-title");
  var copyBtn = backdrop.querySelector(".cm-copy");
  var openBtn = backdrop.querySelector(".cm-open");
  var closeBtn = backdrop.querySelector(".modal-close");
  var current = { value: "", href: "" };

  function openCard(data) {
    titleEl.textContent = data.title;
    valueEl.textContent = data.value;
    copyBtn.style.display = data.copyable ? "" : "none";
    openBtn.style.display = data.href ? "" : "none";
    openBtn.setAttribute("href", data.href || "#");
    current = { value: data.value, href: data.href };
    backdrop.classList.add("is-open");
    document.body.classList.add("modal-locked");
    if (data.tryOpen) tryNative(data.href);
    var f = backdrop.querySelector("button, a[href]");
    if (f) f.focus();
  }

  function closeCard() {
    backdrop.classList.remove("is-open");
    document.body.classList.remove("modal-locked");
  }

  function tryNative(href) {
    /* attempt native handoff (new tab / mail / tel). If blocked, card stays. */
    try {
      var w = window.open(href, "_blank", "noopener");
      if (w) w.opener = null;
    } catch (e) {}
  }

  function copyText(text, btn) {
    function done(ok) {
      var old = btn.textContent;
      btn.textContent = ok ? "Copied ✓" : "Copy failed";
      btn.disabled = true;
      setTimeout(function () { btn.textContent = old; btn.disabled = false; }, 1400);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        ta.remove();
        done(ok);
      } catch (e) { done(false); }
    }
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-contact]");
    if (!a) return;
    e.preventDefault();
    var kind = a.getAttribute("data-contact");
    var value = a.getAttribute("data-value") || a.textContent.trim();
    var href = a.getAttribute("data-href") || a.getAttribute("href") || "";

    if (kind === "email" || kind === "phone") {
      openCard({
        title: kind === "email" ? "Email me" : "Call me",
        value: value,
        href: href,
        copyable: true,
        tryOpen: false
      });
    } else {
      /* github / cv: try native; card is the visible fallback */
      openCard({ title: kind === "cv" ? "Download CV" : "GitHub", value: value, href: href, copyable: false, tryOpen: true });
    }
  });

  copyBtn.addEventListener("click", function () { copyText(current.value, copyBtn); });
  closeBtn.addEventListener("click", closeCard);
  backdrop.addEventListener("click", function (e) { if (e.target === backdrop) closeCard(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && backdrop.classList.contains("is-open")) closeCard();
  });
})();
