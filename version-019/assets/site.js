(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }
        function start() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        if (slides.length > 1) {
            start();
        }
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    var searchInput = document.querySelector('[data-page-search]');
    var movieList = document.querySelector('[data-movie-list]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var activeFilter = '全部';

    function applyFilters() {
        if (!movieList) {
            return;
        }
        var keyword = normalize(searchInput ? searchInput.value : '');
        var cards = Array.prototype.slice.call(movieList.children);
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-text') || card.textContent);
            var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchesFilter = activeFilter === '全部' || text.indexOf(normalize(activeFilter)) !== -1;
            card.classList.toggle('is-search-hidden', !(matchesKeyword && matchesFilter));
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || '全部';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });

    if (filterButtons.length) {
        filterButtons[0].classList.add('active');
    }
})();
