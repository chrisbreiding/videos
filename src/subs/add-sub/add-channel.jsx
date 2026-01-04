import cs from 'classnames'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useState, useEffect, useRef } from 'react'

import { icon } from '../../lib/util'
import videosService from '../../videos/videos-service'
import subsStore from '../subs-store'

export const AddChannel = inject('router')(observer(({ router, match }) => {
  const [loadingPlaylists, setLoadingPlaylists] = useState({})
  const [loadingMorePlaylists, setLoadingMorePlaylists] = useState({})
  const [playlists, setPlaylists] = useState({})
  const [playlistFilters, setPlaylistFilters] = useState({})

  const queryInputRef = useRef(null)
  const prevQueryRef = useRef('')

  const getQuery = () => match.params.query || ''

  const search = () => {
    const query = getQuery()
    const oldQuery = prevQueryRef.current
    if (!query || query === oldQuery) return
    prevQueryRef.current = query
    queryInputRef.current.value = query
    subsStore.search(query)
  }

  useEffect(() => {
    queryInputRef.current.focus()
    return () => {
      subsStore.setSearchResults([])
    }
  }, [])

  useEffect(() => {
    search()
  })

  const updateSearch = (searchTerm) => {
    router.push(`/add-channel/${encodeURIComponent(searchTerm)}`)
  }

  const searchSubs = (e) => {
    e.preventDefault()
    updateSearch(queryInputRef.current.value)
  }

  const onAddChannel = (channel) => {
    subsStore.addChannel(channel)
  }

  const onAddPlaylist = (playlist) => {
    subsStore.addPlaylist(playlist)
  }

  const onFilterChange = (channelId, value) => {
    setPlaylistFilters((prev) => ({ ...prev, [channelId]: value }))
  }

  const loadPlaylists = (channelId) => {
    setLoadingPlaylists((prev) => ({ ...prev, [channelId]: true }))

    videosService.getPlaylistsForChannel(channelId).then((playlistsData) => {
      setLoadingPlaylists((prev) => ({ ...prev, [channelId]: false }))
      setPlaylists((prev) => ({ ...prev, [channelId]: playlistsData }))
    })
  }

  const loadMorePlaylists = (channelId, pageToken) => {
    setLoadingMorePlaylists((prev) => ({ ...prev, [channelId]: true }))

    videosService.getPlaylistsForChannel(channelId, pageToken).then((newPlaylists) => {
      setLoadingMorePlaylists((prev) => ({ ...prev, [channelId]: false }))
      setPlaylists((prev) => ({
        ...prev,
        [channelId]: {
          ...newPlaylists,
          videos: [...prev[channelId].videos, ...newPlaylists.videos],
        },
      }))
    })
  }

  const hidePlaylists = (channelId) => {
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

  const renderPlaylists = (channelId, playlistData) => {
    const filter = playlistFilters[channelId] || ''
    const filteredPlaylists = filter
      ? playlistData.videos.filter((p) => p.title.toLowerCase().includes(filter.toLowerCase()))
      : playlistData.videos
    const isLoadingMore = loadingMorePlaylists[channelId]

    return (
      <div className='playlists-section'>
        <div className='playlist-filter'>
          <input
            placeholder='Filter playlists'
            value={filter}
            onChange={(e) => onFilterChange(channelId, e.target.value)}
          />
          {filter && (
            <span className='filter-count'>{filteredPlaylists.length} matching</span>
          )}
        </div>
        <ul className='playlists-list'>
          {filteredPlaylists.map((playlist) => {
            const isPlaylistSubscribed = subsStore.isPlaylistSubscribed(playlist.id)

            return (
              <li key={playlist.id} className={`playlist-item${isPlaylistSubscribed ? ' is-subscribed' : ''}`}>
                <img src={playlist.thumb} />
                <div className='playlist-details'>
                  <h4>{playlist.title}</h4>
                  <span className='playlist-count'>{playlist.count} videos</span>
                </div>
                {isPlaylistSubscribed ? (
                  <span className='subscribed-indicator'>{icon('check')}</span>
                ) : (
                  <button onClick={_.partial(onAddPlaylist, playlist)}>{icon('plus')}</button>
                )}
              </li>
            )
          })}
        </ul>
        {playlistData.nextPageToken && (
          <div className='load-more-button-container'>
            <button
              className='load-more-button'
              onClick={() => loadMorePlaylists(channelId, playlistData.nextPageToken)}
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
    return subsStore.searchResults.map((channel) => {
      const channelPlaylistData = playlists[channel.id]
      const isLoading = loadingPlaylists[channel.id]
      const isSubscribed = subsStore.isChannelSubscribed(channel.id)

      return (
        <li key={channel.id} className={cs('channel-item', { 'is-subscribed': isSubscribed })}>
          <div className='channel-info'>
            <img src={channel.thumb} />
            <div className='channel-details'>
              <h3>{channel.title || channel.author}</h3>
              <button
                className='load-playlists-button'
                onClick={() => channelPlaylistData ? hidePlaylists(channel.id) : loadPlaylists(channel.id)}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : channelPlaylistData ? 'Hide playlists' : 'Load playlists'}
              </button>
            </div>
            {isSubscribed ? (
              <span className='subscribed-indicator'>{icon('check')}</span>
            ) : (
              <button className='add-button' onClick={_.partial(onAddChannel, channel)}>{icon('plus')}</button>
            )}
          </div>
          {channelPlaylistData && renderPlaylists(channel.id, channelPlaylistData)}
        </li>
      )
    })
  }

  return (
    <div className='add-sub add-channel'>
      <form onSubmit={searchSubs}>
        <input ref={queryInputRef} placeholder='Search Channels' defaultValue={getQuery()} />
        <button>{icon('search')}</button>
      </form>
      <ul className='channels-list'>{renderResults()}</ul>
    </div>
  )
}))
