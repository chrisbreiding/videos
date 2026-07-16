import _ from 'lodash'
import { action, computed, makeObservable, observable, values } from 'mobx'

import { SubModel } from '../sub/sub-model'
import { removeSub, removeVideoFromSub, update } from '../lib/remote-data'
import { convertMapEntriesToObject, transformObject } from '../lib/util'
import { getPlaylistIdForChannel, searchChannels } from '../lib/youtube'

class SubsStore {
  _subs = observable.map()
  searchResults = []
  isLoading = true

  constructor () {
    makeObservable(this, {
      _subs: observable,
      searchResults: observable.ref,
      isLoading: observable,
      subs: computed,
      channels: computed,
      channelIds: computed,
      fourChannels: computed,
      customPlaylists: computed,
      subscribedChannelIds: computed,
      subscribedPlaylistIds: computed,
      setSearchResults: action,
      setSubs: action,
      remove: action,
      _addSub: action,
    })
  }

  get subs () {
    return _.sortBy(values(this._subs), 'order')
  }

  get channels () {
    return _.filter(this.subs, (sub) => sub.type === 'channel')
  }

  get channelIds () {
    return _.map(this.channels, 'playlistId')
  }

  get fourChannels () {
    return _.take(this.channels, 4)
  }

  get customPlaylists () {
    return _.filter(this.subs, (sub) => sub.type === 'custom')
  }

  get subscribedChannelIds () {
    return new Set(_.map(_.filter(this.subs, (sub) => sub.type === 'channel'), 'id'))
  }

  get subscribedPlaylistIds () {
    return new Set(_.map(_.filter(this.subs, (sub) => sub.type === 'playlist'), 'playlistId'))
  }

  isChannelSubscribed (channelId) {
    return this.subscribedChannelIds.has(channelId)
  }

  isPlaylistSubscribed (playlistId) {
    return this.subscribedPlaylistIds.has(playlistId)
  }

  getSubById (id) {
    return this._subs.get(id)
  }

  getChannelImage (id) {
    const sub = this.getSubById(id)

    return sub && sub.thumb
  }

  setSearchResults (searchResults) {
    this.searchResults = searchResults
  }

  setSubs (subs) {
    _.each(subs, (sub) => {
      this._subs.set(sub.id, new SubModel(sub))
    })

    const oldIds = _.map(this._subsObject(), 'id')
    const newIds = _.map(subs, 'id')
    const missingIds = _.difference(oldIds, newIds)
    _.each(missingIds, (id) => {
      this._subs.delete(id)
    })

    this.isLoading = false
  }

  update (id, props) {
    const sub = this.getSubById(id)
    sub.update(props)
    this.save()
  }

  remove (id) {
    this._subs.delete(id)
    removeSub(id)
  }

  async search (query) {
    const searchResults = await searchChannels(query)

    this.setSearchResults(searchResults)
  }

  async addChannel (channel) {
    const playlistId = await getPlaylistIdForChannel(channel.id)

    this._addSub(channel, {
      playlistId,
      type: 'channel',
    })
  }

  addPlaylist (playlist) {
    this._addSub(playlist, {
      playlistId: playlist.id,
      type: 'playlist',
    })
  }

  addCustomPlaylist (playlist) {
    const idNumber = this._newId(this._subsObject())
    const id = `custom-${idNumber}`

    this._addSub(playlist, {
      id,
      playlistId: `playlist-${idNumber}`,
      videos: {},
      type: 'custom',
    })

    return id
  }

  _addSub = (base, props) => {
    const sub = _.extend(base, props, {
      order: this._newOrder(this._subsObject()),
    })
    this._subs.set(sub.id, new SubModel(sub))
    this.save()
  }

  _newOrder (items) {
    return this._next(_.map(items, (item) => item.order || 0))
  }

  _newId (subs) {
    const customIds = _(subs)
    .filter((sub) => sub.type === 'custom')
    .map((playlist) => parseInt(playlist.id.match(/\d+/)[0], 10))
    .value()

    return this._next(customIds)
  }

  _next (orders) {
    if (!orders.length) return 0
    return _.max(orders) + 1
  }

  addVideoToPlaylist (playlist, videoId) {
    const sub = this.getSubById(playlist.id)
    const video = {
      id: videoId,
      order: this._newOrder(sub.videosObject()),
    }

    sub.addVideo(video)
    this.save()
  }

  removeVideoFromPlaylist (playlist, videoId) {
    this.getSubById(playlist.id).removeVideo(videoId)
    removeVideoFromSub(playlist.id, videoId)
  }

  updatePlaylistVideosOrder (playlistId, videosWithNewOrders) {
    this.getSubById(playlistId).updateVideosOrder(videosWithNewOrders)
  }

  sort (sortedIds) {
    const ids = _.map(this.subs, 'id')
    if (_.isEqual(ids, sortedIds)) return

    _.each(sortedIds, (id, order) => {
      this.getSubById(id).update({ order })
    })

    this.save()
  }

  save () {
    update({ subs: this.serialize() })
  }

  serialize () {
    return transformObject(this._subsObject(), (sub) => sub.serialize())
  }

  _subsObject () {
    return convertMapEntriesToObject(this._subs.toJSON())
  }
}

export const subsStore = new SubsStore()
