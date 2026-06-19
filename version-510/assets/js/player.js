(function () {
  function mount(options) {
    var video = document.getElementById(options.videoId);
    var button = document.getElementById(options.buttonId);
    var source = options.source;
    var attached = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return Promise.resolve();
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          window.setTimeout(resolve, 900);
        });
      }
      video.src = source;
      return Promise.resolve();
    }

    function startPlayback() {
      attachSource().then(function () {
        if (button) {
          button.classList.add("is-hidden");
        }
        video.play().catch(function () {
          video.controls = true;
        });
      });
    }

    if (button) {
      button.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });
  }

  window.MoviePlayer = {
    mount: mount
  };
})();
