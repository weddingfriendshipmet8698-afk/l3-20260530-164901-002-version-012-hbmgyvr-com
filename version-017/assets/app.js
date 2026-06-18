(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupMobileNav() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            toggle.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                schedule();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                schedule();
            });
        }
        show(0);
        schedule();
    }

    function setupFilters() {
        var form = document.querySelector('[data-filter-form]');
        var grid = document.querySelector('[data-card-grid]');
        if (!form || !grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
        var queryInput = form.querySelector('[data-filter-query]');
        var categorySelect = form.querySelector('[data-filter-category]');
        var typeSelect = form.querySelector('[data-filter-type]');
        var yearSelect = form.querySelector('[data-filter-year]');
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        if (queryInput && params.get('q')) {
            queryInput.value = params.get('q');
        }

        function matchesYear(cardYear, filterYear) {
            if (!filterYear) {
                return true;
            }
            var year = Number(cardYear);
            if (filterYear === 'older') {
                return year < 2022;
            }
            return String(year) === filterYear;
        }

        function apply() {
            var query = normalize(queryInput ? queryInput.value : '');
            var category = normalize(categorySelect ? categorySelect.value : '');
            var type = normalize(typeSelect ? typeSelect.value : '');
            var year = yearSelect ? yearSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var ok = true;
                if (query && haystack.indexOf(query) === -1) {
                    ok = false;
                }
                if (category && normalize(card.getAttribute('data-category')) !== category) {
                    ok = false;
                }
                if (type && normalize(card.getAttribute('data-type')) !== type) {
                    ok = false;
                }
                if (!matchesYear(card.getAttribute('data-year'), year)) {
                    ok = false;
                }
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visible === 0);
            }
        }

        [queryInput, categorySelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        var videos = Array.prototype.slice.call(document.querySelectorAll('video[data-m3u8]'));
        videos.forEach(function (video) {
            var shell = video.closest('[data-player-shell]');
            var button = shell ? shell.querySelector('[data-player-button]') : null;
            var status = shell ? shell.querySelector('[data-player-status]') : null;
            var source = video.getAttribute('data-m3u8');
            var hls = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message || '';
                    status.classList.toggle('is-visible', Boolean(message));
                }
            }

            if (source) {
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus('');
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            setStatus('网络连接异常，正在重新加载播放源');
                            hls.startLoad();
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            setStatus('媒体解析异常，正在恢复播放');
                            hls.recoverMediaError();
                            return;
                        }
                        setStatus('播放暂时不可用，请稍后刷新页面');
                    });
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    setStatus('当前浏览器不支持 HLS 播放');
                }
            }

            if (button) {
                button.addEventListener('click', function () {
                    if (shell) {
                        shell.classList.add('is-loading');
                    }
                    video.play().then(function () {
                        if (shell) {
                            shell.classList.add('is-playing');
                            shell.classList.remove('is-loading');
                        }
                    }).catch(function () {
                        if (shell) {
                            shell.classList.remove('is-loading');
                        }
                        setStatus('点击播放器控制条可再次尝试播放');
                    });
                });
            }

            video.addEventListener('play', function () {
                if (shell) {
                    shell.classList.add('is-playing');
                    shell.classList.remove('is-loading');
                }
            });
            video.addEventListener('pause', function () {
                if (shell) {
                    shell.classList.remove('is-playing');
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
