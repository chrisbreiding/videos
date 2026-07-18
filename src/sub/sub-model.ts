import { convertMapToObject, resolveIcon, transformObject } from '../lib/util'
import type {
  CustomPlaylistVideo,
  IconConfig,
  RemoteIconConfig,
  SubProps,
  SubType,
} from '../lib/types'

function resolveIconConfig(icon?: RemoteIconConfig): IconConfig | undefined {
  if (!icon) return undefined

  const { icon: name, type } = resolveIcon(icon.icon, icon.type)

  return {
    icon: name,
    type,
    foregroundColor: icon.foregroundColor,
    backgroundColor: icon.backgroundColor,
  }
}

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
  videos: Map<string, CustomPlaylistVideo> = new Map()
  private _onChange?: () => void

  get videoIds() {
    return Array.from(this.videos.keys())
  }

  constructor(props: SubProps, onChange?: () => void) {
    this.author = props.author
    this.icon = resolveIconConfig(props.icon)
    this.id = props.id
    this.type = props.type
    this.order = props.order
    this.playlistId = props.playlistId
    this.thumb = props.thumb
    this.title = props.title
    this.markedVideoId = props.markedVideoId || null
    this.bookmarkedPageToken = props.bookmarkedPageToken || null
    this.videos = new Map(Object.entries(props.videos ?? {}))
    this._onChange = onChange
  }

  update(props: Partial<SubProps>) {
    Object.assign(this, props)
    this._onChange?.()
  }

  addVideo(video: CustomPlaylistVideo) {
    this.videos.set(video.id, video)
    this._onChange?.()
  }

  removeVideo(videoId: string) {
    this.videos.delete(videoId)
    this._onChange?.()
  }

  updateVideosOrder(
    videosWithNewOrders: Array<{ id: string; order?: number }>,
  ) {
    videosWithNewOrders.forEach(({ id, order }) => {
      this.videos.get(id)!.order = order
    })
    this._onChange?.()
  }

  videosObject(): Record<string, CustomPlaylistVideo> {
    return convertMapToObject(this.videos)
  }

  serialize(): Record<string, unknown> {
    const props: Record<string, unknown> = {
      id: this.id,
      type: this.type,
      markedVideoId: this.markedVideoId,
      order: this.order,
      playlistId: this.playlistId,
      title: this.title,
      bookmarkedPageToken: this.bookmarkedPageToken,
    }

    if (this.type === 'custom') {
      props.icon = {
        backgroundColor: this.icon?.backgroundColor,
        foregroundColor: this.icon?.foregroundColor,
        icon: this.icon?.icon,
        type: this.icon?.type,
      }
      props.videos = transformObject(this.videosObject(), ({ id, order }) => ({
        id,
        order,
      }))
    } else {
      props.author = this.author
      props.thumb = this.thumb
    }

    return props
  }
}
