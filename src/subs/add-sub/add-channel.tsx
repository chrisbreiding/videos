import cs from 'classnames'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router'

import { Icon } from '../../lib/util'
import { useVideosContext } from '../../videos/videos-context'
import { useSubsContext } from '../subs-context'
import type {
  ChannelSearchResult,
  PlaylistSummary,
  PlaylistsForChannelResult,
} from '../../lib/types'

export const AddChannel = () => {
  const {
    searchResults,
    setSearchResults,
    search: searchChannels,
    addChannel,
    addPlaylist,
    isChannelSubscribed,
    isPlaylistSubscribed,
  } = useSubsContext()
  const { fetchPlaylistsForChannel } = useVideosContext()

  const navigate = useNavigate()
  const params = useParams()
  const [loadingPlaylists, setLoadingPlaylists] = useState<
    Record<string, boolean>
  >({})
  const [loadingMorePlaylists, setLoadingMorePlaylists] = useState<
    Record<string, boolean>
  >({})
  const [playlists, setPlaylists] = useState<
    Record<string, PlaylistsForChannelResult>
  >({})
  const [playlistFilters, setPlaylistFilters] = useState<
    Record<string, string>
  >({})

  const queryInputRef = useRef<HTMLInputElement>(null)
  const prevQueryRef = useRef('')

  const getQuery = () => params.query || ''

  const search = () => {
    const query = getQuery()
    const oldQuery = prevQueryRef.current
    if (!query || query === oldQuery) return
    prevQueryRef.current = query
    queryInputRef.current!.value = query
    searchChannels(query)
  }

  useEffect(() => {
    queryInputRef.current!.focus()
    return () => {
      setSearchResults([])
    }
  }, [setSearchResults])

  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.query])

  const updateSearch = (searchTerm: string) => {
    navigate(`/add-channel/${encodeURIComponent(searchTerm)}`)
  }

  const searchSubs = (e: React.FormEvent) => {
    e.preventDefault()
    updateSearch(queryInputRef.current!.value)
  }

  const onAddChannel = (channel: ChannelSearchResult) => {
    addChannel(channel)
  }

  const onAddPlaylist = (playlist: PlaylistSummary) => {
    addPlaylist(playlist)
  }

  const onFilterChange = (channelId: string, value: string) => {
    setPlaylistFilters((prev) => ({ ...prev, [channelId]: value }))
  }

  const loadPlaylists = async (channelId: string) => {
    setLoadingPlaylists((prev) => ({ ...prev, [channelId]: true }))

    const playlistsData = await fetchPlaylistsForChannel(channelId)

    setLoadingPlaylists((prev) => ({ ...prev, [channelId]: false }))
    setPlaylists((prev) => ({ ...prev, [channelId]: playlistsData }))
  }

  const loadMorePlaylists = async (channelId: string, pageToken?: string) => {
    setLoadingMorePlaylists((prev) => ({ ...prev, [channelId]: true }))

    const newPlaylists = await fetchPlaylistsForChannel(channelId, pageToken)

    setLoadingMorePlaylists((prev) => ({ ...prev, [channelId]: false }))
    setPlaylists((prev) => ({
      ...prev,
      [channelId]: {
        ...newPlaylists,
        videos: [...prev[channelId].videos, ...newPlaylists.videos],
      },
    }))
  }

  const hidePlaylists = (channelId: string) => {
    setPlaylists((prev) => {
      const updated = { ...prev }
      delete updated[channelId]
      return updated
    })
    setPlaylistFilters((prev) => {
      const updated = { ...prev }
      delete updated[channelId]
      return updated
    })
  }

  const renderPlaylists = (
    channelId: string,
    playlistData: PlaylistsForChannelResult,
  ) => {
    const filter = playlistFilters[channelId] || ''
    const filteredPlaylists = filter
      ? playlistData.videos.filter((p) =>
          p.title.toLowerCase().includes(filter.toLowerCase()),
        )
      : playlistData.videos
    const isLoadingMore = loadingMorePlaylists[channelId]

    return (
      <div className="playlists-section">
        <div className="playlist-filter">
          <input
            placeholder="Filter playlists"
            value={filter}
            onChange={(e) => onFilterChange(channelId, e.target.value)}
          />
          {filter && (
            <span className="filter-count">
              {filteredPlaylists.length} matching
            </span>
          )}
        </div>
        <ul className="playlists-list">
          {filteredPlaylists.map((playlist) => {
            const isSubscribed = isPlaylistSubscribed(playlist.id)

            return (
              <li
                key={playlist.id}
                className={`playlist-item${isSubscribed ? ' is-subscribed' : ''}`}
              >
                <img src={playlist.thumb} />
                <div className="playlist-details">
                  <h4>{playlist.title}</h4>
                  <span className="playlist-count">
                    {playlist.count} videos
                  </span>
                </div>
                {isSubscribed ? (
                  <span className="subscribed-indicator">
                    <Icon name="check" />
                  </span>
                ) : (
                  <button onClick={() => onAddPlaylist(playlist)}>
                    <Icon name="plus" />
                  </button>
                )}
              </li>
            )
          })}
        </ul>
        {playlistData.nextPageToken && (
          <div className="load-more-button-container">
            <button
              className="load-more-button"
              onClick={() =>
                loadMorePlaylists(channelId, playlistData.nextPageToken)
              }
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderResults = () => {
    return searchResults.map((channel) => {
      const channelPlaylistData = playlists[channel.id]
      const isLoading = loadingPlaylists[channel.id]
      const isSubscribed = isChannelSubscribed(channel.id)

      return (
        <li
          key={channel.id}
          className={cs('channel-item', { 'is-subscribed': isSubscribed })}
        >
          <div className="channel-info">
            <img src={channel.thumb} />
            <div className="channel-details">
              <h3>{channel.title}</h3>
              <button
                className="load-playlists-button"
                onClick={() =>
                  channelPlaylistData
                    ? hidePlaylists(channel.id)
                    : loadPlaylists(channel.id)
                }
                disabled={isLoading}
              >
                {isLoading
                  ? 'Loading...'
                  : channelPlaylistData
                    ? 'Hide playlists'
                    : 'Load playlists'}
              </button>
            </div>
            {isSubscribed ? (
              <span className="subscribed-indicator">
                <Icon name="check" />
              </span>
            ) : (
              <button
                className="add-button"
                onClick={() => onAddChannel(channel)}
              >
                <Icon name="plus" />
              </button>
            )}
          </div>
          {channelPlaylistData &&
            renderPlaylists(channel.id, channelPlaylistData)}
        </li>
      )
    })
  }

  return (
    <div className="add-sub add-channel">
      <form onSubmit={searchSubs}>
        <input
          ref={queryInputRef}
          placeholder="Search Channels"
          defaultValue={getQuery()}
        />
        <button>
          <Icon name="search" />
        </button>
      </form>
      <ul className="channels-list">{renderResults()}</ul>
    </div>
  )
}
