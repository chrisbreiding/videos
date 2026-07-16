import _ from 'lodash'
import { action, computed, makeObservable, observable, values } from 'mobx'

import { SubModel } from '../sub/sub-model'
import { removeSub, removeVideoFromSub, update } from '../lib/remote-data'
import { convertMapEntriesToObject, transformObject } from '../lib/util'
import { getPlaylistIdForChannel, searchChannels } from '../lib/youtube'
import type { ChannelSearchResult, IconConfig, PlaylistSummary, SubProps } from '../lib/types'

class SubsStore {
  _subs = observable.map<string, SubModel>()
  searchResults: ChannelSearchResult[] = []
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

  get subs (): SubModel[] {
    return _.sortBy(values(this._subs), 'order')
  }

  get channels (): SubModel[] {
    return _.filter(this.subs, (sub) => sub.type === 'channel')
  }

  get channelIds (): string[] {
    return _.map(this.channels, 'playlistId') as string[]
  }

  get fourChannels (): SubModel[] {
    return _.take(this.channels, 4)
  }

  get customPlaylists (): SubModel[] {
    return _.filter(this.subs, (sub) => sub.type === 'custom')
  }

  get subscribedChannelIds (): Set<string> {
    return new Set(_.map(_.filter(this.subs, (sub) => sub.type === 'channel'), 'id'))
  }

  get subscribedPlaylistIds (): Set<string | undefined> {
    return new Set(_.map(_.filter(this.subs, (sub) => sub.type === 'playlist'), 'playlistId'))
  }

  isChannelSubscribed (channelId: string) {
    return this.subscribedChannelIds.has(channelId)
  }

  isPlaylistSubscribed (playlistId: string) {
    return this.subscribedPlaylistIds.has(playlistId)
  }

  getSubById (id?: string) {
    return this._subs.get(id as string)
  }

  getChannelImage (id?: string) {
    const sub = this.getSubById(id)

    return sub && sub.thumb
  }

  setSearchResults (searchResults: ChannelSearchResult[]) {
    this.searchResults = searchResults
  }

  setSubs (subs: Record<string, SubProps>) {
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

  update (id: string, props: Partial<SubProps>) {
    const sub = this.getSubById(id)!
    sub.update(props)
    this.save()
  }

  remove (id: string) {
    this._subs.delete(id)
    removeSub(id)
  }

  async search (query: string) {
    const searchResults = await searchChannels(query)

    this.setSearchResults(searchResults)
  }

  async addChannel (channel: ChannelSearchResult) {
    const playlistId = await getPlaylistIdForChannel(channel.id)

    this._addSub(channel, {
      playlistId,
      type: 'channel',
    })
  }

  addPlaylist (playlist: PlaylistSummary) {
    this._addSub(playlist, {
      playlistId: playlist.id,
      type: 'playlist',
    })
  }

  addCustomPlaylist (playlist: { title: string, icon: IconConfig }) {
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

  _addSub = (base: object, props: Partial<SubProps>) => {
    const sub = _.extend(base, props, {
      order: this._newOrder(this._subsObject()),
    }) as unknown as SubProps
    this._subs.set(sub.id, new SubModel(sub))
    this.save()
  }

  _newOrder (items: Record<string, { order?: number }>) {
    return this._next(_.map(items, (item) => item.order || 0))
  }

  _newId (subs: Record<string, SubModel>) {
    const customIds = _(subs)
    .filter((sub) => sub.type === 'custom')
    .map((playlist) => parseInt(playlist.id.match(/\d+/)![0], 10))
    .value()

    return this._next(customIds)
  }

  _next (orders: number[]) {
    if (!orders.length) return 0
    return _.max(orders)! + 1
  }

  addVideoToPlaylist (playlist: SubModel, videoId: string) {
    const sub = this.getSubById(playlist.id)!
    const video = {
      id: videoId,
      order: this._newOrder(sub.videosObject()),
    }

    sub.addVideo(video)
    this.save()
  }

  removeVideoFromPlaylist (playlist: SubModel, videoId: string) {
    this.getSubById(playlist.id)!.removeVideo(videoId)
    removeVideoFromSub(playlist.id, videoId)
  }

  updatePlaylistVideosOrder (playlistId: string | undefined, videosWithNewOrders: Array<{ id: string, order?: number }>) {
    this.getSubById(playlistId)!.updateVideosOrder(videosWithNewOrders)
  }

  sort (sortedIds: string[]) {
    const ids = _.map(this.subs, 'id')
    if (_.isEqual(ids, sortedIds)) return

    _.each(sortedIds, (id, order) => {
      this.getSubById(id)!.update({ order })
    })

    this.save()
  }

  save () {
    update({ subs: this.serialize() })
  }

  serialize () {
    return transformObject(this._subsObject(), (sub) => sub.serialize())
  }

  _subsObject (): Record<string, SubModel> {
    return convertMapEntriesToObject(this._subs.toJSON())
  }
}

export const subsStore = new SubsStore()
