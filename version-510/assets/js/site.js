(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      var isHidden = panel.hasAttribute("hidden");
      if (isHidden) {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function play() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });
    slider.addEventListener("mouseenter", function () {
      window.clearInterval(timer);
    });
    slider.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var cards = Array.prototype.slice.call(document.querySelectorAll(form.getAttribute("data-filter-target") || ".movie-card"));
      var empty = document.querySelector(form.getAttribute("data-empty-target") || "");
      var inputs = Array.prototype.slice.call(form.querySelectorAll("input, select"));

      function apply() {
        var query = normalize(form.querySelector("[name='q']") && form.querySelector("[name='q']").value);
        var region = normalize(form.querySelector("[name='region']") && form.querySelector("[name='region']").value);
        var type = normalize(form.querySelector("[name='type']") && form.querySelector("[name='type']").value);
        var year = normalize(form.querySelector("[name='year']") && form.querySelector("[name='year']").value);
        var shown = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-tags"),
            card.textContent
          ].join(" "));
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchRegion = !region || normalize(card.getAttribute("data-region")) === region;
          var matchType = !type || normalize(card.getAttribute("data-type")).indexOf(type) !== -1;
          var matchYear = !year || normalize(card.getAttribute("data-year")) === year;
          var visible = matchQuery && matchRegion && matchType && matchYear;
          card.classList.toggle("hidden-card", !visible);
          if (visible) {
            shown += 1;
          }
        });

        if (empty) {
          empty.style.display = shown ? "none" : "block";
        }
      }

      inputs.forEach(function (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      });

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && form.querySelector("[name='q']")) {
        form.querySelector("[name='q']").value = q;
      }
      apply();
    });
  }

  ready(function () {
    setupMenu();
    setupHeroSlider();
    setupFilters();
  });
})();
