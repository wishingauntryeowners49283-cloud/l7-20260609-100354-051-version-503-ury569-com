(function () {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            var open = panel.hasAttribute("hidden");
            if (open) {
                panel.removeAttribute("hidden");
                toggle.setAttribute("aria-expanded", "true");
                toggle.textContent = "×";
            } else {
                panel.setAttribute("hidden", "");
                toggle.setAttribute("aria-expanded", "false");
                toggle.textContent = "☰";
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-target]"));
    var heroIndex = 0;

    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === heroIndex);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showHero(Number(dot.getAttribute("data-hero-target")) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    function normalizeText(value) {
        return String(value || "").trim().toLowerCase();
    }

    var liveInputs = Array.prototype.slice.call(document.querySelectorAll("[data-live-search]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));

    function applyFilter(value) {
        var query = normalizeText(value);
        cards.forEach(function (card) {
            var haystack = normalizeText(card.getAttribute("data-search") || card.textContent);
            card.classList.toggle("is-filtered-out", query && haystack.indexOf(query) === -1);
        });
    }

    liveInputs.forEach(function (input) {
        input.addEventListener("input", function () {
            applyFilter(input.value);
        });
    });

    var autoInput = document.querySelector("[data-autofill-query]");
    if (autoInput) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        autoInput.value = q;
        applyFilter(q);
    }
})();

function initMoviePlayer(streamUrl) {
    var video = document.getElementById("movieVideo");
    var cover = document.getElementById("playStart");
    var started = false;
    var attached = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function attach() {
        if (attached) {
            return Promise.resolve();
        }
        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            return new Promise(function (resolve) {
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
            });
        }

        video.src = streamUrl;
        return Promise.resolve();
    }

    function play() {
        if (started && !video.paused) {
            return;
        }
        started = true;
        if (cover) {
            cover.classList.add("is-hidden");
        }
        attach().then(function () {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        });
    }

    if (cover) {
        cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
        if (!started || video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
