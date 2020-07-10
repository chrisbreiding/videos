import _ from 'lodash'
import { action, computed, observable, values } from 'mobx'
import arrayMove from 'array-move'

import SubModel from '../sub/sub-model'
import { removeSub, removeVideoFromSub, update } from '../lib/remote-data'
import { mapObject } from '../lib/util'
import { getPlaylistIdForChannel, searchChannels } from '../lib/youtube'

class SubsStore {
  @observable _subs = observable.map()
  @observable.ref searchResults = []

  @computed get subs () {
    return _.sortBy(values(this._subs), 'order')
  }

  @computed get channelIds () {
    const channels = _.reject(this.subs, { isCustom: true })
    return _.map(channels, 'playlistId')
  }

  @computed get fourChannels () {
    const channels = _.reject(this.subs, { isCustom: true })
    return _.take(channels, 4)
  }

  getSubById (id) {
    return this._subs.get(id)
  }

  getChannelImage (id) {
    const sub = this.getSubById(id)

    return sub && sub.thumb
  }

  @action setSearchResults (searchResults) {
    this.searchResults = searchResults
  }

  @action setSubs (subs) {
    _.each(subs, (sub) => {
      this._subs.set(sub.id, new SubModel(sub))
    })

    const oldIds = _.map(this._subs.toJSON(), 'id')
    const newIds = _.map(subs, 'id')
    const missingIds = _.difference(oldIds, newIds)
    _.each(missingIds, (id) => {
      this._subs.delete(id)
    })
  }

  update (id, props) {
    const sub = this.getSubById(id)
    sub.update(props)
    this.save()
  }

  @action remove (id) {
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
      isCustom: false,
    })
  }

  addCustomPlaylist (playlist) {
    const id = this._newId(this._subs.toJSON())

    this._addSub(playlist, {
      isCustom: true,
      id: `custom-${id}`,
      playlistId: `playlist-${id}`,
      videos: {},
    })
  }

  @action _addSub = (base, props) => {
    const sub = _.extend(base, props, {
      order: this._newOrder(this._subs.toJSON()),
    })
    this._subs.set(sub.id, new SubModel(sub))
    this.save()
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

  _next (orders) {
    if (!orders.length) return 0
    return _.max(orders) + 1
  }

  addVideoToPlaylist (playlist, videoId) {
    const sub = this.getSubById(playlist.id)
    const video = {
      id: videoId,
      order: this._newOrder(sub.videos.toJSON()),
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

  sort ({ oldIndex, newIndex }) {
    if (oldIndex === newIndex) return

    const ids = _.map(this.subs, 'id')
    const sortedIds = arrayMove(ids, oldIndex, newIndex)

    _.each(sortedIds, (id, order) => {
      this.getSubById(id).update({ order })
    })

    this.save()
  }

  save () {
    update({ subs: this.serialize() })
  }

  serialize () {
    return mapObject(this._subs.toJSON(), (sub) => sub.serialize())
  }
}

export default new SubsStore()
