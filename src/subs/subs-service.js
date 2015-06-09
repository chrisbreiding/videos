import _ from 'lodash';
import Immutable from 'immutable';
import { SUBS_KEY } from '../lib/constants';
import { getItem, setItem } from '../lib/local-data';
import { searchChannels, getPlaylistIdForChannel } from '../lib/youtube';

class SubsService {
  fetch () {
    return this._getSubs();
  }

  getSub (id) {
    return this._getSubs().then((subs) => subs[id] );
  }

  search (query) {
    return searchChannels(query);
  }

  addChannel (channel) {
    return getPlaylistIdForChannel(channel.get('id')).then((playlistId) => {
      return this._addSub(channel.set('playlistId', playlistId));
    });
  }

  addCustomPlaylist (playlist) {
    return this._addSub(playlist, (subs) => {
      const id = this._newId(subs);
      return _.extend(playlist, {
        custom: true,
        id: `custom-${id}`,
        playlistId: `playlist-${id}`,
        videos: {}
      })
    });
  }

  addVideoToPlaylist (playlist, videoId) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      const sub = subs[playlist.id];
      sub.videos[videoId] = {
        id: videoId,
        order: this._newOrder(sub.videos)
      };
      return this._setSubs(subs);
    });
  }

  removeVideoFromPlaylist (playlist, videoId) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      delete subs[playlist.id].videos[videoId];
      return this._setSubs(subs);
    });
  }

  _addSub (sub, transform) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      const id = sub.get('id');
      if (transform) sub = transform(subs);
      subs = subs.set(id, sub.set('order', this._newOrder(subs)));
      return this._setSubs(subs).then(() => subs.get(id) );
    });
  }

  update (sub) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      subs[sub.id] = sub;
      return this._setSubs(subs);
    });
  }

  remove (id) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      return this._setSubs(subs.remove(id));
    });
  }

  _getSubs () {
    return getItem(SUBS_KEY);
  }

  _setSubs (subs) {
    return setItem(SUBS_KEY, subs);
  }

  _newOrder (items) {
    return this._next(items.map(item => item.order || 0));
  }

  _newId (subs) {
    const customIds = _(subs)
      .filter((sub) => sub.custom)
      .map((playlist) => parseInt(playlist.id.match(/\d+/)[0], 10))
      .value();
    return this._next(customIds);
  }

  _next (items) {
    if (!items.size) return 0;
    return Math.max.apply(Math, items.toArray()) + 1;
  }
}

export default new SubsService();
