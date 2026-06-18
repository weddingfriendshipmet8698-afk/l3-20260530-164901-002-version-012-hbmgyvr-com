(function() {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    var show = function(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    var start = function() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5000);
    };

    var restart = function() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    start();
  }

  var searchInput = document.querySelector("[data-search-input]");
  var typeFilter = document.querySelector("[data-type-filter]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var noResult = document.querySelector("[data-no-result]");
  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));

  var normalize = function(value) {
    return String(value || "").trim().toLowerCase();
  };

  var yearMatches = function(cardYear, filterValue) {
    if (!filterValue) {
      return true;
    }

    var year = Number(cardYear || 0);

    if (filterValue === "2020s") {
      return year >= 2020 && year <= 2029;
    }

    if (filterValue === "2010s") {
      return year >= 2010 && year <= 2019;
    }

    return String(year) === filterValue;
  };

  var applyFilters = function() {
    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput ? searchInput.value : "");
    var type = normalize(typeFilter ? typeFilter.value : "");
    var year = yearFilter ? yearFilter.value : "";
    var visible = 0;

    cards.forEach(function(card) {
      var text = normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre")
      ].join(" "));
      var cardType = normalize(card.getAttribute("data-type"));
      var cardYear = card.getAttribute("data-year");
      var matched = (!keyword || text.indexOf(keyword) !== -1) &&
        (!type || cardType === type) &&
        yearMatches(cardYear, year);

      card.classList.toggle("is-hidden", !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (noResult) {
      noResult.classList.toggle("is-visible", visible === 0);
    }
  };

  [searchInput, typeFilter, yearFilter].forEach(function(control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });
})();

function bindMoviePlayer(videoId, buttonId, sourceUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var hlsInstance = null;
  var loaded = false;

  if (!video || !button || !sourceUrl) {
    return;
  }

  var hideButton = function() {
    button.classList.add("is-hidden");
  };

  var showButton = function() {
    button.classList.remove("is-hidden");
  };

  var playVideo = function() {
    hideButton();
    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function() {
        showButton();
      });
    }
  };

  var loadNative = function() {
    video.src = sourceUrl;
    video.load();
    playVideo();
  };

  var loadHls = function() {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hlsInstance.loadSource(sourceUrl);
    hlsInstance.attachMedia(video);
    video.__hls = hlsInstance;
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function() {
      playVideo();
    });
  };

  var start = function() {
    if (!loaded) {
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        loadNative();
      } else if (window.Hls && Hls.isSupported()) {
        loadHls();
      } else {
        loadNative();
      }
    } else {
      playVideo();
    }
  };

  button.addEventListener("click", start);
  video.addEventListener("click", function() {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener("play", hideButton);
  video.addEventListener("pause", showButton);
}
