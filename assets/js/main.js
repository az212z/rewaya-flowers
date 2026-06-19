/* رواية للزهور — main.js (vanilla, guarded) */
(function () {
  "use strict";

  var WA = "966507140313"; // WhatsApp intl

  /* ---------- Mobile full-screen menu ---------- */
  var burger = document.querySelector("[data-burger]");
  var menu = document.querySelector("[data-menu]");
  var closeBtn = document.querySelector("[data-menu-close]");

  function openMenu() {
    if (!menu) return;
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    if (burger) burger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    var first = menu.querySelector("a, button");
    if (first) first.focus();
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    if (burger) { burger.setAttribute("aria-expanded", "false"); burger.focus(); }
    document.body.style.overflow = "";
  }
  if (burger) burger.addEventListener("click", openMenu);
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  if (menu) {
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (menu && menu.classList.contains("open")) closeMenu();
      if (lb && lb.classList.contains("open")) closeLightbox();
    }
  });

  /* ---------- Scroll reveal (IntersectionObserver + fallback) ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  function showAll() { reveals.forEach(function (el) { el.classList.add("in"); }); }
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var delay = parseInt(el.getAttribute("data-delay") || "0", 10);
          setTimeout(function () { el.classList.add("in"); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
    // Safety fallback: ensure nothing stays hidden
    setTimeout(showAll, 2500);
  } else {
    showAll();
  }

  /* ---------- Drifting petals ---------- */
  var petalsHost = document.querySelector("[data-petals]");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (petalsHost && !reduceMotion) {
    var COUNT = 9;
    for (var i = 0; i < COUNT; i++) {
      var p = document.createElement("span");
      p.className = "petal";
      p.style.left = (Math.random() * 100) + "%";
      var dur = 12 + Math.random() * 12;
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = (-Math.random() * dur) + "s";
      petalsHost.appendChild(p);
    }
  }

  /* ---------- Lightbox ---------- */
  var lb = document.querySelector("[data-lightbox]");
  var lbImg = lb ? lb.querySelector("img") : null;
  var lbClose = lb ? lb.querySelector("[data-lightbox-close]") : null;
  function openLightbox(src, alt) {
    if (!lb || !lbImg) return;
    lbImg.src = src; lbImg.alt = alt || "";
    lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (lbClose) lbClose.focus();
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.querySelectorAll("[data-shot]").forEach(function (fig) {
    fig.addEventListener("click", function () {
      var img = fig.querySelector("img");
      if (img) openLightbox(img.getAttribute("src"), img.getAttribute("alt"));
    });
    fig.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fig.click(); }
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });

  /* ---------- Order form → wa.me + localStorage + toast ---------- */
  var form = document.querySelector("[data-order-form]");
  var toast = document.querySelector("[data-toast]");
  var toastTimer;

  function showToast() {
    if (!toast) return;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 4500);
  }
  function setError(field, msg) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("invalid", !!msg);
    var err = wrap.querySelector(".err");
    if (err) err.textContent = msg || "";
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements["name"];
      var phone = form.elements["phone"];
      var service = form.elements["service"];
      var when = form.elements["when"];
      var notes = form.elements["notes"];
      var ok = true;

      if (!name.value.trim()) { setError(name, "فضلًا اكتب الاسم"); ok = false; } else setError(name, "");
      var phoneClean = phone.value.replace(/[\s-]/g, "");
      if (!/^0?5\d{8}$/.test(phoneClean)) { setError(phone, "رقم جوال سعودي صحيح يبدأ بـ 05"); ok = false; } else setError(phone, "");
      if (!service.value) { setError(service, "اختر نوع الطلب"); ok = false; } else setError(service, "");

      if (!ok) {
        var firstInvalid = form.querySelector(".field.invalid input, .field.invalid select");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var order = {
        name: name.value.trim(),
        phone: phoneClean,
        service: service.value,
        when: when.value || "غير محدد",
        notes: notes.value.trim() || "لا يوجد",
        at: new Date().toISOString()
      };

      // localStorage demo
      try {
        var key = "rewaya_orders";
        var list = JSON.parse(localStorage.getItem(key) || "[]");
        list.push(order);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (err) { /* storage may be blocked; continue */ }

      // Build WhatsApp message
      var msg =
        "السلام عليكم، طلب من موقع رواية للزهور:%0A" +
        "الاسم: " + encodeURIComponent(order.name) + "%0A" +
        "الجوال: " + encodeURIComponent(order.phone) + "%0A" +
        "نوع الطلب: " + encodeURIComponent(order.service) + "%0A" +
        "الموعد المفضل: " + encodeURIComponent(order.when) + "%0A" +
        "ملاحظات: " + encodeURIComponent(order.notes);
      var url = "https://wa.me/" + WA + "?text=" + msg;

      showToast();
      form.reset();
      setTimeout(function () { window.open(url, "_blank", "noopener"); }, 600);
    });

    // clear error on input
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () { setError(el, ""); });
    });
  }

  /* ---------- Footer year ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
