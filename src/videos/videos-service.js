import { getVideosForChannel } from '../lib/youtube';

export default {
  getVideosForChannel (channelId, pageToken) {
    return getVideosForChannel(channelId, pageToken);
  }
};
