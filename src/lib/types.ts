// Shared domain types for the app.

import { IconName } from '../../generated/font-awesome'

export interface RemoteIconConfig {
  icon: string
  foregroundColor: string
  backgroundColor: string
}
export interface IconConfig {
  icon: IconName
  foregroundColor: string
  backgroundColor: string
}

export interface WatchedVideo {
  watchTimestamp: number
  updatedAt: string
}

export type WatchedVideos = Record<string, WatchedVideo>

// A video as returned by the YouTube data layer.
export interface VideoData {
  id: string
  channelId: string
  title: string
  description: string
  published: string
  thumb: string
  duration: string
  order?: number
}

// A page of videos plus paging tokens.
export interface VideosData {
  videos: VideoData[]
  prevPageToken?: string | null
  nextPageToken?: string | null
}

export interface ChannelSearchResult {
  id: string
  title: string
  author: string
  thumb: string
}

export interface ChannelDetails {
  id: string
  title: string
  thumb: string
}

export interface PlaylistDetails {
  id: string
  title: string
  thumb: string
}

// A playlist as summarized on the "add channel" screen.
export interface PlaylistSummary {
  author: string
  channelId: string
  count: number
  description: string
  id: string
  published: string
  thumb: string
  title: string
}

export interface PlaylistsForChannelResult {
  nextPageToken?: string
  totalResults: number
  videos: PlaylistSummary[]
}

export type SubType = 'channel' | 'playlist' | 'custom'

// A video stored on a custom playlist (only id + order are persisted).
export interface CustomPlaylistVideo {
  id: string
  order?: number
}

// Props used to construct a SubModel and the serialized shape stored remotely.
export interface SubProps {
  author?: string
  icon?: RemoteIconConfig
  id: string
  type: SubType
  order?: number
  playlistId?: string
  thumb?: string
  title?: string
  markedVideoId?: string | null
  bookmarkedPageToken?: string | null
  videos?: Record<string, CustomPlaylistVideo>
}

// A minimal location shape (compatible with react-router's Location) used when
// building links.
export interface LinkLocation {
  pathname: string
  search?: string
}

export interface LinkUpdates {
  pathname?: string
  search?: Record<string, string | undefined>
}

export type ParsedQuery = Record<string, string | undefined>
