import _ from 'lodash'
import { getItem } from './local-data'
import { authStore } from '../login/auth-store'
import type {
  ChannelDetails,
  ChannelSearchResult,
  PlaylistDetails,
  PlaylistsForChannelResult,
  VideoData,
  VideosData,
} from './types'

const RESULTS_PER_PAGE = 25

type QueryParams = Record<string, string | number>

function getBaseUrl (): string {
  return getItem<string>('youtubeBaseUrl') || 'https://www.googleapis.com/youtube/v3/'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryYouTube (url: string, data: QueryParams): Promise<any> {
  const baseUrl = getBaseUrl()

  const apiKey = await authStore.getApiKey()
  const params = new URLSearchParams({ key: apiKey, ...data } as Record<string, string>)
  const response = await fetch(`${baseUrl}${url}?${params}`)

  return response.json()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapChannelDetails (result: any): ChannelSearchResult[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _.map(result.items, (item: any) => {
    return {
      id: item.id.channelId,
      title: item.snippet.channelTitle,
      author: item.snippet.title,
      thumb: item.snippet.thumbnails.medium.url,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function videoIdsFromContentDetails (videos: any): string[] {
  return _(videos).map('contentDetails').map('videoId').value()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function videoIdsFromId (videos: any): string[] {
  return _(videos).map('id').map('videoId').value()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVideoDetails (result: any): VideoData[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return _.map(result.items, (video: any) => {
    return {
      id: video.id,
      channelId: video.snippet.channelId,
      title: video.snippet.title,
      description: video.snippet.description,
      published: video.snippet.publishedAt,
      thumb: video.snippet.thumbnails.medium.url,
      duration: video.contentDetails.duration,
    }
  })
}

export async function getVideos (ids: string[]): Promise<VideoData[]> {
  const result = await queryYouTube('videos', {
    id: ids.join(),
    part: 'snippet,contentDetails',
  })

  return mapVideoDetails(result)
}

export async function checkApiKey (apiKey: string): Promise<boolean> {
  const params = { key: apiKey, part: 'id', channelId: 'UCJTWU5K7kl9EE109HBeoldA' }

  try {
    await queryYouTube('activities', params)
    return true
  } catch {
    return false
  }
}

export async function searchChannels (query: string): Promise<ChannelSearchResult[]> {
  const result = await queryYouTube('search', {
    q: query,
    part: 'snippet',
    type: 'channel',
    maxResults: 10,
  })

  return mapChannelDetails(result)
}

export async function getVideosDataForChannelSearch (channelId: string, query: string, pageToken?: string | null): Promise<VideosData> {
  const params: QueryParams = {
    channelId,
    maxResults: RESULTS_PER_PAGE,
    order: 'date',
    part: 'snippet',
    q: query,
  }
  if (pageToken) params.pageToken = pageToken

  const {
    items,
    prevPageToken,
    nextPageToken,
  } = await queryYouTube('search', params)

  const videos = await getVideos(videoIdsFromId(items))

  return {
    videos,
    prevPageToken,
    // there seems to be a bug with the youtube api where it returns
    // a nextPageToken even if there are no more results after this page
    nextPageToken: items.length < RESULTS_PER_PAGE ? undefined : nextPageToken,
  }
}

export async function getVideosDataForPlaylist (playlistId: string, pageToken?: string | null, maxResults: number = RESULTS_PER_PAGE): Promise<VideosData> {
  const params: QueryParams = {
    playlistId,
    part: 'snippet,contentDetails',
    maxResults,
  }
  if (pageToken) params.pageToken = pageToken

  const {
    items,
    prevPageToken,
    nextPageToken,
  } = await queryYouTube('playlistItems', params)

  const videos = await getVideos(videoIdsFromContentDetails(items))

  return {
    videos,
    prevPageToken,
    // there seems to be a bug with the youtube api where it returns
    // a nextPageToken even if there are no more results after this page
    nextPageToken: items.length < RESULTS_PER_PAGE ? undefined : nextPageToken
  }
}

async function getAllVideosFromPlaylist (playlistId: string, pageToken: string | null = null, accumulatedVideos: VideoData[] = []): Promise<VideoData[]> {
  const params: QueryParams = {
    playlistId,
    part: 'snippet,contentDetails',
    maxResults: 50,
  }
  if (pageToken) params.pageToken = pageToken

  const { items, nextPageToken } = await queryYouTube('playlistItems', params)
  const videos = await getVideos(videoIdsFromContentDetails(items))
  const allVideos = accumulatedVideos.concat(videos)

  if (nextPageToken) {
    return getAllVideosFromPlaylist(playlistId, nextPageToken, allVideos)
  }

  return allVideos
}

export async function getVideosDataForPlaylistSearch (playlistId: string, query: string): Promise<VideosData> {
  const videos = await getAllVideosFromPlaylist(playlistId)
  const lowerQuery = query.toLowerCase()
  const filteredVideos = videos.filter((video) => {
    return video.title.toLowerCase().includes(lowerQuery) ||
           video.description.toLowerCase().includes(lowerQuery)
  })

  return {
    videos: filteredVideos,
    prevPageToken: null,
    nextPageToken: null,
  }
}

export async function getVideosDataForAllPlaylists (playlistIds: string[]): Promise<VideoData[]> {
  const getVideos = _.map(playlistIds, (playlistId) => {
    return getVideosDataForPlaylist(playlistId, null, RESULTS_PER_PAGE - 10)
  })

  const playlists = await Promise.all(getVideos)

  return _.flatMap(playlists, 'videos')
}

export async function getPlaylistIdForChannel (channelId: string): Promise<string> {
  const result = await queryYouTube('channels', {
    id: channelId,
    part: 'contentDetails',
  })

  return result.items[0].contentDetails.relatedPlaylists.uploads
}

export async function getChannelDetails (channelId: string): Promise<ChannelDetails> {
  const result = await queryYouTube('channels', {
    id: channelId,
    part: 'snippet',
  })
  const item = result.items[0]

  return {
    id: item.id,
    title: item.snippet.title,
    thumb: item.snippet.thumbnails.medium.url,
  }
}

export async function getPlaylistDetails (playlistId: string): Promise<PlaylistDetails> {
  const result = await queryYouTube('playlists', {
    id: playlistId,
    part: 'snippet',
  })
  const item = result.items[0]

  return {
    id: item.id,
    title: item.snippet.title,
    thumb: item.snippet.thumbnails.medium.url,
  }
}

export async function getPlaylistsForChannel (channelId: string, pageToken?: string | null): Promise<PlaylistsForChannelResult> {
  const params: QueryParams = {
    channelId,
    part: 'contentDetails,snippet',
    maxResults: 50,
  }
  if (pageToken) params.pageToken = pageToken

  const result = await queryYouTube('playlists', params)

  // there seems to be a bug with the youtube api where it returns
  // a nextPageToken even if there are no more results after this page
  const nextPageToken = result.items.length < RESULTS_PER_PAGE ? undefined : result.nextPageToken

  return {
    nextPageToken,
    totalResults: result.pageInfo.totalResults,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    videos: result.items.map((playlist: any) => ({
      author: playlist.snippet.title,
      channelId,
      count: playlist.contentDetails.itemCount,
      description: playlist.snippet.description,
      id: playlist.id,
      published: playlist.snippet.publishedAt,
      thumb: playlist.snippet.thumbnails.medium.url,
      title: playlist.snippet.title,
    })),
  }
}
