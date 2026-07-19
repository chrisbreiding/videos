import dayjs, { type Dayjs } from 'dayjs'

import type { VideoData } from '../lib/types'

export class VideoModel {
  channelId: string
  description: string
  duration: string
  id: string
  order?: number
  published: Dayjs
  thumb: string
  title: string

  static fromVideoData(props: VideoData): VideoModel {
    return new VideoModel({
      ...props,
      published: dayjs(props.published),
    })
  }

  constructor(props: Omit<VideoModel, 'updateOrder'>) {
    this.channelId = props.channelId
    this.description = props.description
    this.duration = props.duration
    this.id = props.id
    this.order = props.order
    this.published = props.published
    this.thumb = props.thumb
    this.title = props.title
  }

  updateOrder(order?: number) {
    return new VideoModel({
      ...this,
      order,
    })
  }
}
