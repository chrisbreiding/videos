import dayjs from 'dayjs'

import { Store } from '../lib/store'
import { videosService } from './videos-service'
import { VideoModel } from './video-model'
import type { SubModel } from '../sub/sub-model'
import type { VideosData } from '../lib/types'
import { sortByProperty } from '../lib/util'

class VideosStore extends Store {
  _videos: VideoModel[] = []
  _isSortable = false
  hasLoadedAllPlaylists = false
  isLoading = false
  prevPageToken?: string | null
  nextPageToken?: string | null

  get videos(): VideoModel[] {
    if (this._isSortable) {
      return sortByProperty(this._videos.slice(), 'order')
    }

    const sortedVideos = this._videos.slice().sort((video1, video2) => {
      return dayjs(video1.published).isBefore(video2.published) ? 1 : -1
    })

    return sortedVideos.slice(0, 25)
  }

  async getVideosDataForPlaylist(
    playlistId: string,
    pageToken?: string | null,
  ) {
    this._beforeLoad()

    const videosData = await videosService.getVideosDataForPlaylist(
      playlistId,
      pageToken,
    )

    this._updateVideosData(videosData)
    this._afterLoad(false)
  }

  async getVideosDataForAllPlaylists(playlistIds: string[]) {
    if (!playlistIds.length) return []

    this._beforeLoad()

    const videos = await videosService.getVideosDataForAllPlaylists(playlistIds)

    this._updateVideosData({
      videos,
      prevPageToken: null,
      nextPageToken: null,
    })
    this.hasLoadedAllPlaylists = true
    this._afterLoad(false)
  }

  async getVideosDataForChannelSearch(
    channel: SubModel,
    query: string,
    pageToken?: string | null,
  ) {
    this._beforeLoad()

    const videosData = await videosService.getVideosDataForChannelSearch(
      channel.id,
      query,
      pageToken,
    )

    this._updateVideosData(videosData)
    this._afterLoad(false)
  }

  async getVideosDataForPlaylistSearch(playlistId: string, query: string) {
    this._beforeLoad()

    const videosData = await videosService.getVideosDataForPlaylistSearch(
      playlistId,
      query,
    )

    this._updateVideosData(videosData)
    this._afterLoad(false)
  }

  async getVideosDataForCustomPlaylist(playlist: SubModel) {
    this._beforeLoad()

    let videos = await videosService.getVideosDataForCustomPlaylist(playlist)

    videos = videos.map((video) => {
      return Object.assign(video, playlist.videos.get(video.id))
    })

    this._updateVideosData({
      videos,
      prevPageToken: null,
      nextPageToken: null,
    })
    this._afterLoad(true)
  }

  getVideoById(id: string) {
    return this._videos.find((video) => video.id === id)
  }

  nextVideoId(videoId?: string): string | null {
    if (!videoId || this.videos.length < 2) return null

    const videoIndex = this.videos.findIndex((video) => video.id === videoId)
    if (videoIndex === -1) return null

    const nextVideo = this.videos[videoIndex + 1]
    if (!nextVideo) return null

    return nextVideo.id
  }

  _beforeLoad() {
    this.isLoading = true
    this.prevPageToken = null
    this.nextPageToken = null
    this.emit()
  }

  _afterLoad(isSortable: boolean) {
    this._isSortable = isSortable
    this.isLoading = false
    this.emit()
  }

  _updateVideosData({ videos, prevPageToken, nextPageToken }: VideosData) {
    if (videos) {
      this._videos = videos.map((video) => new VideoModel(video, this.emit))
    }
    if (prevPageToken) this.prevPageToken = prevPageToken
    if (nextPageToken) this.nextPageToken = nextPageToken
    this.emit()
  }

  sort(sortedIds: string[]) {
    const ids = this.videos.map((video) => video.id)
    if (
      ids.length === sortedIds.length &&
      ids.every((id, index) => id === sortedIds[index])
    ) {
      return false
    }

    sortedIds.forEach((id, order) => {
      this.getVideoById(id)!.update({ order })
    })

    this.emit()

    return true
  }
}

export const videosStore = new VideosStore()
