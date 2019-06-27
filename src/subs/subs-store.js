import _ from 'lodash'
import { action, asReference, computed, map, observable } from 'mobx'

import SubModel from '../sub/sub-model'
import subsService from './subs-service'

class SubsStore {
  @observable _subs = map()
  @observable selectedSubId = null
  @observable searchResults = asReference([])

  @computed get subs () {
    return _.sortBy(this._subs.values(), 'order')
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

  fetch () {
    subsService.fetch().then(action('fetched:subs', (subs) => {
      this._setSubs(subs)
    }))
  }

  update (id, props) {
    const sub = this.getSubById(id)
    sub.update(props)
    return subsService.update(sub)
  }

  remove (id) {
    this._subs.delete(id)
    return subsService.remove(id)
  }

  _setSubs (subs) {
    this._subs = _.transform(subs, (memo, sub) => {
      memo.set(sub.id, new SubModel(sub))
    }, this._subs)
  }

  search (query) {
    subsService.search(query).then(action('received:search:results', (searchResults) => {
      this.searchResults = searchResults
    }))
  }

  @action clearSearchResults () {
    this.searchResults = []
  }

  addChannel (channel) {
    subsService.addChannel(channel).then(this._addSub)
  }

  addCustomPlaylist (playlist) {
    subsService.addCustomPlaylist(playlist).then(this._addSub)
  }

  @action _addSub = (sub) => {
    this._subs.set(sub.id, new SubModel(sub))
  }

  addVideoToPlaylist (playlist, videoId) {
    subsService.addVideoToPlaylist(playlist, videoId)
    .then(action('playlist:video:added', (video) => {
      this.getSubById(playlist.id).addVideo(video)
    }))
  }

  removeVideoFromPlaylist (playlist, videoId) {
    subsService.removeVideoFromPlaylist(playlist, videoId)
    .then(action('playlist:video:removed', () => {
      this.getSubById(playlist.id).removeVideo(videoId)
    }))
  }
}

export default new SubsStore()
