import _ from 'lodash'
import { action, computed, makeObservable, observable, toJS } from 'mobx'

import { convertMapToObject, transformObject } from '../lib/util'

export class SubModel {
  author
  icon
  id
  type
  order
  playlistId
  thumb
  title
  markedVideoId = null
  bookmarkedPageToken = null
  videos = observable.map()

  get videoIds () {
    return Array.from(this.videos.keys())
  }

  constructor (props) {
    makeObservable(this, {
      author: observable,
      icon: observable,
      id: observable,
      type: observable,
      order: observable,
      playlistId: observable,
      thumb: observable,
      title: observable,
      markedVideoId: observable,
      bookmarkedPageToken: observable,
      videos: observable,
      videoIds: computed,
      update: action,
      addVideo: action,
      removeVideo: action,
      updateVideosOrder: action,
    })

    this.author = props.author
    this.icon = props.icon
    this.id = props.id
    this.type = props.type
    this.order = props.order
    this.playlistId = props.playlistId
    this.thumb = props.thumb
    this.title = props.title
    this.markedVideoId = props.markedVideoId || null
    this.bookmarkedPageToken = props.bookmarkedPageToken || null
    this.videos = observable.map(props.videos)
  }

  update (props) {
    _.extend(this, props)
  }

  addVideo (video) {
    this.videos.set(video.id, video)
  }

  removeVideo (videoId) {
    this.videos.delete(videoId)
  }

  updateVideosOrder (videosWithNewOrders) {
    _.map(videosWithNewOrders, ({ id, order }) => {
      this.videos.get(id).order = order
    })
  }

  videosObject () {
    return convertMapToObject(toJS(this.videos))
  }

  serialize () {
    const props = _.pick(this, 'id', 'type', 'markedVideoId', 'order', 'playlistId', 'title', 'bookmarkedPageToken')

    if (this.type === 'custom') {
      props.icon = _.pick(this.icon, 'backgroundColor', 'foregroundColor', 'icon')
      props.videos = transformObject(this.videosObject(), ({ id, order }) => ({ id, order }))
    } else {
      _.extend(props, _.pick(this, 'author', 'thumb'))
    }

    return props
  }
}
