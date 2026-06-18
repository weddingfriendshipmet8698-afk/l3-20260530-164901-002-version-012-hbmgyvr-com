(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var bgs = Array.prototype.slice.call(root.querySelectorAll('[data-hero-bg]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      bgs.forEach(function (bg, i) {
        bg.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function initFilters() {
    var bar = document.querySelector('[data-filter-bar]');
    if (!bar) {
      return;
    }

    var input = bar.querySelector('[data-filter-input]');
    var region = bar.querySelector('[data-region-select]');
    var year = bar.querySelector('[data-year-select]');
    var category = bar.querySelector('[data-category-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    function lower(value) {
      return String(value || '').toLowerCase();
    }

    function filter() {
      var q = lower(input && input.value).trim();
      var r = region ? region.value : '';
      var y = year ? year.value : '';
      var c = category ? category.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = lower(card.getAttribute('data-search'));
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (r && card.getAttribute('data-region') !== r) {
          ok = false;
        }
        if (y && card.getAttribute('data-year') !== y) {
          ok = false;
        }
        if (c && card.getAttribute('data-category') !== c) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });

    filter();
  }

  function initPlayer() {
    var panel = document.querySelector('[data-player]');
    if (!panel) {
      return;
    }

    var video = panel.querySelector('video');
    var trigger = panel.querySelector('[data-play-trigger]');
    var stream = panel.getAttribute('data-stream');
    var instance = null;
    var ready = false;
    var loading = false;
    var queued = false;

    function start() {
      panel.classList.add('is-playing');
      video.controls = true;
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {
          panel.classList.remove('is-playing');
        });
      }
    }

    function load(callback) {
      if (!video || !stream) {
        return;
      }

      if (ready) {
        callback();
        return;
      }

      if (loading) {
        queued = true;
        return;
      }

      loading = true;
      queued = true;

      function finish() {
        ready = true;
        loading = false;
        if (queued) {
          queued = false;
          callback();
        }
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        finish();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        instance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          instance.loadSource(stream);
        });
        instance.on(window.Hls.Events.MANIFEST_PARSED, finish);
        instance.attachMedia(video);
        return;
      }

      video.src = stream;
      finish();
    }

    function play(event) {
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      load(start);
    }

    if (trigger && video) {
      trigger.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (instance) {
        instance.destroy();
      }
    });
  }

  initHero();
  initFilters();
  initPlayer();
})();
