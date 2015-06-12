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
    return this._getSubs().then(subs => subs.get(id));
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
      return playlist.merge(Immutable.Map({
        custom: true,
        id: `custom-${id}`,
        playlistId: `playlist-${id}`,
        videos: Immutable.Map()
      }))
    });
  }

  addVideoToPlaylist (playlist, videoId) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      subs = subs.updateIn([playlist.get('id'), 'videos'], (videos) => {
        return videos.set(videoId, Immutable.Map({
          id: videoId,
          order: this._newOrder(videos)
        }));
      });
      return this._setSubs(subs);
    });
  }

  removeVideoFromPlaylist (playlist, videoId) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      return this._setSubs(subs.removeIn([playlist.get('id'), 'videos', videoId]));
    });
  }

  _addSub (sub, transform) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      if (transform) sub = transform(subs);
      const id = sub.get('id');
      subs = subs.set(id, sub.set('order', this._newOrder(subs)));
      return this._setSubs(subs).then(() => subs.get(id) );
    });
  }

  update (sub) {
    return this._getSubs().then((subs = Immutable.Map()) => {
      return this._setSubs(subs.set(sub.get('id'), sub));
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
    const customIds = subs
      .toList()
      .filter(sub => sub.get('custom'))
      .map(playlist => parseInt(playlist.get('id').match(/\d+/)[0], 10));
    return this._next(customIds);
  }

  _next (items) {
    if (!items.size) return 0;
    return items.max() + 1;
  }
}

export default new SubsService();
