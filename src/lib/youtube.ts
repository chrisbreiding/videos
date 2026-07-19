import { getItem } from './local-data'
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

async function queryYouTube<T>(
  url: string,
  apiKey: string,
  data: QueryParams,
): Promise<T> {
  const baseUrl = getBaseUrl()

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
      title: item.snippet.channelTitle || item.snippet.title,
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

export async function fetchVideos(
  ids: string[],
  apiKey: string,
): Promise<VideoData[]> {
  const result = await queryYouTube<YouTubeListResult<YouTubeVideoItem>>(
    'videos',
    apiKey,
    {
      id: ids.join(),
      part: 'snippet,contentDetails',
    },
  )

  return mapVideoDetails(result)
}

export async function checkApiKey(apiKey: string): Promise<boolean> {
  const params = {
    part: 'id',
    channelId: 'UCJTWU5K7kl9EE109HBeoldA',
  }

  try {
    await queryYouTube('activities', apiKey, params)
    return true
  } catch {
    return false
  }
}

export async function searchChannels(
  query: string,
  apiKey: string,
): Promise<ChannelSearchResult[]> {
  const result = await queryYouTube<YouTubeListResult<YouTubeSearchResultItem>>(
    'search',
    apiKey,
    {
      q: query,
      part: 'snippet',
      type: 'channel',
      maxResults: 10,
    },
  )

  return mapChannelDetails(result)
}

export async function fetchVideosDataForChannelSearch(
  channelId: string,
  query: string,
  pageToken: string | null | undefined,
  apiKey: string,
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
  >('search', apiKey, params)

  const videos = await fetchVideos(videoIdsFromId(items), apiKey)

  return {
    videos,
    prevPageToken,
    // there seems to be a bug with the youtube api where it returns
    // a nextPageToken even if there are no more results after this page
    nextPageToken: items.length < RESULTS_PER_PAGE ? undefined : nextPageToken,
  }
}

export async function fetchVideosDataForPlaylist(
  playlistId: string,
  pageToken: string | null | undefined,
  apiKey: string,
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
  >('playlistItems', apiKey, params)

  const videos = await fetchVideos(videoIdsFromContentDetails(items), apiKey)

  return {
    videos,
    prevPageToken,
    // there seems to be a bug with the youtube api where it returns
    // a nextPageToken even if there are no more results after this page
    nextPageToken: items.length < RESULTS_PER_PAGE ? undefined : nextPageToken,
  }
}

async function fetchAllVideosFromPlaylist(
  playlistId: string,
  apiKey: string,
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
  >('playlistItems', apiKey, params)
  const videos = await fetchVideos(videoIdsFromContentDetails(items), apiKey)
  const allVideos = accumulatedVideos.concat(videos)

  if (nextPageToken) {
    return fetchAllVideosFromPlaylist(
      playlistId,
      apiKey,
      nextPageToken,
      allVideos,
    )
  }

  return allVideos
}

export async function fetchVideosDataForPlaylistSearch(
  playlistId: string,
  query: string,
  apiKey: string,
): Promise<VideosData> {
  const videos = await fetchAllVideosFromPlaylist(playlistId, apiKey)
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

export async function fetchVideosDataForAllPlaylists(
  playlistIds: string[],
  apiKey: string,
): Promise<VideoData[]> {
  const fetchVideos = playlistIds.map((playlistId) => {
    return fetchVideosDataForPlaylist(
      playlistId,
      null,
      apiKey,
      RESULTS_PER_PAGE - 10,
    )
  })

  const playlists = await Promise.all(fetchVideos)

  return playlists.flatMap((playlist) => playlist.videos)
}

export async function fetchPlaylistIdForChannel(
  channelId: string,
  apiKey: string,
): Promise<string> {
  const result = await queryYouTube<YouTubeListResult<YouTubeChannelItem>>(
    'channels',
    apiKey,
    {
      id: channelId,
      part: 'contentDetails',
    },
  )

  return result.items[0].contentDetails.relatedPlaylists.uploads
}

export async function fetchChannelDetails(
  channelId: string,
  apiKey: string,
): Promise<ChannelDetails> {
  const result = await queryYouTube<YouTubeListResult<YouTubeChannelItem>>(
    'channels',
    apiKey,
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

export async function fetchPlaylistDetails(
  playlistId: string,
  apiKey: string,
): Promise<PlaylistDetails> {
  const result = await queryYouTube<YouTubeListResult<YouTubePlaylistItem>>(
    'playlists',
    apiKey,
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

export async function fetchPlaylistsForChannel(
  channelId: string,
  pageToken: string | null | undefined,
  apiKey: string,
): Promise<PlaylistsForChannelResult> {
  const params: QueryParams = {
    channelId,
    part: 'contentDetails,snippet',
    maxResults: 50,
  }
  if (pageToken) params.pageToken = pageToken

  const result = await queryYouTube<YouTubeListResult<YouTubePlaylistItem>>(
    'playlists',
    apiKey,
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
