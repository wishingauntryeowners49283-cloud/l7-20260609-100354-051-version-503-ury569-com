(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector('.mobile-menu-button');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var willOpen = panel.hasAttribute('hidden');
            if (willOpen) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            button.setAttribute('aria-expanded', String(willOpen));
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = selectAll('.hero-slide', root);
        var dots = selectAll('[data-hero-dot]', root);
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === index;
                slide.classList.toggle('active', active);
                slide.setAttribute('aria-hidden', active ? 'false' : 'true');
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        restart();
    }

    function setupFilters() {
        var filterForms = selectAll('.local-filter');
        filterForms.forEach(function (form) {
            var input = form.querySelector('input[type="search"]');
            var grid = document.querySelector('[data-filterable]');
            var empty = document.querySelector('.empty-message');
            if (!input || !grid) {
                return;
            }
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query) {
                input.value = query;
            }
            var cards = selectAll('[data-search]', grid);
            function apply() {
                var value = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var matched = !value || haystack.indexOf(value) !== -1;
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            input.addEventListener('input', apply);
            apply();
        });
    }

    window.initPlayer = function (address) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playOverlay');
        var shell = document.getElementById('playerShell');
        if (!video || !overlay || !address) {
            return;
        }
        var loaded = false;
        var hls = null;

        function bind() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = address;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(address);
                hls.attachMedia(video);
            } else {
                video.src = address;
            }
        }

        function start() {
            bind();
            overlay.classList.add('is-hidden');
            video.play().catch(function () {
                overlay.classList.remove('is-hidden');
            });
        }

        overlay.addEventListener('click', start);
        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === shell) {
                    start();
                }
            });
        }
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.currentTime) {
                overlay.classList.remove('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
    });
})();
