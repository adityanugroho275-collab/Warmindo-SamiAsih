/*
 Template Name: FoodEpik (v2.0)
 File Name: main.js
 Author Name: ThemeVault
 Author URI: https://www.themevault.net/
 License URI: https://www.themevault.net/license/
 Dependency-free. Handles: style switcher, back-to-top, reveal-on-scroll,
 stat counters, deal countdown, gallery lightbox, navbar collapse-on-click.
*/
(function () {
    "use strict";

    /* ---- Color theme switcher (6 themes, persisted) ---- */
    var THEMES = ["tamarillo", "pomegranate", "hot-cinnamon", "egg-blue", "west-side", "dark-green"];
    var saved = null;
    try { saved = localStorage.getItem("fe-theme"); } catch (e) { /* private mode */ }
    var pickerOn = (function () { var el = document.querySelector(".fe-switcher"); return !!el && getComputedStyle(el).display !== "none"; })();
    if (saved && pickerOn && THEMES.indexOf(saved) > 0) document.documentElement.setAttribute("data-theme", saved);

    var switcher = document.querySelector(".fe-switcher");
    if (switcher) {
        var toggle = switcher.querySelector(".fe-switcher-toggle");
        toggle.addEventListener("click", function () {
            var open = switcher.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
        switcher.querySelectorAll("[data-fe-theme]").forEach(function (btn) {
            var theme = btn.getAttribute("data-fe-theme");
            if (theme === (saved || "tamarillo")) btn.setAttribute("aria-pressed", "true");
            btn.addEventListener("click", function () {
                if (theme === "tamarillo") document.documentElement.removeAttribute("data-theme");
                else document.documentElement.setAttribute("data-theme", theme);
                try { localStorage.setItem("fe-theme", theme); } catch (e) { /* ignore */ }
                switcher.querySelectorAll("[data-fe-theme]").forEach(function (b) { b.removeAttribute("aria-pressed"); });
                btn.setAttribute("aria-pressed", "true");
            });
        });
    }

    /* ---- Back to top ---- */
    var toTop = document.getElementById("fe-back-to-top");
    if (toTop) {
        var onScroll = function () { toTop.classList.toggle("is-visible", window.scrollY > 300); };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    }

    /* ---- Reveal on scroll (wow.js replacement) ---- */
    var revealEls = document.querySelectorAll(".fe-reveal");
    if (revealEls.length && "IntersectionObserver" in window) {
        var revealIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealIO.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { revealIO.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    }

    /* ---- Stat counters (counterup replacement) ---- */
    var counters = document.querySelectorAll(".fe-counter[data-target]");
    if (counters.length && "IntersectionObserver" in window) {
        var counterIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                counterIO.unobserve(entry.target);
                var el = entry.target;
                var target = parseInt(el.getAttribute("data-target"), 10) || 0;
                var start = null;
                var step = function (ts) {
                    if (!start) start = ts;
                    var progress = Math.min((ts - start) / 1200, 1);
                    el.textContent = String(Math.floor(progress * target));
                    if (progress < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            });
        }, { threshold: 0.4 });
        counters.forEach(function (el) { counterIO.observe(el); });
    }

    /* ---- Deal countdown (rolling deadline, data-days from markup) ---- */
    var clock = document.getElementById("fe-countdown");
    if (clock) {
        var days = parseInt(clock.getAttribute("data-days"), 10) || 15;
        var deadline = Date.now() + days * 24 * 60 * 60 * 1000;
        var spans = {
            days: clock.querySelector(".fe-days"),
            hours: clock.querySelector(".fe-hrs"),
            minutes: clock.querySelector(".fe-minutes"),
            seconds: clock.querySelector(".fe-seconds")
        };
        var pad = function (n) { return ("0" + n).slice(-2); };
        var tick = function () {
            var t = deadline - Date.now();
            if (t < 0) t = 0;
            spans.days.textContent = pad(Math.floor(t / 86400000));
            spans.hours.textContent = pad(Math.floor(t / 3600000) % 24);
            spans.minutes.textContent = pad(Math.floor(t / 60000) % 60);
            spans.seconds.textContent = pad(Math.floor(t / 1000) % 60);
            if (t === 0) clearInterval(timer);
        };
        tick();
        var timer = setInterval(tick, 1000);
    }

    /* ---- Gallery lightbox (magnific-popup replacement) ---- */
    var galleryLinks = Array.prototype.slice.call(document.querySelectorAll(".fe-gallery a[href]"));
    var lightbox = document.getElementById("fe-lightbox");
    if (galleryLinks.length && lightbox && typeof lightbox.showModal === "function") {
        var lbImg = lightbox.querySelector("img");
        var current = 0;
        var show = function (i) {
            current = (i + galleryLinks.length) % galleryLinks.length;
            lbImg.src = galleryLinks[current].getAttribute("href");
            var thumb = galleryLinks[current].querySelector("img");
            lbImg.alt = thumb ? thumb.alt : "";
        };
        galleryLinks.forEach(function (link, i) {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                show(i);
                lightbox.showModal();
            });
        });
        lightbox.querySelector(".fe-lightbox-prev").addEventListener("click", function () { show(current - 1); });
        lightbox.querySelector(".fe-lightbox-next").addEventListener("click", function () { show(current + 1); });
        lightbox.querySelector(".fe-lightbox-close").addEventListener("click", function () { lightbox.close(); });
        lightbox.addEventListener("click", function (e) { if (e.target === lightbox) lightbox.close(); });
    }

    /* ---- Collapse the mobile navbar after tapping a section link ---- */
    var navCollapse = document.getElementById("feNavbar");
    if (navCollapse && window.bootstrap) {
        navCollapse.querySelectorAll('a[href^="#"]:not(.dropdown-toggle)').forEach(function (link) {
            link.addEventListener("click", function () {
                var instance = window.bootstrap.Collapse.getInstance(navCollapse);
                if (instance && navCollapse.classList.contains("show")) instance.hide();
            });
        });
    }
    /* ---- Forms: validate, then show the confirmation note (demo: nothing is sent) ---- */
    document.querySelectorAll("form.fe-reservation-form, form.fe-newsletter-form").forEach(function (form) {
        form.addEventListener("submit", function (ev) {
            ev.preventDefault();
            if (!form.checkValidity()) { form.classList.add("was-validated"); var bad = form.querySelector(":invalid"); if (bad) bad.focus(); return; }
            var note = form.querySelector(".tv-form-note");
            if (note) { note.hidden = false; note.focus(); }
            form.reset();
            form.classList.remove("was-validated");
        });
    });
})();
