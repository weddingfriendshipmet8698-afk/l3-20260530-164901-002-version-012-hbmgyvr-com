(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var button = box.querySelector('[data-play-button]');
    if (!video || !button) return;
    var stream = video.getAttribute('data-stream');
    var ready = false;
    var start = function () {
      if (!stream) return;
      if (!ready) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          video.hlsPlayer = hls;
        } else {
          video.src = stream;
        }
        ready = true;
      }
      box.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!ready) start();
    });
  });
})();
