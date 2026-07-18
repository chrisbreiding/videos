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
  private _onChange?: () => void

  constructor(props: VideoData, onChange?: () => void) {
    this.duration = props.duration
    this.id = props.id
    this.channelId = props.channelId
    this.published = dayjs(props.published)
    this.description = props.description
    this.order = props.order
    this.thumb = props.thumb
    this.title = props.title
    this._onChange = onChange
  }

  update({ order }: { order?: number }) {
    this.order = order
    this._onChange?.()
  }
}
