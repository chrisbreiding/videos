import { createContext, ReactNode, useContext, useState } from 'react'

import { SubModel } from '../sub/sub-model'
import {
  removeSub,
  removeVideoFromSub,
  update as updateRemoteData,
} from '../lib/remote-data'
import {
  convertMapToObject,
  sortByProperty,
  transformObject,
} from '../lib/util'
import { fetchPlaylistIdForChannel, searchChannels } from '../lib/youtube'
import { useAuthContext } from '../login/auth-context'
import type {
  ChannelSearchResult,
  IconConfig,
  PlaylistSummary,
  SubProps,
} from '../lib/types'

interface SubsContextValue {
  subs: SubModel[]
  channelIds: string[]
  fourChannels: SubModel[]
  customPlaylists: SubModel[]
  searchResults: ChannelSearchResult[]
  isLoading: boolean
  isChannelSubscribed: (channelId: string) => boolean
  isPlaylistSubscribed: (playlistId: string) => boolean
  getSubById: (id?: string) => SubModel | undefined
  getChannelImage: (id?: string) => string | undefined
  setSearchResults: (searchResults: ChannelSearchResult[]) => void
  setSubs: (subs: Record<string, SubProps>) => void
  update: (id: string, props: Partial<SubProps>) => void
  remove: (id: string) => void
  search: (query: string) => Promise<void>
  addChannel: (channel: ChannelSearchResult) => Promise<void>
  addPlaylist: (playlist: PlaylistSummary) => void
  addCustomPlaylist: (playlist: { title: string; icon: IconConfig }) => string
  addVideoToPlaylist: (playlist: SubModel, videoId: string) => void
  removeVideoFromPlaylist: (playlist: SubModel, videoId: string) => void
  updatePlaylistVideosOrder: (
    playlistId: string | undefined,
    videosWithNewOrders: Array<{ id: string; order?: number }>,
  ) => void
  sort: (sortedIds: string[]) => void
  save: () => void
}

export const SubsContext = createContext<SubsContextValue | undefined>(
  undefined,
)

function next(orders: number[]) {
  if (!orders.length) return 0
  return Math.max(...orders) + 1
}

function newOrder(items: Array<{ order?: number }>) {
  return next(items.map((item) => item.order || 0))
}

function newId(subs: SubModel[]) {
  const customIds = subs
    .filter((sub) => sub.type === 'custom')
    .map((sub) => parseInt(sub.id.match(/\d+/)![0], 10))

  return next(customIds)
}

export const SubsProvider = ({ children }: { children: ReactNode }) => {
  const { getApiKey } = useAuthContext()
  const [subsMap, setSubsMap] = useState(new Map<string, SubModel>())
  const [searchResults, setSearchResults] = useState<ChannelSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const notifyChange = () => {
    setSubsMap((prev) => new Map(prev))
  }

  const subs = sortByProperty(Array.from(subsMap.values()), 'order')
  const channels = subs.filter((sub) => sub.type === 'channel')
  const channelIds = channels.map((sub) => sub.playlistId) as string[]
  const fourChannels = channels.slice(0, 4)
  const customPlaylists = subs.filter((sub) => sub.type === 'custom')
  const subscribedChannelIds = new Set(channels.map((sub) => sub.id))
  const subscribedPlaylistIds = new Set(
    subs.filter((sub) => sub.type === 'playlist').map((sub) => sub.playlistId),
  )

  const isChannelSubscribed = (channelId: string) => {
    return subscribedChannelIds.has(channelId)
  }

  const isPlaylistSubscribed = (playlistId: string) => {
    return subscribedPlaylistIds.has(playlistId)
  }

  const getSubById = (id?: string) => {
    return subsMap.get(id as string)
  }

  const getChannelImage = (id?: string) => {
    const sub = getSubById(id)

    return sub && sub.thumb
  }

  const serialize = (map: Map<string, SubModel>) => {
    return transformObject(convertMapToObject(map), (sub) => sub.serialize())
  }

  const save = (map = subsMap) => {
    updateRemoteData({ subs: serialize(map) })
  }

  const setSubs = (subsProps: Record<string, SubProps>) => {
    // Called from a watchDoc subscription set up once on mount (see app.tsx),
    // so it can run long after this render's closure is stale. Compute the
    // next map from the latest committed state instead of the `subsMap`
    // closed over above.
    setSubsMap((prevSubsMap) => {
      const nextMap = new Map(prevSubsMap)

      Object.values(subsProps).forEach((sub) => {
        nextMap.set(sub.id, new SubModel(sub, notifyChange))
      })

      const oldIds = Array.from(prevSubsMap.keys())
      const newIds = Object.values(subsProps).map((sub) => sub.id)
      const missingIds = oldIds.filter((id) => !newIds.includes(id))
      missingIds.forEach((id) => {
        nextMap.delete(id)
      })

      return nextMap
    })
    setIsLoading(false)
  }

  const update = (id: string, props: Partial<SubProps>) => {
    const sub = getSubById(id)!
    sub.update(props)
    save()
  }

  const remove = (id: string) => {
    const nextMap = new Map(subsMap)
    nextMap.delete(id)
    setSubsMap(nextMap)
    removeSub(id)
  }

  const addSub = (base: object, props: Partial<SubProps>) => {
    const sub = Object.assign(base, props, {
      order: newOrder(subs),
    }) as unknown as SubProps

    const nextMap = new Map(subsMap)
    nextMap.set(sub.id, new SubModel(sub, notifyChange))
    setSubsMap(nextMap)
    save(nextMap)

    return sub.id
  }

  const search = async (query: string) => {
    const apiKey = await getApiKey()
    const results = await searchChannels(query, apiKey)

    setSearchResults(results)
  }

  const addChannel = async (channel: ChannelSearchResult) => {
    const apiKey = await getApiKey()
    const playlistId = await fetchPlaylistIdForChannel(channel.id, apiKey)

    addSub(channel, {
      playlistId,
      type: 'channel',
    })
  }

  const addPlaylist = (playlist: PlaylistSummary) => {
    addSub(playlist, {
      playlistId: playlist.id,
      type: 'playlist',
    })
  }

  const addCustomPlaylist = (playlist: { title: string; icon: IconConfig }) => {
    const idNumber = newId(subs)
    const id = `custom-${idNumber}`

    return addSub(playlist, {
      id,
      playlistId: `playlist-${idNumber}`,
      videos: {},
      type: 'custom',
    })
  }

  const addVideoToPlaylist = (playlist: SubModel, videoId: string) => {
    const sub = getSubById(playlist.id)!
    const video = {
      id: videoId,
      order: newOrder(Array.from(sub.videos.values())),
    }

    sub.addVideo(video)
    save()
  }

  const removeVideoFromPlaylist = (playlist: SubModel, videoId: string) => {
    getSubById(playlist.id)!.removeVideo(videoId)
    removeVideoFromSub(playlist.id, videoId)
  }

  const updatePlaylistVideosOrder = (
    playlistId: string | undefined,
    videosWithNewOrders: Array<{ id: string; order?: number }>,
  ) => {
    getSubById(playlistId)!.updateVideosOrder(videosWithNewOrders)
  }

  const sort = (sortedIds: string[]) => {
    const ids = subs.map((sub) => sub.id)
    if (
      ids.length === sortedIds.length &&
      ids.every((id, index) => id === sortedIds[index])
    ) {
      return
    }

    sortedIds.forEach((id, order) => {
      getSubById(id)!.update({ order })
    })

    save()
  }

  const value: SubsContextValue = {
    subs,
    channelIds,
    fourChannels,
    customPlaylists,
    searchResults,
    isLoading,
    isChannelSubscribed,
    isPlaylistSubscribed,
    getSubById,
    getChannelImage,
    setSearchResults,
    setSubs,
    update,
    remove,
    search,
    addChannel,
    addPlaylist,
    addCustomPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylistVideosOrder,
    sort,
    save,
  }

  return <SubsContext.Provider value={value}>{children}</SubsContext.Provider>
}

export const useSubsContext = () => useContext(SubsContext)!
