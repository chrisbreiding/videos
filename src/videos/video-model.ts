import { action, makeObservable, observable } from 'mobx'
import dayjs, { type Dayjs } from 'dayjs'

import type { VideoData } from '../lib/types'

export class VideoModel {
  duration?: string
  id: string
  channelId?: string
  published: Dayjs | null = null
  description?: string
  order?: number
  thumb?: string
  title?: string

  constructor (props: VideoData) {
    makeObservable(this, {
      duration: observable,
      id: observable,
      channelId: observable,
      published: observable.ref,
      description: observable,
      order: observable,
      thumb: observable,
      title: observable,
      update: action,
    })

    this.duration = props.duration
    this.id = props.id
    this.channelId = props.channelId
    this.published = dayjs(props.published)
    this.description = props.description
    this.order = props.order
    this.thumb = props.thumb
    this.title = props.title
  }

  update ({ order }: { order?: number }) {
    this.order = order
  }
}
