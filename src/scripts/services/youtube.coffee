BASE_URL = 'https://www.googleapis.com/youtube/v3/'
YOUTUBE_ID_REGEX = /[^\/]+$/
RESULTS_PER_PAGE = 25

queryYouTube = (url, handler, data = {})->
  request = $.ajax
    url: BASE_URL + url
    data: _.extend data, key: localStorage.apiKey

  request.then handler

mapChannelDetails = (result)->
  _.map result.items, (item)->
    id: item.id.channelId
    title: item.snippet.channelTitle
    author: item.snippet.title
    thumb: item.snippet.thumbnails.medium.url

parseVideoDetails = (video, duration)->
  id: video.contentDetails.videoId
  title: video.snippet.title
  description: video.snippet.description
  published: video.snippet.publishedAt
  thumb: video.snippet.thumbnails.medium.url
  duration: duration

mapVideos = (videos, durationResults)->
  durations = _.pluck _.pluck(durationResults, 'contentDetails'), 'duration'
  zipped = _.zip videos, durations
  _.map zipped, (video)->
    parseVideoDetails video[0], video[1]

videoIds = (videos)->
  _.pluck _.pluck(videos, 'contentDetails'), 'videoId'

mapVideoDurations = (extras)->
  (result)->
    videos: mapVideos extras.items, result.items
    prevPageToken: extras.prevPageToken
    nextPageToken: extras.nextPageToken

mapVideoDetails = (result)->
  queryYouTube 'videos', mapVideoDurations(result),
    id: videoIds(result.items).join()
    part: 'contentDetails'

mapPlaylistVideoDetails = (result)->
  _.map result.feed.entry, (video)->
    mapPlaylistVideoDetails video

handlePlaylistId = (result)->
  result.items[0].contentDetails.relatedPlaylists.uploads

App.youTube =

  searchChannels: (query)->
    queryYouTube 'search', mapChannelDetails,
      q: query
      part: 'snippet'
      type: 'channel'
      maxResults: 10

  playlistIdForChannelId: (channelId)->
    queryYouTube 'channels', handlePlaylistId,
      id: channelId
      part: 'contentDetails'

  getVideosByPlaylistId: (playlistId, pageToken)->
    params =
      playlistId: playlistId
      part: 'snippet,contentDetails'
      maxResults: RESULTS_PER_PAGE
    params.pageToken = pageToken if pageToken

    queryYouTube 'playlistItems', mapVideoDetails, params
