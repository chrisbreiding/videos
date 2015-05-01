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

parseVideoDetails = (video)->
  # TODO: determine actual duration
  id: video.contentDetails.videoId
  title: video.snippet.title
  description: video.snippet.description
  published: video.snippet.publishedAt
  thumb: video.snippet.thumbnails.medium.url
  duration: 100

mapChannelVideoDetails = (result)->
  videos: _.map result.items, parseVideoDetails
  prevPageToken: result.prevPageToken
  nextPageToken: result.nextPageToken

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

  getVideosByChannel: (channelId, pageToken)->
    params =
      playlistId: channelId
      part: 'snippet,contentDetails'
      maxResults: RESULTS_PER_PAGE
    params.pageToken = pageToken if pageToken

    queryYouTube 'playlistItems', mapChannelVideoDetails, params
