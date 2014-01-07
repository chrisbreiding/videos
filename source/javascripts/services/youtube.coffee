baseUrl = 'https://gdata.youtube.com/feeds/'
youTubeIdRegEx = /[^\/]+$/

queryYouTube = (url, handler, data = {})->
  defaultData = alt: 'json'
  data = _.extend defaultData, data

  request = $.ajax
    dataType: 'JSONP'
    url: baseUrl + url
    data: data

  request.then handler

channelVideoId = (video)->
  video.id.$t.match(youTubeIdRegEx)[0]

playlistVideoId = (video)->
  video.media$group.yt$videoid.$t

mapChannelDetails = (result)->
  result.feed.entry.map (channel)->
    id: channel.yt$channelId.$t
    title: channel.title.$t
    author: channel.author[0].name.$t
    thumb: channel.media$thumbnail[0].url

mapPlaylistDetails = (playlist)->
  id: playlist.yt$playlistId.$t
  title: playlist.title.$t
  thumb: playlist.media$group.media$thumbnail[0].url
  count: playlist.gd$feedLink[0].countHint

parseVideoDetails = (video, type)->
  videoId = if type is 'channel'
    channelVideoId video
  else
    playlistVideoId video

  id: videoId
  title: video.title.$t
  description: video.media$group.media$description.$t
  published: video.published.$t
  updated: video.updated.$t
  thumb: video.media$group.media$thumbnail[0].url
  duration: video.media$group.yt$duration.seconds

parsePlaylistVideoDetails = (result)->
  parseVideoDetails result.entry, 'playlist'

mapChannelVideoDetails = (result)->
  result.feed.entry.map (video)->
    parseVideoDetails video, 'channel'

mapPlaylistVideoDetails = (result)->
  result.feed.entry.map (video)->
    mapPlaylistVideoDetails video

getVideoCount = (results)->
  results.feed.openSearch$totalResults.$t

App.youTube =

  searchChannels: (query)->
    queryYouTube 'api/channels', mapChannelDetails,
      q: query
      v: 2
      'max-results': 10

  getPlaylistsByChannel: (channelId)->
    queryYouTube "api/users/#{channelId}/playlists", mapPlaylistDetails

  getVideosByChannel: (channelId)->
    queryYouTube "users/#{channelId}/uploads", mapChannelVideoDetails

  getVideoById: (videoId)->
    queryYouTube "api/videos/#{videoId}", parsePlaylistVideoDetails, v: 2

  getVideosByPlaylist: (playlistId, page)->
    query = queryYouTube "api/playlists/#{playlistId}", mapPlaylistVideoDetails,
      v: 2
      orderby: 'published'
      'start-index': (page - 1) * 25 + 1

  # getChannelInfo: (channelId)->
  #   @queryYouTube "api/channels/#{channelId}", v : 2
