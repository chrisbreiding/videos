import _ from 'lodash';
import req from 'reqwest';

const baseUrl = 'https://www.googleapis.com/youtube/v3/';

function queryYouTube (url, data) {
  return req({
    url: `${baseUrl}${url}`,
    data: _.extend(data, { key: localStorage.apiKey })
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
  searchChannels (query) {
    return queryYouTube('search', {
      q: query,
      part: 'snippet',
      type: 'channel',
      maxResults: 10
    }).then(mapChannelDetails);
  }
};
