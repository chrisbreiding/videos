import _ from 'lodash';
import req from 'reqwest';
import { getItem } from './local-data';
import { getApiKey } from '../login/login-actions';

const baseUrl = 'https://www.googleapis.com/youtube/v3/';

function queryYouTube (url, data) {
  return getApiKey().then((apiKey) => {
    return req({
      url: `${baseUrl}${url}`,
      data: _.extend({ key: apiKey }, data)
    });
  });
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

export default {
  checkApiKey (apiKey) {
    const data = { key: apiKey, part: 'id', channelId: 'UCJTWU5K7kl9EE109HBeoldA' };
    return queryYouTube('activities', data)
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
  }
};
