(function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 6500);
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim().toLowerCase();
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
  var yearSelects = Array.prototype.slice.call(document.querySelectorAll("[data-year-filter]"));
  var typeSelects = Array.prototype.slice.call(document.querySelectorAll("[data-type-filter]"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var emptyState = document.querySelector(".empty-state");

  searchInputs.forEach(function (input) {
    if (query && input.value === "") {
      input.value = query;
    }
  });

  function activeValue(elements) {
    var found = "";
    elements.forEach(function (element) {
      if (element.value) {
        found = element.value;
      }
    });
    return found;
  }

  function applyFilter() {
    var keyword = "";

    searchInputs.forEach(function (input) {
      if (input.value.trim()) {
        keyword = input.value.trim().toLowerCase();
      }
    });

    var year = activeValue(yearSelects);
    var type = activeValue(typeSelects);
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute("data-search") || "";
      var cardYear = card.getAttribute("data-year") || "";
      var cardType = card.getAttribute("data-type") || "";
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? "" : "none";

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  searchInputs.concat(yearSelects).concat(typeSelects).forEach(function (element) {
    element.addEventListener("input", applyFilter);
    element.addEventListener("change", applyFilter);
  });

  if (cards.length) {
    applyFilter();
  }
})();
