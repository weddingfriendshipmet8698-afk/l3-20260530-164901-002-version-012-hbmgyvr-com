(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            document.body.classList.toggle('nav-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterRegion = document.querySelector('[data-filter-region]');
    var filterType = document.querySelector('[data-filter-type]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!filterCards.length) {
            return;
        }

        var keyword = normalize(filterInput && filterInput.value);
        var region = filterRegion ? filterRegion.value : '';
        var type = filterType ? filterType.value : '';
        var visible = 0;

        filterCards.forEach(function (card) {
            var haystack = normalize((card.dataset.title || '') + ' ' + (card.dataset.meta || ''));
            var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchRegion = !region || card.dataset.region === region;
            var matchType = !type || card.dataset.type === type;
            var show = matchKeyword && matchRegion && matchType;

            card.classList.toggle('is-hidden', !show);
            if (show) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    [filterInput, filterRegion, filterType].forEach(function (field) {
        if (field) {
            field.addEventListener('input', applyFilters);
            field.addEventListener('change', applyFilters);
        }
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('button');
        var stream = video ? video.getAttribute('data-stream') : '';
        var loaded = false;
        var hlsInstance = null;

        function loadStream() {
            if (!video || !stream || loaded) {
                return;
            }

            loaded = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
        }

        function playStream() {
            loadStream();
            shell.classList.add('is-playing');
            shell.classList.add('has-played');

            if (video) {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        shell.classList.remove('is-playing');
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                playStream();
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            playStream();
        });

        if (video) {
            video.addEventListener('play', function () {
                shell.classList.add('is-playing');
                shell.classList.add('has-played');
            });

            video.addEventListener('pause', function () {
                shell.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
