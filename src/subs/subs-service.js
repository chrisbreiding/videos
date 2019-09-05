import _ from 'lodash'
import { SUBS_KEY } from '../lib/constants'
import { getItem, setItem } from '../lib/local-data'
import { searchChannels, getPlaylistIdForChannel } from '../lib/youtube'

class SubsService {
  fetch () {
    return this._getSubs()
  }

  search (query) {
    return searchChannels(query)
  }

  addChannel (channel) {
    return getPlaylistIdForChannel(channel.id).then((playlistId) => {
      return this._addSub(_.extend(channel, {
        playlistId,
        isCustom: false,
      }))
    })
  }

  addCustomPlaylist (playlist) {
    return this._addSub(playlist, (subs) => {
      const id = this._newId(subs)
      return _.extend(playlist, {
        isCustom: true,
        id: `custom-${id}`,
        playlistId: `playlist-${id}`,
        videos: {},
      })
    })
  }

  addVideoToPlaylist (playlist, videoId) {
    return this._getSubs().then((subs = {}) => {
      const video = {
        id: videoId,
        order: this._newOrder(subs[playlist.id].videos),
      }
      subs[playlist.id].videos[videoId] = video
      return this._setSubs(subs).then(() => video)
    })
  }

  removeVideoFromPlaylist (playlist, videoId) {
    return this._getSubs().then((subs = {}) => {
      subs[playlist.id].videos = _.omit(subs[playlist.id].videos, videoId)
      return this._setSubs(subs)
    })
  }

  _addSub (sub, transform) {
    return this._getSubs().then((subs = {}) => {
      if (transform) sub = transform(subs)
      sub.order = this._newOrder(subs)
      subs[sub.id] = sub
      return this._setSubs(subs).then(() => sub)
    })
  }

  update (sub) {
    return this._getSubs().then((subs = {}) => {
      subs[sub.id] = sub
      return this._setSubs(subs)
    })
  }

  updateAll (subs) {
    return this._setSubs(subs)
  }

  remove (id) {
    return this._getSubs().then((subs = {}) => {
      return this._setSubs(_.omit(subs, id))
    })
  }

  _getSubs () {
    return getItem(SUBS_KEY)
  }

  _setSubs (subs) {
    return setItem(SUBS_KEY, subs)
  }

  _newOrder (items) {
    return this._next(_.map(items, (item) => item.order || 0))
  }

  _newId (subs) {
    const customIds = _(subs)
    .filter((sub) => sub.custom || sub.isCustom)
    .map((playlist) => parseInt(playlist.id.match(/\d+/)[0], 10))
    .value()
    return this._next(customIds)
  }

  _next (items) {
    if (!items.length) return 0
    return _.max(items) + 1
  }
}

export default new SubsService()
