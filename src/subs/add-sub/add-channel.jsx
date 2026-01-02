import { inject, observer } from 'mobx-react'
import _ from 'lodash'
import React, { Component } from 'react'

import { icon } from '../../lib/util'
import videosService from '../../videos/videos-service'
import subsStore from '../subs-store'

@inject('router')
@observer
class AddChannel extends Component {
  state = {
    loadingPlaylists: {},
    loadingMorePlaylists: {},
    playlists: {},
    playlistFilters: {},
  }

  componentDidMount () {
    this._search()
    this.refs.query.focus()
  }

  componentDidUpdate () {
    this._search()
  }

  componentWillUnmount () {
    subsStore.setSearchResults([])
  }

  _getQuery () {
    return this.props.match.params.query || ''
  }

  _search () {
    const query = this._getQuery()
    const oldQuery = this.query
    if (!query || query === oldQuery) return
    this.query = query
    this.refs.query.value = query
    subsStore.search(query)
  }

  _updateSearch = (search) => {
    this.props.router.push(`/add-channel/${encodeURIComponent(search)}`)
  }

  render () {
    return (
      <div className='add-sub add-channel'>
        <form onSubmit={this._searchSubs}>
          <input ref='query' placeholder='Search Channels' defaultValue={this._getQuery()} />
          <button>{icon('search')}</button>
        </form>
        <ul className='channels-list'>{this._results()}</ul>
      </div>
    )
  }

  _results () {
    return subsStore.searchResults.map((channel) => {
      const channelPlaylistData = this.state.playlists[channel.id]
      const isLoading = this.state.loadingPlaylists[channel.id]

      return (
        <li key={channel.id} className='channel-item'>
          <div className='channel-info'>
            <img src={channel.thumb} />
            <div className='channel-details'>
              <h3>{channel.title || channel.author}</h3>
              <button
                className='load-playlists-button'
                onClick={() => channelPlaylistData ? this._hidePlaylists(channel.id) : this._loadPlaylists(channel.id)}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : channelPlaylistData ? 'Hide playlists' : 'Load playlists'}
              </button>
            </div>
            <button className='add-button' onClick={_.partial(this._onAddChannel, channel)}>{icon('plus')}</button>
          </div>
          {channelPlaylistData && this._renderPlaylists(channel.id, channelPlaylistData)}
        </li>
      )
    })
  }

  _renderPlaylists (channelId, playlistData) {
    const filter = this.state.playlistFilters[channelId] || ''
    const filteredPlaylists = filter
      ? playlistData.videos.filter((p) => p.title.toLowerCase().includes(filter.toLowerCase()))
      : playlistData.videos
    const isLoadingMore = this.state.loadingMorePlaylists[channelId]

    return (
      <div className='playlists-section'>
        <div className='playlist-filter'>
          <input
            placeholder='Filter playlists'
            value={filter}
            onChange={(e) => this._onFilterChange(channelId, e.target.value)}
          />
          {filter && (
            <span className='filter-count'>{filteredPlaylists.length} matching</span>
          )}
        </div>
        <ul className='playlists-list'>
          {filteredPlaylists.map((playlist) => (
            <li key={playlist.id} className='playlist-item'>
              <img src={playlist.thumb} />
              <div className='playlist-details'>
                <h4>{playlist.title}</h4>
                <span className='playlist-count'>{playlist.count} videos</span>
              </div>
              <button onClick={_.partial(this._onAddPlaylist, playlist)}>{icon('plus')}</button>
            </li>
          ))}
        </ul>
        {playlistData.nextPageToken && (
          <div className='load-more-button-container'>
            <button
              className='load-more-button'
              onClick={() => this._loadMorePlaylists(channelId, playlistData.nextPageToken)}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </div>
    )
  }

  _onFilterChange = (channelId, value) => {
    this.setState({
      playlistFilters: { ...this.state.playlistFilters, [channelId]: value },
    })
  }

  _loadPlaylists = (channelId) => {
    this.setState({
      loadingPlaylists: { ...this.state.loadingPlaylists, [channelId]: true },
    })

    videosService.getPlaylistsForChannel(channelId).then((playlists) => {
      this.setState({
        loadingPlaylists: { ...this.state.loadingPlaylists, [channelId]: false },
        playlists: { ...this.state.playlists, [channelId]: playlists },
      })
    })
  }

  _loadMorePlaylists = (channelId, pageToken) => {
    this.setState({
      loadingMorePlaylists: { ...this.state.loadingMorePlaylists, [channelId]: true },
    })

    videosService.getPlaylistsForChannel(channelId, pageToken).then((newPlaylists) => {
      const existingData = this.state.playlists[channelId]
      this.setState({
        loadingMorePlaylists: { ...this.state.loadingMorePlaylists, [channelId]: false },
        playlists: {
          ...this.state.playlists,
          [channelId]: {
            ...newPlaylists,
            videos: [...existingData.videos, ...newPlaylists.videos],
          },
        },
      })
    })
  }

  _hidePlaylists = (channelId) => {
    const playlists = { ...this.state.playlists }
    const playlistFilters = { ...this.state.playlistFilters }

    delete playlists[channelId]
    delete playlistFilters[channelId]

    this.setState({ playlists, playlistFilters })
  }

  _searchSubs = (e) => {
    e.preventDefault()
    this._updateSearch(this.refs.query.value)
  }

  _onAddChannel = (channel) => {
    subsStore.addChannel(channel)
  }

  _onAddPlaylist = (playlist) => {
    subsStore.addPlaylist(playlist)
  }
}

export default AddChannel
