document.addEventListener("DOMContentLoaded", function () {
  var menuToggle = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");
  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function () {
      mobilePanel.classList.toggle("open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var current = 0;
    var show = function (index) {
      current = index;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show((current + 1) % slides.length);
      }, 5200);
    }
  }

  var localSearch = document.querySelector(".js-card-search");
  if (localSearch) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    localSearch.addEventListener("input", function () {
      var keyword = localSearch.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.dataset.title || "") + " " + (card.dataset.meta || "")).toLowerCase();
        card.style.display = text.indexOf(keyword) === -1 ? "none" : "";
      });
    });
  }

  var resultBox = document.querySelector("[data-search-results]");
  var pageSearch = document.querySelector(".js-site-search");
  if (resultBox && pageSearch && window.SEARCH_INDEX) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    pageSearch.value = initial;
    var render = function () {
      var keyword = pageSearch.value.trim().toLowerCase();
      var list = window.SEARCH_INDEX.filter(function (item) {
        var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.one].join(" ").toLowerCase();
        return keyword ? text.indexOf(keyword) !== -1 : true;
      }).slice(0, 120);
      if (!list.length) {
        resultBox.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
        return;
      }
      resultBox.innerHTML = list.map(function (item) {
        return '<a class="movie-card" href="' + item.url + '">' +
          '<div class="poster-wrap"><img src="' + item.img + '" alt="' + item.title.replace(/"/g, "&quot;") + '" loading="lazy"><span class="play-chip">▶</span></div>' +
          '<div class="movie-card-body"><h2>' + item.title + '</h2>' +
          '<p class="movie-meta">' + item.year + ' · ' + item.region + ' · ' + item.type + '</p>' +
          '<p class="movie-line">' + item.one + '</p>' +
          '<div class="tag-row"><span>' + item.genre + '</span></div></div></a>';
      }).join("");
    };
    pageSearch.addEventListener("input", render);
    render();
  }
});
