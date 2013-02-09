define ['underscore'], (_)->

  baseUrl = 'https://gdata.youtube.com/feeds/'
  youTubeIdRegEx = /[^\/]+$/

  channelVideoId = (video)->
    video.id.$t.match(youTubeIdRegEx)[0]

  playlistVideoId = (video)->
    video.media$group.yt$videoid.$t


  queryYouTube: (url, data = {})->
    defaultData = alt : 'json'
    data = _.extend defaultData, data

    $.ajax
      dataType : 'JSONP'
      url      : baseUrl + url
      data     : data

  searchChannels: (query)->
    @queryYouTube 'api/channels',
      q             : query
      v             : 2
      'max-results' : 10

  getPlaylistsByChannel: (channelId)->
    @queryYouTube "api/users/#{channelId}/playlists"

  getVideosByChannel: (channelId)->
    @queryYouTube "users/#{channelId}/uploads"

  getVideosByPlaylist: (playlist)->
    @queryYouTube "api/playlists/#{playlist.playlistId}",
      v             : 2
      orderby       : 'published'
      # 'start-index' : if playlist.count > 24 then playlist.count - 24 else 1

  # getChannelInfo: (channelId)->
  #   @queryYouTube "api/channels/#{channelId}", v : 2

  getVideoCount: (results)->
    results.feed.openSearch$totalResults.$t

  mapChannelDetails: (entry)->
    channelId : entry.yt$channelId.$t
    title     : entry.title.$t
    author    : entry.author[0].name.$t
    thumb     : entry.media$thumbnail[0].url

  mapPlaylistDetails: (playlist)->
    playlistId : playlist.yt$playlistId.$t
    title      : playlist.title.$t
    thumb      : playlist.media$group.media$thumbnail[0].url
    count      : playlist.gd$feedLink[0].countHint

  mapVideoDetails: (video, type)->
    videoId = if type is 'channel'
      channelVideoId video
    else
      playlistVideoId video

    videoId   : videoId
    title     : video.title.$t
    published : video.published.$t
    updated   : video.updated.$t
    thumb     : video.media$group.media$thumbnail[0].url
    duration  : video.media$group.yt$duration.seconds
