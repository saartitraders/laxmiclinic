/* Laxmi Clinic — site behaviour (no libraries) */
(function () {
  "use strict";
  var WA_NUMBER = "918750057955";
  document.documentElement.classList.add("js");

  /* Mobile menu */
  var menuBtn = document.querySelector(".menu-btn");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Footer year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Gallery lightbox */
  var box = document.getElementById("lightbox");
  if (box && typeof box.showModal === "function") {
    var bimg = box.querySelector("img"), bcap = box.querySelector("p");
    document.querySelectorAll("[data-full]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        bimg.src = btn.getAttribute("data-full");
        bimg.alt = btn.getAttribute("data-caption") || "";
        bcap.textContent = btn.getAttribute("data-caption") || "";
        box.showModal();
      });
    });
    box.addEventListener("click", function (e) { if (e.target === box || e.target.closest(".close")) box.close(); });
  }

  /* Women's health tabs */
  var tabs = document.querySelectorAll(".wh-tabs [role=tab]");
  if (tabs.length) {
    var select = function (id, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("aria-controls") === id;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      document.querySelectorAll(".wh-panel").forEach(function (p) { p.hidden = p.id !== id; });
    };
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () {
        select(t.getAttribute("aria-controls"));
        if (window.innerWidth < 860) document.getElementById(t.getAttribute("aria-controls")).scrollIntoView({ block: "nearest" });
      });
      t.addEventListener("keydown", function (e) {
        var d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = tabs[(i + d + tabs.length) % tabs.length];
        select(n.getAttribute("aria-controls"), true);
      });
    });
    var start = location.hash.replace("#", "");
    select(document.getElementById(start) && document.getElementById(start).classList.contains("wh-panel") ? start : tabs[0].getAttribute("aria-controls"));
  }

  /* Forms -> WhatsApp */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function today() { var d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function niceDate(v) {
    var p = v.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  }
  function setErr(field, msg) {
    var wrap = field.closest(".field"); if (!wrap) return;
    wrap.classList.toggle("invalid", !!msg);
    var e = wrap.querySelector(".err"); if (e) e.textContent = msg || "";
  }

  var date = document.getElementById("bk-date");
  if (date) {
    date.min = today();
    date.addEventListener("change", function () {
      if (!date.value) return setErr(date, "");
      var p = date.value.split("-");
      var isSun = new Date(+p[0], +p[1] - 1, +p[2]).getDay() === 0;
      setErr(date, isSun ? "Clinic is closed on Sunday. Please choose Monday to Saturday." : "");
    });
  }

  document.querySelectorAll("form[data-wa]").forEach(function (form) {
    var result = document.getElementById(form.getAttribute("data-result"));
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[required]").forEach(function (f) {
        var v = f.value.trim();
        var msg = v ? "" : "Please fill this in.";
        if (!msg && f.type === "tel" && !/^[6-9]\d{9}$/.test(v.replace(/\D/g, "").slice(-10))) msg = "Enter a 10-digit mobile number.";
        if (!msg && f.id === "bk-date") {
          var p = v.split("-");
          if (new Date(+p[0], +p[1] - 1, +p[2]).getDay() === 0) msg = "Clinic is closed on Sunday. Please choose Monday to Saturday.";
          if (v < today()) msg = "Please choose today or a later date.";
        }
        setErr(f, msg);
        if (msg && ok) { ok = false; f.focus(); }
      });
      if (!ok) return;

      var lines = [form.getAttribute("data-wa")];
      form.querySelectorAll("[data-label]").forEach(function (f) {
        var v = f.value.trim(); if (!v) return;
        if (f.type === "date") v = niceDate(v);
        lines.push(f.getAttribute("data-label") + ": " + v);
      });
      var text = lines.join("\n");
      var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);

      if (result) {
        result.hidden = false;
        result.querySelector("pre").textContent = text;
        result.querySelector("a.btn-wa").href = url;
        result.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      try { window.open(url, "_blank", "noopener"); } catch (err) { /* button in result panel is the fallback */ }
    });
  });

  /* YouTube embed needs the page to be served over http(s). When opened as a local file,
     show a link card instead of YouTube's "Error 153" screen. */
  if (location.protocol === "file:") {
    document.querySelectorAll(".yt-frame").forEach(function (f) {
      var ifr = f.querySelector("iframe"), fb = f.querySelector(".yt-fallback");
      if (ifr && fb) { ifr.remove(); fb.hidden = false; }
    });
  }

  /* Copy phone number */
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-copy"), old = b.textContent;
      var done = function () { b.textContent = "Copied"; setTimeout(function () { b.textContent = old; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(done, function () {});
    });
  });
})();
