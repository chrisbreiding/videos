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

interface YouTubeThumbnails {
  medium: { url: string }
}

interface YouTubeSnippet {
  channelId: string
  channelTitle: string
  title: string
  description: string
  publishedAt: string
  thumbnails: YouTubeThumbnails
}

interface YouTubeListResult<T> {
  items: T[]
  prevPageToken?: string
  nextPageToken?: string
  pageInfo: { totalResults: number }
}

interface YouTubeSearchResultItem {
  id: { channelId: string; videoId: string }
  snippet: YouTubeSnippet
}

interface YouTubeVideoItem {
  id: string
  snippet: YouTubeSnippet
  contentDetails: { duration: string }
}

interface YouTubePlaylistItemItem {
  id: { videoId: string }
  contentDetails: { videoId: string }
}

interface YouTubeChannelItem {
  id: string
  snippet: YouTubeSnippet
  contentDetails: { relatedPlaylists: { uploads: string } }
}

interface YouTubePlaylistItem {
  id: string
  snippet: YouTubeSnippet
  contentDetails: { itemCount: number }
}

function getBaseUrl(): string {
  return (
    getItem<string>('youtubeBaseUrl') ||
    'https://www.googleapis.com/youtube/v3/'
  )
}

async function queryYouTube<T>(url: string, data: QueryParams): Promise<T> {
  const baseUrl = getBaseUrl()

  const apiKey = await authStore.getApiKey()
  const params = new URLSearchParams({ key: apiKey, ...data } as Record<
    string,
    string
  >)
  const response = await fetch(`${baseUrl}${url}?${params}`)

  return response.json()
}

function mapChannelDetails(
  result: YouTubeListResult<YouTubeSearchResultItem>,
): ChannelSearchResult[] {
  return result.items.map((item) => {
    return {
      id: item.id.channelId,
      title: item.snippet.channelTitle,
      author: item.snippet.title,
      thumb: item.snippet.thumbnails.medium.url,
    }
  })
}

function videoIdsFromContentDetails(
  videos: YouTubePlaylistItemItem[],
): string[] {
  return videos.map((video) => video.contentDetails.videoId)
}

function videoIdsFromId(videos: YouTubeSearchResultItem[]): string[] {
  return videos.map((video) => video.id.videoId)
}

function mapVideoDetails(
  result: YouTubeListResult<YouTubeVideoItem>,
): VideoData[] {
  return result.items.map((video) => {
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

export async function getVideos(ids: string[]): Promise<VideoData[]> {
  const result = await queryYouTube<YouTubeListResult<YouTubeVideoItem>>(
    'videos',
    {
      id: ids.join(),
      part: 'snippet,contentDetails',
    },
  )

  return mapVideoDetails(result)
}

export async function checkApiKey(apiKey: string): Promise<boolean> {
  const params = {
    key: apiKey,
    part: 'id',
    channelId: 'UCJTWU5K7kl9EE109HBeoldA',
  }

  try {
    await queryYouTube('activities', params)
    return true
  } catch {
    return false
  }
}

export async function searchChannels(
  query: string,
): Promise<ChannelSearchResult[]> {
  const result = await queryYouTube<YouTubeListResult<YouTubeSearchResultItem>>(
    'search',
    {
      q: query,
      part: 'snippet',
      type: 'channel',
      maxResults: 10,
    },
  )

  return mapChannelDetails(result)
}

export async function getVideosDataForChannelSearch(
  channelId: string,
  query: string,
  pageToken?: string | null,
): Promise<VideosData> {
  const params: QueryParams = {
    channelId,
    maxResults: RESULTS_PER_PAGE,
    order: 'date',
    part: 'snippet',
    q: query,
  }
  if (pageToken) params.pageToken = pageToken

  const { items, prevPageToken, nextPageToken } = await queryYouTube<
    YouTubeListResult<YouTubeSearchResultItem>
  >('search', params)

  const videos = await getVideos(videoIdsFromId(items))

  return {
    videos,
    prevPageToken,
    // there seems to be a bug with the youtube api where it returns
    // a nextPageToken even if there are no more results after this page
    nextPageToken: items.length < RESULTS_PER_PAGE ? undefined : nextPageToken,
  }
}

export async function getVideosDataForPlaylist(
  playlistId: string,
  pageToken?: string | null,
  maxResults: number = RESULTS_PER_PAGE,
): Promise<VideosData> {
  const params: QueryParams = {
    playlistId,
    part: 'snippet,contentDetails',
    maxResults,
  }
  if (pageToken) params.pageToken = pageToken

  const { items, prevPageToken, nextPageToken } = await queryYouTube<
    YouTubeListResult<YouTubePlaylistItemItem>
  >('playlistItems', params)

  const videos = await getVideos(videoIdsFromContentDetails(items))

  return {
    videos,
    prevPageToken,
    // there seems to be a bug with the youtube api where it returns
    // a nextPageToken even if there are no more results after this page
    nextPageToken: items.length < RESULTS_PER_PAGE ? undefined : nextPageToken,
  }
}

async function getAllVideosFromPlaylist(
  playlistId: string,
  pageToken: string | null = null,
  accumulatedVideos: VideoData[] = [],
): Promise<VideoData[]> {
  const params: QueryParams = {
    playlistId,
    part: 'snippet,contentDetails',
    maxResults: 50,
  }
  if (pageToken) params.pageToken = pageToken

  const { items, nextPageToken } = await queryYouTube<
    YouTubeListResult<YouTubePlaylistItemItem>
  >('playlistItems', params)
  const videos = await getVideos(videoIdsFromContentDetails(items))
  const allVideos = accumulatedVideos.concat(videos)

  if (nextPageToken) {
    return getAllVideosFromPlaylist(playlistId, nextPageToken, allVideos)
  }

  return allVideos
}

export async function getVideosDataForPlaylistSearch(
  playlistId: string,
  query: string,
): Promise<VideosData> {
  const videos = await getAllVideosFromPlaylist(playlistId)
  const lowerQuery = query.toLowerCase()
  const filteredVideos = videos.filter((video) => {
    return (
      video.title.toLowerCase().includes(lowerQuery) ||
      video.description.toLowerCase().includes(lowerQuery)
    )
  })

  return {
    videos: filteredVideos,
    prevPageToken: null,
    nextPageToken: null,
  }
}

export async function getVideosDataForAllPlaylists(
  playlistIds: string[],
): Promise<VideoData[]> {
  const getVideos = playlistIds.map((playlistId) => {
    return getVideosDataForPlaylist(playlistId, null, RESULTS_PER_PAGE - 10)
  })

  const playlists = await Promise.all(getVideos)

  return playlists.flatMap((playlist) => playlist.videos)
}

export async function getPlaylistIdForChannel(
  channelId: string,
): Promise<string> {
  const result = await queryYouTube<YouTubeListResult<YouTubeChannelItem>>(
    'channels',
    {
      id: channelId,
      part: 'contentDetails',
    },
  )

  return result.items[0].contentDetails.relatedPlaylists.uploads
}

export async function getChannelDetails(
  channelId: string,
): Promise<ChannelDetails> {
  const result = await queryYouTube<YouTubeListResult<YouTubeChannelItem>>(
    'channels',
    {
      id: channelId,
      part: 'snippet',
    },
  )
  const item = result.items[0]

  return {
    id: item.id,
    title: item.snippet.title,
    thumb: item.snippet.thumbnails.medium.url,
  }
}

export async function getPlaylistDetails(
  playlistId: string,
): Promise<PlaylistDetails> {
  const result = await queryYouTube<YouTubeListResult<YouTubePlaylistItem>>(
    'playlists',
    {
      id: playlistId,
      part: 'snippet',
    },
  )
  const item = result.items[0]

  return {
    id: item.id,
    title: item.snippet.title,
    thumb: item.snippet.thumbnails.medium.url,
  }
}

export async function getPlaylistsForChannel(
  channelId: string,
  pageToken?: string | null,
): Promise<PlaylistsForChannelResult> {
  const params: QueryParams = {
    channelId,
    part: 'contentDetails,snippet',
    maxResults: 50,
  }
  if (pageToken) params.pageToken = pageToken

  const result = await queryYouTube<YouTubeListResult<YouTubePlaylistItem>>(
    'playlists',
    params,
  )

  // there seems to be a bug with the youtube api where it returns
  // a nextPageToken even if there are no more results after this page
  const nextPageToken =
    result.items.length < RESULTS_PER_PAGE ? undefined : result.nextPageToken

  return {
    nextPageToken,
    totalResults: result.pageInfo.totalResults,
    videos: result.items.map((playlist) => ({
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
