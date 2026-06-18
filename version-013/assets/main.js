(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var topButton = document.querySelector('[data-back-top]');
  if (topButton) {
    window.addEventListener('scroll', function () {
      topButton.classList.toggle('is-visible', window.scrollY > 520);
    });
    topButton.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
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
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-section]')).forEach(function (panelNode) {
    var scope = panelNode.parentElement || document;
    var keyword = panelNode.querySelector('[data-filter-keyword]');
    var year = panelNode.querySelector('[data-filter-year]');
    var region = panelNode.querySelector('[data-filter-region]');
    var type = panelNode.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var run = function () {
      var q = (keyword && keyword.value || '').trim().toLowerCase();
      var y = year && year.value || '';
      var r = region && region.value || '';
      var t = type && type.value || '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) ok = false;
        if (y && card.getAttribute('data-year') !== y) ok = false;
        if (r && card.getAttribute('data-region') !== r) ok = false;
        if (t && card.getAttribute('data-type') !== t) ok = false;
        card.classList.toggle('is-hidden', !ok);
      });
    };
    [keyword, year, region, type].forEach(function (node) {
      if (node) node.addEventListener('input', run);
      if (node) node.addEventListener('change', run);
    });
  });

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  if (searchForm && searchInput && searchResults && window.SITE_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) searchInput.value = params.get('q');
    var makeCard = function (movie) {
      var article = document.createElement('article');
      article.className = 'movie-card';
      var link = document.createElement('a');
      link.href = movie.url;
      var poster = document.createElement('div');
      poster.className = 'poster-frame';
      var img = document.createElement('img');
      img.src = movie.cover;
      img.alt = movie.title;
      img.loading = 'lazy';
      var year = document.createElement('span');
      year.className = 'poster-year';
      year.textContent = movie.year;
      var score = document.createElement('span');
      score.className = 'poster-score';
      score.textContent = movie.score;
      poster.appendChild(img);
      poster.appendChild(year);
      poster.appendChild(score);
      var body = document.createElement('div');
      body.className = 'movie-card-body';
      var title = document.createElement('h3');
      title.textContent = movie.title;
      var line = document.createElement('p');
      line.textContent = movie.one_line;
      var meta = document.createElement('div');
      meta.className = 'card-meta';
      [movie.region, movie.type, movie.genre].forEach(function (text) {
        var span = document.createElement('span');
        span.textContent = text;
        meta.appendChild(span);
      });
      body.appendChild(title);
      body.appendChild(line);
      body.appendChild(meta);
      link.appendChild(poster);
      link.appendChild(body);
      article.appendChild(link);
      return article;
    };
    var runSearch = function () {
      var q = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = '';
      if (!q) {
        searchResults.classList.remove('is-filled');
        return;
      }
      var matched = window.SITE_MOVIES.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.one_line, movie.year].join(' ').toLowerCase().indexOf(q) !== -1;
      }).slice(0, 96);
      searchResults.classList.add('is-filled');
      if (!matched.length) {
        var empty = document.createElement('div');
        empty.className = 'empty-results';
        empty.textContent = '没有找到匹配影片';
        searchResults.appendChild(empty);
        return;
      }
      var grid = document.createElement('div');
      grid.className = 'movie-grid';
      matched.forEach(function (movie) {
        grid.appendChild(makeCard(movie));
      });
      searchResults.appendChild(grid);
    };
    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var q = searchInput.value.trim();
      var url = q ? 'search.html?q=' + encodeURIComponent(q) : 'search.html';
      window.history.replaceState(null, '', url);
      runSearch();
    });
    runSearch();
  }
})();
