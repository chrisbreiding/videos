import { Store } from '../lib/store'
import { SubModel } from '../sub/sub-model'
import { removeSub, removeVideoFromSub, update } from '../lib/remote-data'
import {
  convertMapToObject,
  sortByProperty,
  transformObject,
} from '../lib/util'
import { getPlaylistIdForChannel, searchChannels } from '../lib/youtube'
import type {
  ChannelSearchResult,
  IconConfig,
  PlaylistSummary,
  SubProps,
} from '../lib/types'

class SubsStore extends Store {
  _subs = new Map<string, SubModel>()
  searchResults: ChannelSearchResult[] = []
  isLoading = true

  get subs(): SubModel[] {
    return sortByProperty(Array.from(this._subs.values()), 'order')
  }

  get channels(): SubModel[] {
    return this.subs.filter((sub) => sub.type === 'channel')
  }

  get channelIds(): string[] {
    return this.channels.map((sub) => sub.playlistId) as string[]
  }

  get fourChannels(): SubModel[] {
    return this.channels.slice(0, 4)
  }

  get customPlaylists(): SubModel[] {
    return this.subs.filter((sub) => sub.type === 'custom')
  }

  get subscribedChannelIds(): Set<string> {
    return new Set(
      this.subs.filter((sub) => sub.type === 'channel').map((sub) => sub.id),
    )
  }

  get subscribedPlaylistIds(): Set<string | undefined> {
    return new Set(
      this.subs
        .filter((sub) => sub.type === 'playlist')
        .map((sub) => sub.playlistId),
    )
  }

  isChannelSubscribed(channelId: string) {
    return this.subscribedChannelIds.has(channelId)
  }

  isPlaylistSubscribed(playlistId: string) {
    return this.subscribedPlaylistIds.has(playlistId)
  }

  getSubById(id?: string) {
    return this._subs.get(id as string)
  }

  getChannelImage(id?: string) {
    const sub = this.getSubById(id)

    return sub && sub.thumb
  }

  setSearchResults(searchResults: ChannelSearchResult[]) {
    this.searchResults = searchResults
    this.emit()
  }

  setSubs(subs: Record<string, SubProps>) {
    Object.values(subs).forEach((sub) => {
      this._subs.set(sub.id, new SubModel(sub, this.emit))
    })

    const oldIds = Object.values(this._subsObject()).map((sub) => sub.id)
    const newIds = Object.values(subs).map((sub) => sub.id)
    const missingIds = oldIds.filter((id) => !newIds.includes(id))
    missingIds.forEach((id) => {
      this._subs.delete(id)
    })

    this.isLoading = false
    this.emit()
  }

  update(id: string, props: Partial<SubProps>) {
    const sub = this.getSubById(id)!
    sub.update(props)
    this.save()
  }

  remove(id: string) {
    this._subs.delete(id)
    removeSub(id)
    this.emit()
  }

  async search(query: string) {
    const searchResults = await searchChannels(query)

    this.setSearchResults(searchResults)
  }

  async addChannel(channel: ChannelSearchResult) {
    const playlistId = await getPlaylistIdForChannel(channel.id)

    this._addSub(channel, {
      playlistId,
      type: 'channel',
    })
  }

  addPlaylist(playlist: PlaylistSummary) {
    this._addSub(playlist, {
      playlistId: playlist.id,
      type: 'playlist',
    })
  }

  addCustomPlaylist(playlist: { title: string; icon: IconConfig }) {
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
    const sub = Object.assign(base, props, {
      order: this._newOrder(this._subsObject()),
    }) as unknown as SubProps
    this._subs.set(sub.id, new SubModel(sub, this.emit))
    this.save()
    this.emit()
  }

  _newOrder(items: Record<string, { order?: number }>) {
    return this._next(Object.values(items).map((item) => item.order || 0))
  }

  _newId(subs: Record<string, SubModel>) {
    const customIds = Object.values(subs)
      .filter((sub) => sub.type === 'custom')
      .map((playlist) => parseInt(playlist.id.match(/\d+/)![0], 10))

    return this._next(customIds)
  }

  _next(orders: number[]) {
    if (!orders.length) return 0
    return Math.max(...orders) + 1
  }

  addVideoToPlaylist(playlist: SubModel, videoId: string) {
    const sub = this.getSubById(playlist.id)!
    const video = {
      id: videoId,
      order: this._newOrder(sub.videosObject()),
    }

    sub.addVideo(video)
    this.save()
  }

  removeVideoFromPlaylist(playlist: SubModel, videoId: string) {
    this.getSubById(playlist.id)!.removeVideo(videoId)
    removeVideoFromSub(playlist.id, videoId)
  }

  updatePlaylistVideosOrder(
    playlistId: string | undefined,
    videosWithNewOrders: Array<{ id: string; order?: number }>,
  ) {
    this.getSubById(playlistId)!.updateVideosOrder(videosWithNewOrders)
  }

  sort(sortedIds: string[]) {
    const ids = this.subs.map((sub) => sub.id)
    if (
      ids.length === sortedIds.length &&
      ids.every((id, index) => id === sortedIds[index])
    ) {
      return
    }

    sortedIds.forEach((id, order) => {
      this.getSubById(id)!.update({ order })
    })

    this.save()
  }

  save() {
    update({ subs: this.serialize() })
  }

  serialize() {
    return transformObject(this._subsObject(), (sub) => sub.serialize())
  }

  _subsObject(): Record<string, SubModel> {
    return convertMapToObject(this._subs)
  }
}

export const subsStore = new SubsStore()
