(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var status = player.querySelector("[data-player-status]");
    var source = player.getAttribute("data-video-url");
    var initialized = false;
    var hls = null;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function initialize() {
      if (!video || !source || initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            setStatus("播放失败，请稍后重试");
          }
        });
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      initialize();
      if (!video) {
        return;
      }
      player.classList.add("is-playing");
      video.controls = true;
      setStatus("正在播放");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          setStatus("点击视频继续播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("pause", function () {
        setStatus("已暂停");
      });
      video.addEventListener("playing", function () {
        player.classList.add("is-playing");
        setStatus("正在播放");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  });
})();
