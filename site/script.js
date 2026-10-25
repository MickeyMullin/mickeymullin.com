/* mickeymullin.com — analytics bootstrap, event tracking, contact form */
(function () {
  "use strict";
  var cfg = window.SITE || {};

  function addScript(src, attrs) {
    var s = document.createElement("script");
    s.src = src;
    s.async = true;
    if (attrs) for (var k in attrs) s.setAttribute(k, attrs[k]);
    document.head.appendChild(s);
  }

  // --- Analytics (each loads only when configured) -------------------------
  if (cfg.ga4) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", cfg.ga4);
    addScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(cfg.ga4));
  }
  if (cfg.umamiSrc && cfg.umamiId) {
    addScript(cfg.umamiSrc, { "data-website-id": cfg.umamiId, defer: "" });
  }
  if (cfg.clarity) {
    (function (c, l, a, r, i) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      addScript("https://www.clarity.ms/tag/" + encodeURIComponent(i));
    })(window, document, "clarity", "script", cfg.clarity);
  }

  // One call that fans out to whichever tools are present.
  function track(name, params) {
    params = params || {};
    try { if (window.gtag) window.gtag("event", name, params); } catch (e) {}
    try { if (window.umami && window.umami.track) window.umami.track(name, params); } catch (e) {}
  }
  window.track = track;

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) track("click_to_call", { link_url: href });
    else if (href.indexOf("mailto:") === 0) track("click_to_email", { link_url: href });
    else if (a.dataset.cta) track("cta_click", { location: a.dataset.cta });
  });

  // --- Footer year ---------------------------------------------------------
  var yr = document.getElementById("yr");
  if (yr) yr.textContent = String(new Date().getFullYear());

  // --- Contact form --------------------------------------------------------
  var form = document.getElementById("contactForm");
  if (!form) return;
  var status = form.querySelector(".form-status");
  var button = form.querySelector('button[type="submit"]');

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  function validate() {
    var ok = true;
    ["name", "email", "message"].forEach(function (n) {
      var el = form.elements[n];
      var bad = !el.value.trim() || (n === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad && ok) { el.focus(); ok = false; }
    });
    return ok;
  }

  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!validate()) { setStatus("Please fill in your name, a valid email, and a short message.", "err"); return; }

    button.disabled = true;
    setStatus("Sending…");

    fetch(cfg.formEndpoint || form.action, {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: new FormData(form)
    })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }).then(function (j) { return { http: r.ok, body: j }; }); })
      .then(function (res) {
        if (res.http && res.body.ok) {
          form.reset();
          setStatus("Thanks. Your message is in, and I'll reply within one business day.", "ok");
          track("generate_lead", { form: "contact" });
        } else {
          throw new Error(res.body.error || "send failed");
        }
      })
      .catch(function () {
        setStatus("That didn't send. Please email hello@mickeymullin.com directly.", "err");
      })
      .finally(function () { button.disabled = false; });
  });
})();
