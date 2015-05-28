import _ from 'lodash';
import { SUBS_KEY } from '../lib/constants';
import { getItem, setItem } from '../lib/local-data';
import { searchChannels, getPlaylistIdForChannel } from '../lib/youtube';

export default {
  fetch () {
    return this._getSubs();
  },

  getSub (id) {
    return this._getSubs().then((subs) => subs[id] );
  },

  search (query) {
    return searchChannels(query);
  },

  addChannel (channel) {
    return getPlaylistIdForChannel(channel.id).then((playlistId) => {
      return this._addSub(_.extend(channel, { playlistId }));
    });
  },

  addCustomPlaylist (playlist) {
    return this._addSub(playlist, (subs) => {
      const id = this._newId(subs);
      return _.extend(playlist, {
        custom: true,
        id: `custom-${id}`,
        playlistId: `playlist-${id}`
      })
    });
  },

  _addSub (sub, transform) {
    return this._getSubs().then((subs = {}) => {
      if (transform) sub = transform(subs);
      subs[sub.id] = _.extend(sub, { order: this._newOrder(subs) });
      return this._setSubs(subs).then(() => subs[sub.id] );
    });
  },

  remove (id) {
    return this._getSubs().then((subs = {}) => {
      delete subs[id];
      return this._setSubs(subs);
    });
  },

  _getSubs () {
    return getItem(SUBS_KEY);
  },

  _setSubs (subs) {
    return setItem(SUBS_KEY, subs);
  },

  _newOrder (subs) {
    return this._next(_.map(subs, (sub) => sub.order || 0));
  },

  _newId (subs) {
    const customIds = _(subs)
      .filter((sub) => sub.custom)
      .map((playlist) => parseInt(playlist.id.match(/\d+/)[0], 10))
      .value();
    return this._next(customIds);
  },

  _next (items) {
    if (!items.length) return 0;
    return Math.max.apply(Math, items) + 1;
  }
};
