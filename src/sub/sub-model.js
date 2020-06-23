import _ from 'lodash'
import { action, computed, observable } from 'mobx'

import { mapObject } from '../lib/util'

class SubModel {
  @observable author
  @observable icon
  @observable id
  @observable isCustom
  @observable order
  @observable playlistId
  @observable thumb
  @observable title
  @observable markedVideoId = null
  @observable videos = observable.map()

  @computed get videoIds () {
    return Array.from(this.videos.keys())
  }

  constructor (props) {
    this.author = props.author
    this.icon = props.icon
    this.id = props.id
    this.isCustom = props.isCustom || props.custom
    this.order = props.order
    this.playlistId = props.playlistId
    this.thumb = props.thumb
    this.title = props.title
    this.markedVideoId = props.markedVideoId || null
    this.videos = observable.map(props.videos)
  }

  @action update (props) {
    _.extend(this, props)
  }

  @action addVideo (video) {
    this.videos.set(video.id, video)
  }

  removeVideo (videoId) {
    this.videos.delete(videoId)
  }

  serialize () {
    const props = _.pick(this, 'id', 'markedVideoId', 'order', 'playlistId', 'title')

    if (this.isCustom) {
      props.isCustom = this.isCustom
      props.icon = _.pick(this.icon, 'backgroundColor', 'foregroundColor', 'icon')
      props.videos = mapObject(this.videos.toJSON(), ({ id, order }) => ({ id, order }))
    } else {
      _.extend(props, _.pick(this, 'author', 'thumb'))
    }

    return props
  }
}

export default SubModel
