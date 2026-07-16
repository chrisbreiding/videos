import _ from 'lodash'
import { action, computed, makeObservable, observable, ObservableMap, toJS } from 'mobx'

import { convertMapToObject, transformObject } from '../lib/util'
import type { CustomPlaylistVideo, IconConfig, SubProps, SubType } from '../lib/types'

export class SubModel {
  author?: string
  icon?: IconConfig
  id: string
  type: SubType
  order?: number
  playlistId?: string
  thumb?: string
  title?: string
  markedVideoId: string | null = null
  bookmarkedPageToken: string | null = null
  videos: ObservableMap<string, CustomPlaylistVideo> = observable.map()

  get videoIds () {
    return Array.from(this.videos.keys())
  }

  constructor (props: SubProps) {
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

  update (props: Partial<SubProps>) {
    _.extend(this, props)
  }

  addVideo (video: CustomPlaylistVideo) {
    this.videos.set(video.id, video)
  }

  removeVideo (videoId: string) {
    this.videos.delete(videoId)
  }

  updateVideosOrder (videosWithNewOrders: Array<{ id: string, order?: number }>) {
    _.map(videosWithNewOrders, ({ id, order }) => {
      this.videos.get(id)!.order = order
    })
  }

  videosObject (): Record<string, CustomPlaylistVideo> {
    return convertMapToObject(toJS(this.videos) as Map<string, CustomPlaylistVideo>)
  }

  serialize (): Record<string, unknown> {
    const props: Record<string, unknown> = _.pick(this, 'id', 'type', 'markedVideoId', 'order', 'playlistId', 'title', 'bookmarkedPageToken')

    if (this.type === 'custom') {
      props.icon = _.pick(this.icon, 'backgroundColor', 'foregroundColor', 'icon')
      props.videos = transformObject(this.videosObject(), ({ id, order }) => ({ id, order }))
    } else {
      _.extend(props, _.pick(this, 'author', 'thumb'))
    }

    return props
  }
}
