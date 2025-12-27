// from youtube video page, opens the video in app

//javascript:
(function () {
  const videoId = (window.location.search || '').match(/v=([^&]+)/ || [])[1];
  if (videoId) window.open(`https://videos.crbapps.com/?nowPlaying=${videoId}`, '_blank');
}());

//javascript:(function () { const videoId = (window.location.search || '').match(/v=([^&]+)/ || [])[1]; if (videoId) window.open(`https://videos.crbapps.com/?nowPlaying=${videoId}`, '_blank'); }());

// from youtube video page, add to playlist and redirect to playlist

//javascript:
(function () {
  const videoId = (window.location.search || '').match(/v=([^&]+)/ || [])[1];
  const playlistId = 'custom-10';
  if (videoId) window.open(`https://videos.crbapps.com/add-to-playlist?playlistId=${playlistId}&videoId=${videoId}`, '_blank');
}());

//javascript:(function () { const videoId = (window.location.search || '').match(/v=([^&]+)/ || [])[1]; const playlistId = 'custom-10'; if (videoId) window.open(`https://videos.crbapps.com/add-to-playlist?playlistId=${playlistId}&videoId=${videoId}`, '_blank'); }());
