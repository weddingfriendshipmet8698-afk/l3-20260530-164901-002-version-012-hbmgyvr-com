(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var panel = document.querySelector("[data-mobile-panel]");
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        start();
      });
    });

    showSlide(0);
    start();
  }

  var filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var keywordInput = filterPanel.querySelector("[data-filter-keyword]");
    var yearSelect = filterPanel.querySelector("[data-filter-year]");
    var regionSelect = filterPanel.querySelector("[data-filter-region]");
    var typeSelect = filterPanel.querySelector("[data-filter-type]");
    var resetButton = filterPanel.querySelector("[data-filter-reset]");
    var empty = document.querySelector("[data-filter-empty]");

    function normalized(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilters() {
      var keyword = normalized(keywordInput && keywordInput.value);
      var year = yearSelect ? yearSelect.value : "";
      var region = regionSelect ? regionSelect.value : "";
      var type = typeSelect ? typeSelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalized(card.getAttribute("data-search"));
        var title = normalized(card.getAttribute("data-title"));
        var matchKeyword = !keyword || text.indexOf(keyword) !== -1 || title.indexOf(keyword) !== -1;
        var matchYear = !year || card.getAttribute("data-year") === year;
        var matchRegion = !region || card.getAttribute("data-region") === region;
        var matchType = !type || card.getAttribute("data-type") === type;
        var isVisible = matchKeyword && matchYear && matchRegion && matchType;
        card.style.display = isVisible ? "" : "none";
        if (isVisible) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilters);
        control.addEventListener("change", applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (keywordInput) {
          keywordInput.value = "";
        }
        if (yearSelect) {
          yearSelect.value = "";
        }
        if (regionSelect) {
          regionSelect.value = "";
        }
        if (typeSelect) {
          typeSelect.value = "";
        }
        applyFilters();
      });
    }

    applyFilters();
  }

  var searchMount = document.querySelector("[data-search-results]");
  var searchForm = document.querySelector("[data-search-page-form]");
  var searchInput = document.querySelector("[data-search-page-input]");
  if (searchMount && typeof catalogItems !== "undefined") {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function cardTemplate(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-wrap" href="' + escapeHtml(item.href) + '">',
        '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '    <span class="type-badge">' + escapeHtml(item.type) + '</span>',
        '    <span class="year-badge">' + escapeHtml(item.year) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <h3><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="movie-meta-row">',
        '      <span>' + escapeHtml(item.region) + '</span>',
        '      <span>' + escapeHtml(item.genre) + '</span>',
        '    </div>',
        '  </div>',
        '</article>'
      ].join("");
    }

    function runSearch(query) {
      var q = String(query || "").toLowerCase().trim();
      var items = catalogItems;
      if (q) {
        items = catalogItems.filter(function (item) {
          return item.search.indexOf(q) !== -1;
        });
      } else {
        items = catalogItems.slice(0, 48);
      }
      var limited = items.slice(0, 120);
      searchMount.innerHTML = limited.map(cardTemplate).join("");
      var empty = document.querySelector("[data-search-empty]");
      if (empty) {
        empty.classList.toggle("is-visible", limited.length === 0);
      }
    }

    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var value = searchInput ? searchInput.value : "";
        var nextUrl = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
        window.history.replaceState(null, "", nextUrl);
        runSearch(value);
      });
    }

    runSearch(initialQuery);
  }
})();
