(function () {
    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function setupMobileNav() {
        var toggle = document.querySelector(".nav-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = nav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = selectAll(".hero-slide", hero);
        var dots = selectAll("[data-hero-dot]", hero);
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        selectAll(".filter-panel").forEach(function (panel) {
            var targetSelector = panel.getAttribute("data-target");
            var target = targetSelector ? document.querySelector(targetSelector) : null;
            if (!target) {
                return;
            }
            var cards = selectAll("[data-card]", target);
            var search = panel.querySelector("[data-filter-search]");
            var type = panel.querySelector("[data-filter-type]");
            var year = panel.querySelector("[data-filter-year]");

            function run() {
                var query = search ? search.value.trim().toLowerCase() : "";
                var selectedType = type ? type.value : "";
                var selectedYear = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-type") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();
                    var typeValue = card.getAttribute("data-type") || "";
                    var yearValue = card.getAttribute("data-year") || "";
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (selectedType && typeValue !== selectedType) {
                        matched = false;
                    }
                    if (selectedYear && yearValue !== selectedYear) {
                        matched = false;
                    }
                    card.classList.toggle("is-filter-hidden", !matched);
                });
            }

            [search, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", run);
                    control.addEventListener("change", run);
                }
            });
        });
    }

    window.initializeMoviePlayer = function (options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var source = options.source;
        if (!video || !source) {
            return;
        }
        var attached = false;
        var hls = null;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                return;
            }
            video.src = source;
            video.load();
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileNav();
        setupHero();
        setupFilters();
    });
})();
