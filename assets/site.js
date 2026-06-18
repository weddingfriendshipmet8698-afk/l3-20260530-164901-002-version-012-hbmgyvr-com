
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        window.location.href = './search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === current);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5600);
      }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.querySelector('[data-grid-search]');
    if (searchInput && query) {
      searchInput.value = query;
    }

    var grid = document.querySelector('[data-filter-grid]');
    if (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
      var selects = Array.prototype.slice.call(document.querySelectorAll('[data-grid-select]'));
      var apply = function () {
        var text = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute('data-grid-select')] = select.value;
        });
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-channel'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var okText = !text || haystack.indexOf(text) !== -1;
          var okType = !filters.type || card.getAttribute('data-type') === filters.type;
          var okYear = !filters.year || card.getAttribute('data-year') === filters.year;
          card.classList.toggle('is-hidden-card', !(okText && okType && okYear));
        });
      };
      if (searchInput) {
        searchInput.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      apply();
    }
  });
})();
