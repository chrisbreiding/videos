define ->

  searchChannels: (query) ->
    $.ajax
      dataType : 'JSONP'
      url      : "https://gdata.youtube.com/feeds/api/channels?v=2&alt=json&max-results=10&q=#{query}"

  getVideosByChannel: (channelId) ->
    $.ajax
      dataType : 'JSONP'
      url      : "http://gdata.youtube.com/feeds/users/#{channelId}/uploads?alt=json"

  getChannelInfo: (channelId) ->
    $.ajax
      dataType : 'JSONP'
      url      : "https://gdata.youtube.com/feeds/api/channels/#{channelId}?v=2&alt=json"

  getPlaylistsByUser: (userId) ->
    $.ajax
      dataType : 'JSONP'
      url      : "https://gdata.youtube.com/feeds/api/users/#{userId}/playlists?v=2"

  mapSubDetails: (entry) ->
    channelId : entry.yt$channelId.$t
    title     : entry.title.$t
    author    : entry.author[0].name.$t
    thumb     : entry.media$thumbnail[0].url

  mapVideoDetails: (video) ->
    youTubeId = /\/([a-zA-Z0-9_-]+)$/
    idMatches = video.id.$t.match(youTubeId)

    videoId   : idMatches[1]
    title     : video.title.$t
    published : video.published.$t
    updated   : video.updated.$t
    thumb     : video.media$group.media$thumbnail[0].url
    duration  : video.media$group.yt$duration
