// from youtube video page, opens the video in app

//javascript:
(function () {
  const videoId = (window.location.search || '').match(/v=([^&]+)/ || [])[1];
  if (videoId) window.location = `https://videos.crbapps.com/?nowPlaying=${videoId}`;
}());

// javascript:(function () { const videoId = (window.location.search || '').match(/v=([^&]+)/ || [])[1]; if (videoId) window.location = `https://videos.crbapps.com/?nowPlaying=${videoId}`; }());
