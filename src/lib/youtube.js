import _ from 'lodash'
import req from 'reqwest'
import { getItem } from './local-data'
import authStore from '../login/auth-store'
import RSVP, { Promise } from 'rsvp'

const RESULTS_PER_PAGE = 25

function getBaseUrl () {
  return getItem('youtubeBaseUrl').then((baseUrl) => {
    return baseUrl || 'https://www.googleapis.com/youtube/v3/'
  })
}

function queryYouTube (url, data) {
  return Promise.all([getBaseUrl(), authStore.getApiKey()])
    .then(_.spread((baseUrl, apiKey) => {
      return req({
        url: `${baseUrl}${url}`,
        data: _.extend({ key: apiKey }, data),
      })
    }))
}

function mapChannelDetails (result) {
  return _.map(result.items, (item) => {
    return {
      id: item.id.channelId,
      title: item.snippet.channelTitle,
      author: item.snippet.title,
      thumb: item.snippet.thumbnails.medium.url,
    }
  })
}

function videoIdsFromContentDetails (videos) {
  return _(videos).map('contentDetails').map('videoId').value()
}

function videoIdsFromId (videos) {
  return _(videos).map('id').map('videoId').value()
}

function mapVideoDetails (result) {
  return _.map(result.items, (video) => {
    return {
      id: video.id,
      channelId: video.snippet.channelId,
      title: video.snippet.title,
      description: video.snippet.description,
      published: video.snippet.publishedAt,
      thumb: video.snippet.thumbnails.medium.url,
      duration: video.contentDetails.duration,
    }
  })
}

function getVideos (ids) {
  return queryYouTube('videos', {
    id: ids.join(),
    part: 'snippet,contentDetails',
  }).then(mapVideoDetails)
}

function checkApiKey (apiKey) {
  const params = { key: apiKey, part: 'id', channelId: 'UCJTWU5K7kl9EE109HBeoldA' }
  return queryYouTube('activities', params)
    .then(() => true)
    .catch(() => false)
}

function searchChannels (query) {
  return queryYouTube('search', {
    q: query,
    part: 'snippet',
    type: 'channel',
    maxResults: 10,
  }).then(mapChannelDetails)
}

function getVideosDataForChannelSearch (channelId, query, pageToken) {
  const params = {
    channelId,
    maxResults: RESULTS_PER_PAGE,
    order: 'date',
    part: 'snippet',
    q: query,
  }
  if (pageToken) params.pageToken = pageToken

  return queryYouTube('search', params)
    .then(({ items, prevPageToken, nextPageToken }) => {
      // there seems to be a bug with the youtube api where it returns
      // a nextPageToken even if there are no more results after this page
      if (items.length < RESULTS_PER_PAGE) nextPageToken = undefined

      return getVideos(videoIdsFromId(items)).then((videos) => {
        return { videos, prevPageToken, nextPageToken }
      })
    })
}

function getVideosDataForPlaylist (playlistId, pageToken, maxResults = RESULTS_PER_PAGE) {
  const params = {
    playlistId,
    part: 'snippet,contentDetails',
    maxResults,
  }
  if (pageToken) params.pageToken = pageToken

  return queryYouTube('playlistItems', params)
    .then(({ items, prevPageToken, nextPageToken }) => {
      // there seems to be a bug with the youtube api where it returns
      // a nextPageToken even if there are no more results after this page
      if (items.length < RESULTS_PER_PAGE) nextPageToken = undefined

      return getVideos(videoIdsFromContentDetails(items)).then((videos) => {
        return { videos, prevPageToken, nextPageToken }
      })
    })
}

function getVideosDataForAllPlaylists (playlistIds) {
  const getVideos = _.map(playlistIds, (playlistId) => {
    return getVideosDataForPlaylist(playlistId, null, RESULTS_PER_PAGE - 10)
  })

  return RSVP.Promise.all(getVideos)
  .then((playlists) => _.flatMap(playlists, 'videos'))
}

function getPlaylistIdForChannel (channelId) {
  return queryYouTube('channels', {
    id: channelId,
    part: 'contentDetails',
  }).then((result) => result.items[0].contentDetails.relatedPlaylists.uploads)
}

export default {
  checkApiKey,
  searchChannels,
  getVideosDataForChannelSearch,
  getVideosDataForPlaylist,
  getVideosDataForAllPlaylists,
  getPlaylistIdForChannel,
  getVideos,
}
