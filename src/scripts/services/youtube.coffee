BASE_URL = 'https://gdata.youtube.com/feeds/'
YOUTUBE_ID_REGEX = /[^\/]+$/
RESULTS_PER_PAGE = 25

queryYouTube = (url, handler, data = {})->
  defaultData = alt: 'json'
  data = _.extend defaultData, data

  request = $.ajax
    dataType: 'JSONP'
    url: BASE_URL + url
    data: data

  request.then handler

channelVideoId = (video)->
  video.id.$t.match(YOUTUBE_ID_REGEX)[0]

playlistVideoId = (video)->
  video.media$group.yt$videoid.$t

mapChannelDetails = (result)->
  _.map result.feed.entry, (channel)->
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
  videos = _.map result.feed.entry, (video)->
    parseVideoDetails video, 'channel'

  videos: videos
  totalPages: Math.ceil(result.feed.openSearch$totalResults.$t / RESULTS_PER_PAGE)

mapPlaylistVideoDetails = (result)->
  _.map result.feed.entry, (video)->
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

  getVideosByChannel: (channelId, page = 1)->
    queryYouTube "users/#{channelId}/uploads", mapChannelVideoDetails,
      orderby: 'published'
      'start-index': (page - 1) * RESULTS_PER_PAGE + 1
      'max-results': RESULTS_PER_PAGE

  getVideoById: (videoId)->
    queryYouTube "api/videos/#{videoId}", parsePlaylistVideoDetails, v: 2

  getVideosByPlaylist: (playlistId, page = 1)->
    query = queryYouTube "api/playlists/#{playlistId}", mapPlaylistVideoDetails,
      v: 2
      orderby: 'published'
      'start-index': (page - 1) * RESULTS_PER_PAGE + 1
      'max-results': RESULTS_PER_PAGE

  # getChannelInfo: (channelId)->
  #   @queryYouTube "api/channels/#{channelId}", v : 2
