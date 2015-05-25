import { spread } from 'lodash';
import { Promise } from 'rsvp';
import { SUBS_KEY } from '../lib/constants';
import { getItem, setItem } from '../lib/local-data';
import { searchChannels, getPlaylistIdForChannel } from '../lib/youtube';

export default {
  fetch () {
    return getItem(SUBS_KEY);
  },

  search (query) {
    return searchChannels(query);
  },

  addChannel (channel) {
    return Promise.all([getPlaylistIdForChannel(channel.id), getItem(SUBS_KEY)])
      .then(spread((playlistId, subs = {}) => {
        channel.playlistId = playlistId;
        channel.order = this._newOrder(subs);
        subs[channel.id] = channel;
        return setItem(SUBS_KEY, subs);
      }));
  },

  removeChannel (channel) {
    return getItem(SUBS_KEY).then((subs = {}) => {
      delete subs[channel.id];
      return setItem(SUBS_KEY, subs);
    });
  },

  _newOrder (subs) {
    var orders = _.map(subs, (sub) => sub.order || 0);
    if (!orders.length) return 0;
    return Math.max.apply(Math, orders) + 1;
  }
};
