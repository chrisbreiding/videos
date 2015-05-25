import _ from 'lodash';
import req from 'reqwest';
import { getItem } from './local-data';
import loginActions from '../login/login-actions';
import { Promise } from 'rsvp';

const RESULTS_PER_PAGE = 25;

function getBaseUrl () {
  return getItem('youtubeBaseUrl').then((baseUrl) => {
    return baseUrl || 'https://www.googleapis.com/youtube/v3/';
  })
}

function queryYouTube (url, data) {
  return Promise.all([getBaseUrl(), loginActions.getApiKey()]).then(_.spread((baseUrl, apiKey) => {
    return req({
      url: `${baseUrl}${url}`,
      data: _.extend({ key: apiKey }, data)
    });
  }));
}

function mapChannelDetails (result) {
  return _.map(result.items, (item) => {
    return {
      id: item.id.channelId,
      title: item.snippet.channelTitle,
      author: item.snippet.title,
      thumb: item.snippet.thumbnails.medium.url
    };
  });
}

function parseVideoDetails (duration, video) {
  return {
    id: video.contentDetails.videoId,
    title: video.snippet.title,
    description: video.snippet.description,
    published: video.snippet.publishedAt,
    thumb: video.snippet.thumbnails.medium.url,
    duration: duration
  };
}

function mapVideos (videos, durationResults) {
  return _(durationResults)
    .pluck('contentDetails')
    .pluck('duration')
    .zip(videos)
    .map(_.spread(parseVideoDetails))
    .value()
}

function videoIds (videos) {
  return _(videos).pluck('contentDetails').pluck('videoId').value();
}

function mapVideoDurations (extras) {
  return (result) => {
    return {
      videos: mapVideos(extras.items, result.items),
      prevPageToken: extras.prevPageToken,
      nextPageToken: extras.nextPageToken
    };
  };
}

function mapVideoDetails (result) {
  return queryYouTube('videos', {
    id: videoIds(result.items).join(),
    part: 'contentDetails'
  }).then(mapVideoDurations(result));
}

export default {
  checkApiKey (apiKey) {
    const params = { key: apiKey, part: 'id', channelId: 'UCJTWU5K7kl9EE109HBeoldA' };
    return queryYouTube('activities', params)
      .then(() => true)
      .catch(() => false);
  },

  searchChannels (query) {
    return queryYouTube('search', {
      q: query,
      part: 'snippet',
      type: 'channel',
      maxResults: 10
    }).then(mapChannelDetails);
  },

  getVideosForPlaylist (playlistId, pageToken) {
    const params = {
      playlistId: playlistId,
      part: 'snippet,contentDetails',
      maxResults: RESULTS_PER_PAGE
    };
    if (pageToken) params.pageToken = pageToken;

    return queryYouTube('playlistItems', params).then(mapVideoDetails);
  },

  getPlaylistIdForChannel (channelId) {
    return queryYouTube('channels', {
      id: channelId,
      part: 'contentDetails'
    }).then((result) => result.items[0].contentDetails.relatedPlaylists.uploads );
  }
};
