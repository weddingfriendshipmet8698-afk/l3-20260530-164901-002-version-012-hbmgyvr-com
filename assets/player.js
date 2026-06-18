
function initPlayer(src) {
  var video = document.getElementById('movie-video');
  var button = document.getElementById('player-start');
  var cover = document.querySelector('.player-cover');
  var loaded = false;

  function attach() {
    if (!video || loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({ enableWorker: true });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }
  }

  function start() {
    attach();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    if (video) {
      var attempt = video.play();
      if (attempt && attempt.catch) {
        attempt.catch(function () {});
      }
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      start();
    });
  }
  if (cover) {
    cover.addEventListener('click', start);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
}
