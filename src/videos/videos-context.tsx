import dayjs from 'dayjs'
import { createContext, ReactNode, useContext, useState } from 'react'

import {
  fetchVideos,
  fetchChannelDetails as fetchChannelDetailsFromYoutube,
  fetchPlaylistDetails as fetchPlaylistDetailsFromYoutube,
  fetchPlaylistsForChannel as fetchPlaylistsForChannelYoutube,
  fetchVideosDataForChannelSearch as fetchVideosDataForChannelSearchYoutube,
  fetchVideosDataForPlaylist as fetchVideosDataForPlaylistYoutube,
  fetchVideosDataForPlaylistSearch as fetchVideosDataForPlaylistSearchYoutube,
  fetchVideosDataForAllPlaylists as fetchVideosDataForAllPlaylistsYoutube,
} from '../lib/youtube'
import { getApiKey } from '../login/auth-context'
import { VideoModel } from './video-model'
import type { SubModel } from '../sub/sub-model'
import type {
  ChannelDetails,
  PlaylistDetails,
  PlaylistsForChannelResult,
  VideoData,
  VideosData,
} from '../lib/types'
import { sortByProperty } from '../lib/util'

interface VideosContextValue {
  videos: VideoModel[]
  isLoading: boolean
  hasLoadedAllPlaylists: boolean
  prevPageToken?: string | null
  nextPageToken?: string | null
  fetchVideosDataForPlaylist: (
    playlistId: string,
    pageToken?: string | null,
  ) => Promise<void>
  fetchVideosDataForAllPlaylists: (playlistIds: string[]) => Promise<void>
  fetchVideosDataForChannelSearch: (
    channel: SubModel,
    query: string,
    pageToken?: string | null,
  ) => Promise<void>
  fetchVideosDataForPlaylistSearch: (
    playlistId: string,
    query: string,
  ) => Promise<void>
  fetchVideosDataForCustomPlaylist: (playlist: SubModel) => Promise<void>
  fetchVideosByIds: (ids: string[]) => Promise<VideoData[]>
  fetchChannelDetails: (channelId: string) => Promise<ChannelDetails>
  fetchPlaylistDetails: (playlistId: string) => Promise<PlaylistDetails>
  fetchPlaylistsForChannel: (
    channelId: string,
    pageToken?: string | null,
  ) => Promise<PlaylistsForChannelResult>
  getVideoById: (id: string) => VideoModel | undefined
  nextVideoId: (videoId?: string) => string | null
  sort: (sortedIds: string[]) => boolean
}

export const VideosContext = createContext<VideosContextValue | undefined>(
  undefined,
)

export const VideosProvider = ({ children }: { children: ReactNode }) => {
  const [videos, setVideos] = useState<VideoModel[]>([])
  const [isSortable, setIsSortable] = useState(false)
  const [hasLoadedAllPlaylists, setHasLoadedAllPlaylists] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [prevPageToken, setPrevPageToken] = useState<string | null | undefined>(
    null,
  )
  const [nextPageToken, setNextPageToken] = useState<string | null | undefined>(
    null,
  )

  const beforeLoad = () => {
    setIsLoading(true)
    setPrevPageToken(null)
    setNextPageToken(null)
  }

  const afterLoad = (isSortableValue: boolean) => {
    setIsSortable(isSortableValue)
    setIsLoading(false)
  }

  const updateVideosData = ({
    videos,
    prevPageToken,
    nextPageToken,
  }: VideosData) => {
    if (videos) {
      setVideos(videos.map((video) => VideoModel.fromVideoData(video)))
    }
    if (prevPageToken) setPrevPageToken(prevPageToken)
    if (nextPageToken) setNextPageToken(nextPageToken)
  }

  const getVideoById = (id: string) => {
    return videos.find((video) => video.id === id)
  }

  const fetchVideosByIds = async (ids: string[]) => {
    const apiKey = await getApiKey()

    return fetchVideos(ids, apiKey)
  }

  const fetchChannelDetails = async (channelId: string) => {
    const apiKey = await getApiKey()

    return fetchChannelDetailsFromYoutube(channelId, apiKey)
  }

  const fetchPlaylistDetails = async (playlistId: string) => {
    const apiKey = await getApiKey()

    return fetchPlaylistDetailsFromYoutube(playlistId, apiKey)
  }

  const fetchPlaylistsForChannel = async (
    channelId: string,
    pageToken?: string | null,
  ) => {
    const apiKey = await getApiKey()

    return fetchPlaylistsForChannelYoutube(channelId, pageToken, apiKey)
  }

  const fetchVideosDataForPlaylist = async (
    playlistId: string,
    pageToken?: string | null,
  ) => {
    beforeLoad()

    const apiKey = await getApiKey()
    const videosData = await fetchVideosDataForPlaylistYoutube(
      playlistId,
      pageToken,
      apiKey,
    )

    updateVideosData(videosData)
    afterLoad(false)
  }

  const fetchVideosDataForAllPlaylists = async (playlistIds: string[]) => {
    if (!playlistIds.length) return

    beforeLoad()

    const apiKey = await getApiKey()
    const videos = await fetchVideosDataForAllPlaylistsYoutube(
      playlistIds,
      apiKey,
    )

    updateVideosData({
      videos,
      prevPageToken: null,
      nextPageToken: null,
    })
    setHasLoadedAllPlaylists(true)
    afterLoad(false)
  }

  const fetchVideosDataForChannelSearch = async (
    channel: SubModel,
    query: string,
    pageToken?: string | null,
  ) => {
    beforeLoad()

    const apiKey = await getApiKey()
    const videosData = await fetchVideosDataForChannelSearchYoutube(
      channel.id,
      query,
      pageToken,
      apiKey,
    )

    updateVideosData(videosData)
    afterLoad(false)
  }

  const fetchVideosDataForPlaylistSearch = async (
    playlistId: string,
    query: string,
  ) => {
    beforeLoad()

    const apiKey = await getApiKey()
    const videosData = await fetchVideosDataForPlaylistSearchYoutube(
      playlistId,
      query,
      apiKey,
    )

    updateVideosData(videosData)
    afterLoad(false)
  }

  const fetchVideosDataForCustomPlaylist = async (playlist: SubModel) => {
    beforeLoad()

    let videos = playlist.videos.size
      ? await fetchVideosByIds(playlist.videoIds)
      : []

    videos = videos.map((video) => {
      return Object.assign(video, playlist.videos.get(video.id))
    })

    updateVideosData({
      videos,
      prevPageToken: null,
      nextPageToken: null,
    })
    afterLoad(true)
  }

  const displayedVideos = isSortable
    ? sortByProperty(videos.slice(), 'order')
    : videos
        .slice()
        .sort((video1, video2) => {
          return dayjs(video1.published).isBefore(video2.published) ? 1 : -1
        })
        .slice(0, 25)

  const nextVideoId = (videoId?: string): string | null => {
    if (!videoId || displayedVideos.length < 2) return null

    const videoIndex = displayedVideos.findIndex(
      (video) => video.id === videoId,
    )
    if (videoIndex === -1) return null

    const nextVideo = displayedVideos[videoIndex + 1]
    if (!nextVideo) return null

    return nextVideo.id
  }

  const sort = (sortedIds: string[]) => {
    const ids = displayedVideos.map((video) => video.id)
    if (
      ids.length === sortedIds.length &&
      ids.every((id, index) => id === sortedIds[index])
    ) {
      return false
    }

    setVideos(
      sortedIds.map((id, order) => getVideoById(id)!.updateOrder(order)),
    )

    return true
  }

  const value: VideosContextValue = {
    videos: displayedVideos,
    isLoading,
    hasLoadedAllPlaylists,
    prevPageToken,
    nextPageToken,
    fetchVideosDataForPlaylist,
    fetchVideosDataForAllPlaylists,
    fetchVideosDataForChannelSearch,
    fetchVideosDataForPlaylistSearch,
    fetchVideosDataForCustomPlaylist,
    fetchVideosByIds,
    fetchChannelDetails,
    fetchPlaylistDetails,
    fetchPlaylistsForChannel,
    getVideoById,
    nextVideoId,
    sort,
  }

  return (
    <VideosContext.Provider value={value}>{children}</VideosContext.Provider>
  )
}

export const useVideosContext = () => useContext(VideosContext)!
