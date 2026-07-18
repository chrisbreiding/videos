import { action, computed, makeObservable, observable, toJS } from 'mobx'
import dayjs from 'dayjs'

import { videosService } from './videos-service'
import { VideoModel } from './video-model'
import type { SubModel } from '../sub/sub-model'
import type { CustomPlaylistVideo, VideosData } from '../lib/types'

class VideosStore {
  _videos: VideoModel[] = []
  _isSortable = false
  hasLoadedAllPlaylists = false
  isLoading = false
  prevPageToken?: string | null
  nextPageToken?: string | null

  constructor() {
    makeObservable(this, {
      _videos: observable,
      _isSortable: observable,
      hasLoadedAllPlaylists: observable,
      isLoading: observable,
      prevPageToken: observable,
      nextPageToken: observable,
      videos: computed,
      getVideosDataForPlaylist: action,
      getVideosDataForAllPlaylists: action,
      getVideosDataForChannelSearch: action,
      getVideosDataForPlaylistSearch: action,
      getVideosDataForCustomPlaylist: action,
      _beforeLoad: action,
      _afterLoad: action,
      _updateVideosData: action,
    })
  }

  get videos(): VideoModel[] {
    if (this._isSortable) {
      return this._videos
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
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
      return Object.assign(
        video,
        (
          toJS(playlist.videos) as unknown as Record<
            string,
            CustomPlaylistVideo
          >
        )[video.id],
      )
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
  }

  _afterLoad(isSortable: boolean) {
    this._isSortable = isSortable
    this.isLoading = false
  }

  _updateVideosData({ videos, prevPageToken, nextPageToken }: VideosData) {
    if (videos) this._videos = videos.map((video) => new VideoModel(video))
    if (prevPageToken) this.prevPageToken = prevPageToken
    if (nextPageToken) this.nextPageToken = nextPageToken
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

    return true
  }
}

export const videosStore = new VideosStore()
