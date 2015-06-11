import _ from 'lodash';
import Immutable from 'immutable';
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
  return Promise.all([getBaseUrl(), loginActions.getApiKey()])
    .then(_.spread((baseUrl, apiKey) => {
      return req({
        url: `${baseUrl}${url}`,
        data: _.extend({ key: apiKey }, data)
      });
    }));
}

function mapChannelDetails (result) {
  return Immutable.List(_.map(result.items, (item) => {
    return Immutable.Map({
      id: item.id.channelId,
      title: item.snippet.channelTitle,
      author: item.snippet.title,
      thumb: item.snippet.thumbnails.medium.url
    });
  }));
}

function videoIds (videos) {
  return _(videos).pluck('contentDetails').pluck('videoId').value();
}

function mapVideoDetails (result) {
  return Immutable.List(_.map(result.items, (video) => {
    return Immutable.Map({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      published: video.snippet.publishedAt,
      thumb: video.snippet.thumbnails.medium.url,
      duration: video.contentDetails.duration
    });
  }));
}

function getVideos (ids) {
  return queryYouTube('videos', {
    id: ids.join(),
    part: 'snippet,contentDetails'
  }).then(mapVideoDetails);
}

class Youtube {
  checkApiKey (apiKey) {
    const params = { key: apiKey, part: 'id', channelId: 'UCJTWU5K7kl9EE109HBeoldA' };
    return queryYouTube('activities', params)
      .then(() => true)
      .catch(() => false);
  }

  searchChannels (query) {
    return queryYouTube('search', {
      q: query,
      part: 'snippet',
      type: 'channel',
      maxResults: 10
    }).then(mapChannelDetails);
  }

  getVideosDataForPlaylist (playlistId, pageToken) {
    const params = {
      playlistId: playlistId,
      part: 'snippet,contentDetails',
      maxResults: RESULTS_PER_PAGE
    };
    if (pageToken) params.pageToken = pageToken;

    return queryYouTube('playlistItems', params)
      .then(({ items, prevPageToken, nextPageToken }) => {
        return getVideos(videoIds(items)).then((videos) => {
          return { videos, prevPageToken, nextPageToken };
        });
      });
  }

  getPlaylistIdForChannel (channelId) {
    return queryYouTube('channels', {
      id: channelId,
      part: 'contentDetails'
    }).then((result) => result.items[0].contentDetails.relatedPlaylists.uploads );
  }

  getVideos (ids) {
    return getVideos(ids);
  }
}

export default new Youtube();
