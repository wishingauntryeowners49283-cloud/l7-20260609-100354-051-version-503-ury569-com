(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var action = form.getAttribute("action") || "search.html";
      window.location.href = query ? action + "?q=" + encodeURIComponent(query) : action;
    });
  });

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector("[data-search-input]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
  var emptyState = document.querySelector("[data-empty-state]");
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
  var activeFilter = "all";

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : "");
    var visible = 0;

    cards.forEach(function (card) {
      var data = normalize(card.getAttribute("data-search"));
      var matchesQuery = !query || data.indexOf(query) !== -1;
      var matchesFilter = activeFilter === "all" || data.indexOf(normalize(activeFilter)) !== -1;
      var shouldShow = matchesQuery && matchesFilter;

      card.style.display = shouldShow ? "" : "none";

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");

    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    searchInput.addEventListener("input", applyFilters);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      activeFilter = chip.getAttribute("data-filter") || "all";

      chips.forEach(function (item) {
        item.classList.toggle("is-active", item === chip);
      });

      applyFilters();
    });
  });

  applyFilters();
}());

function setupMoviePlayer(videoId, buttonId, overlayId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var overlay = document.getElementById(overlayId);
  var playerReady = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (playerReady) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }

    playerReady = true;
  }

  function startPlayback() {
    attachStream();

    if (overlay) {
      overlay.classList.add("is-hidden");
    }

    video.controls = true;

    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", startPlayback);
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
