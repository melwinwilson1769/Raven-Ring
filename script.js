/* ============================================================
   RAVEN & RING — supplementary animation / stylization layer
   Adds: CRT boot cleanup, sliding nav glow, ember particles,
   raven flyovers, parallax stars, toast notifications, wax
   shard bursts, scroll unroll flashes, and title glitch.
   This file only ADDS behaviour — the core cipher logic lives
   in the inline <script> of index.html and is untouched.
   ============================================================ */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  var DIRECTIONS_KEY = "ravenring_hide_directions";

  function init() {
    cleanupBoot();
    setupNavIndicator();
    setupParallaxStars();
    startEmberField();
    scheduleRaven();
    setupTitleGlitch();
    setupSealExtras();
    setupScriptoriumExtras();
    setupModals();
    setupReviewWidget();
    runIntro();
    window.addEventListener("resize", setupNavIndicator);
    window.addEventListener("hashchange", function () {
      setTimeout(setupNavIndicator, 30);
    });
  }

  /* ---------------- Intro: bat horde + directions ---------------- */
  function runIntro() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(
      function () {
        if (!reduced) spawnBatHorde();
        var hideDirections = false;
        try {
          hideDirections = localStorage.getItem(DIRECTIONS_KEY) === "1";
        } catch (e) {
          hideDirections = false;
        }
        if (!hideDirections) {
          setTimeout(
            function () {
              openModal("directionsModal");
            },
            reduced ? 500 : 1900
          );
        }
      },
      reduced ? 200 : 350
    );
  }

  function spawnBatHorde() {
    var field = document.getElementById("batField");
    if (!field) return;
    var count = 18;
    for (var i = 0; i < count; i++) {
      (function (idx) {
        setTimeout(function () {
          var bat = document.createElement("div");
          bat.className = "bat";
          var angle = Math.random() * Math.PI * 2;
          var maxDim = Math.max(window.innerWidth, window.innerHeight);
          var dist = maxDim * (0.65 + Math.random() * 0.55);
          var dx = Math.cos(angle) * dist;
          var dy = Math.sin(angle) * dist;
          var rot = (Math.random() * 50 - 25).toFixed(0) + "deg";
          var duration = (1.1 + Math.random() * 0.7).toFixed(2) + "s";
          bat.style.setProperty("--bx", dx.toFixed(0) + "px");
          bat.style.setProperty("--by", dy.toFixed(0) + "px");
          bat.style.setProperty("--brot", rot);
          bat.style.animationDuration = duration;
          bat.innerHTML =
            '<svg viewBox="0 0 16 10" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M0 4 L4 0 L6 4 L8 2 L10 4 L12 0 L16 4 L11 6 L8 5 L5 6 Z" fill="#0d0d12"/>' +
            "</svg>";
          field.appendChild(bat);
          bat.addEventListener("animationend", function () {
            bat.remove();
          });
        }, idx * 22);
      })(i);
    }
  }

  /* ---------------- Modal system ---------------- */
  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("show");
  }
  function closeModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("show");
  }

  function setupModals() {
    var directionsModal = document.getElementById("directionsModal");
    var thankYouModal = document.getElementById("thankYouModal");
    var dontShowAgain = document.getElementById("dontShowAgain");

    function dismissDirections() {
      if (dontShowAgain && dontShowAgain.checked) {
        try {
          localStorage.setItem(DIRECTIONS_KEY, "1");
        } catch (e) {}
      }
      closeModal("directionsModal");
    }

    var closeDirectionsBtn = document.getElementById("closeDirectionsBtn");
    var directionsXBtn = document.getElementById("directionsXBtn");
    var goScriptoriumBtn = document.getElementById("goScriptoriumBtn");

    if (closeDirectionsBtn) closeDirectionsBtn.addEventListener("click", dismissDirections);
    if (directionsXBtn) directionsXBtn.addEventListener("click", dismissDirections);
    if (goScriptoriumBtn) {
      goScriptoriumBtn.addEventListener("click", function () {
        dismissDirections();
        location.hash = "scriptorium";
      });
    }

    var closeThankYouBtn = document.getElementById("closeThankYouBtn");
    var thankYouXBtn = document.getElementById("thankYouXBtn");
    if (closeThankYouBtn) closeThankYouBtn.addEventListener("click", function () { closeModal("thankYouModal"); });
    if (thankYouXBtn) thankYouXBtn.addEventListener("click", function () { closeModal("thankYouModal"); });

    [directionsModal, thankYouModal].forEach(function (overlay) {
      if (!overlay) return;
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) overlay.classList.remove("show");
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (directionsModal && directionsModal.classList.contains("show")) dismissDirections();
        if (thankYouModal && thankYouModal.classList.contains("show")) closeModal("thankYouModal");
      }
    });
  }

  /* ---------------- Review widget ---------------- */
  function setupReviewWidget() {
    var widget = document.getElementById("reviewWidget");
    var toggle = document.getElementById("reviewToggle");
    var stars = document.querySelectorAll("#starRating .star");
    var reviewText = document.getElementById("reviewText");
    var submitBtn = document.getElementById("submitReviewBtn");
    if (!widget || !toggle) return;

    var rating = 0;

    toggle.addEventListener("click", function () {
      var isOpen = widget.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    stars.forEach(function (star) {
      star.addEventListener("click", function () {
        rating = parseInt(star.getAttribute("data-value"), 10);
        stars.forEach(function (s) {
          s.classList.toggle("active", parseInt(s.getAttribute("data-value"), 10) <= rating);
        });
      });
    });

    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        // No backend is wired up here — this simply acknowledges the feedback.
        widget.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        openModal("thankYouModal");

        // reset for next time
        rating = 0;
        stars.forEach(function (s) { s.classList.remove("active"); });
        if (reviewText) reviewText.value = "";
      });
    }
  }

  /* ---------------- CRT boot flash cleanup ---------------- */
  function cleanupBoot() {
    var boot = document.getElementById("crtBoot");
    if (!boot) return;
    boot.addEventListener("animationend", function () {
      boot.remove();
    });
  }

  /* ---------------- Sliding nav indicator ---------------- */
  function setupNavIndicator() {
    var nav = document.getElementById("mainNav");
    var indicator = document.getElementById("navIndicator");
    if (!nav || !indicator) return;
    var active = nav.querySelector(".nav-btn.active") || nav.querySelector(".nav-btn");
    if (!active) return;
    var navRect = nav.getBoundingClientRect();
    var rect = active.getBoundingClientRect();
    indicator.style.left = rect.left - navRect.left + "px";
    indicator.style.width = rect.width + "px";
  }

  /* ---------------- Parallax starfield ---------------- */
  function setupParallaxStars() {
    var stars = document.getElementById("starsLayer");
    if (!stars) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    window.addEventListener("mousemove", function (e) {
      var x = (e.clientX / window.innerWidth - 0.5) * 24;
      var y = (e.clientY / window.innerHeight - 0.5) * 24;
      stars.style.setProperty("--parx", x.toFixed(1) + "px");
      stars.style.setProperty("--pary", y.toFixed(1) + "px");
    });
  }

  /* ---------------- Rising ember particles ---------------- */
  function startEmberField() {
    var field = document.getElementById("emberField");
    if (!field) return;
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    function spawn() {
      var el = document.createElement("div");
      el.className = "ember-particle";
      var left = Math.random() * 100;
      var drift = (Math.random() * 80 - 40).toFixed(0) + "px";
      var duration = (4 + Math.random() * 4).toFixed(2) + "s";
      var delay = (Math.random() * 0.4).toFixed(2) + "s";
      el.style.left = left + "vw";
      el.style.setProperty("--drift", drift);
      el.style.animationDuration = duration;
      el.style.animationDelay = delay;
      field.appendChild(el);
      el.addEventListener("animationend", function () {
        el.remove();
      });
    }

    setInterval(spawn, 450);
    for (var i = 0; i < 6; i++) setTimeout(spawn, i * 120);
  }

  /* ---------------- Raven flyovers ---------------- */
  function scheduleRaven() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    function fly() {
      var raven = document.createElement("div");
      raven.className = "raven-fly";
      var top = 8 + Math.random() * 22;
      var duration = (7 + Math.random() * 4).toFixed(2) + "s";
      raven.style.setProperty("--fly-top", top + "%");
      raven.style.animationDuration = duration;
      raven.innerHTML =
        '<svg viewBox="0 0 16 10" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M0 5 L6 2 L8 5 L10 2 L16 5 L10 6 L8 8 L6 6 Z" fill="#11121a"/>' +
        "</svg>";
      document.body.appendChild(raven);
      raven.addEventListener("animationend", function () {
        raven.remove();
      });
    }

    (function loop() {
      var delay = 9000 + Math.random() * 14000;
      setTimeout(function () {
        fly();
        loop();
      }, delay);
    })();
  }

  /* ---------------- Title glitch flicker ---------------- */
  function setupTitleGlitch() {
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    document.querySelectorAll("h1.title").forEach(function (title) {
      (function loop() {
        var delay = 8000 + Math.random() * 7000;
        setTimeout(function () {
          title.classList.add("glitch");
          setTimeout(function () {
            title.classList.remove("glitch");
          }, 400);
          loop();
        }, delay);
      })();
    });
  }

  /* ---------------- Toast notifications ---------------- */
  function showToast(title, message) {
    var container = document.getElementById("toastContainer");
    if (!container) return;
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = '<span class="toast-title">' + title + "</span>" + message;
    container.appendChild(t);
    requestAnimationFrame(function () {
      t.classList.add("show");
    });
    setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () {
        t.remove();
      }, 400);
    }, 3200);
  }

  /* ---------------- Wax shard burst ---------------- */
  function spawnShards(originEl) {
    var rect = originEl.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    for (var i = 0; i < 10; i++) {
      var shard = document.createElement("div");
      shard.className = "wax-shard";
      var angle = Math.random() * Math.PI * 2;
      var dist = 40 + Math.random() * 60;
      shard.style.left = cx + "px";
      shard.style.top = cy + "px";
      shard.style.setProperty("--dx", Math.cos(angle) * dist + "px");
      shard.style.setProperty("--dy", Math.sin(angle) * dist + "px");
      shard.style.setProperty("--rot", Math.random() * 360 + "deg");
      document.body.appendChild(shard);
      shard.addEventListener("animationend", function () {
        this.remove();
      });
    }
  }

  /* ---------------- Home page: seal-breaking extras ---------------- */
  function setupSealExtras() {
    var sealBtn = document.getElementById("sealBtn");
    if (!sealBtn) return;
    sealBtn.addEventListener("click", function () {
      if (sealBtn.classList.contains("broken")) return;
      spawnShards(sealBtn);
      setTimeout(function () {
        showToast("RAVEN DELIVERED", "The wax cracks \u2014 the message is yours.");
        var revealScroll = document.querySelector("#homeReveal .scroll-box");
        if (revealScroll) revealScroll.classList.add("unrolling");
      }, 140);
    });
  }

  /* ---------------- Scriptorium: feedback extras ---------------- */
  function setupScriptoriumExtras() {
    var runBtn = document.getElementById("runBtn");
    var copyBtn = document.getElementById("copyBtn");
    var downloadBtn = document.getElementById("downloadBtn");
    var fileInput = document.getElementById("fileInput");
    var outputText = document.getElementById("outputText");
    var modeEncodeBtn = document.getElementById("modeEncode");

    if (runBtn) {
      runBtn.addEventListener("click", function () {
        var sealing = modeEncodeBtn && modeEncodeBtn.classList.contains("active");
        setTimeout(function () {
          showToast("SPELL CAST", sealing ? "Your scroll has been sealed." : "Your scroll has been unsealed.");
          if (outputText) {
            outputText.classList.remove("flash-glow");
            // force reflow so the animation can retrigger
            void outputText.offsetWidth;
            outputText.classList.add("flash-glow");
          }
        }, 50);
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (outputText && outputText.value) {
          showToast("COPIED", "The scroll's words wait on your clipboard.");
        }
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", function () {
        if (outputText && outputText.value) {
          showToast("SCROLL SAVED", "Your file has begun its journey down.");
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", function (e) {
        var file = e.target.files && e.target.files[0];
        if (file) {
          showToast("SCROLL LOADED", file.name);
        }
      });
    }
  }
})();
