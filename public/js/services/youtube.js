(function() {

  define(function() {
    return {
      searchChannels: function(query) {
        return $.ajax({
          dataType: 'JSONP',
          url: "https://gdata.youtube.com/feeds/api/channels?v=2&alt=json&max-results=10&q=" + query
        });
      },
      getVideosByChannel: function(channelId) {
        return $.ajax({
          dataType: 'JSONP',
          url: "http://gdata.youtube.com/feeds/users/" + channelId + "/uploads?alt=json"
        });
      },
      getChannelInfo: function(channelId) {
        return $.ajax({
          dataType: 'JSONP',
          url: "https://gdata.youtube.com/feeds/api/channels/" + channelId + "?v=2&alt=json"
        });
      },
      getPlaylistsByUser: function(userId) {
        return $.ajax({
          dataType: 'JSONP',
          url: "https://gdata.youtube.com/feeds/api/users/" + userId + "/playlists?v=2"
        });
      },
      mapSubDetails: function(entry) {
        return {
          channelId: entry.yt$channelId.$t,
          title: entry.title.$t,
          author: entry.author[0].name.$t,
          thumb: entry.media$thumbnail[0].url
        };
      },
      mapVideoDetails: function(video) {
        var idMatches, youTubeId;
        youTubeId = /\/([a-zA-Z0-9_-]+)$/;
        idMatches = video.id.$t.match(youTubeId);
        return {
          videoId: idMatches[1],
          title: video.title.$t,
          published: video.published.$t,
          updated: video.updated.$t,
          thumb: this.betterThumbnail(video),
          duration: video.media$group.yt$duration.seconds
        };
      },
      betterThumbnail: function(video) {
        return video.media$group.media$thumbnail[0].url.replace('0.jpg', 'mqdefault.jpg');
      }
    };
  });

}).call(this);
