import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import DocumentTitle from 'react-document-title'

import { icon, parseQueryString, updatedLink } from '../lib/util'
import subsStore from '../subs/subs-store'
import videosStore from '../videos/videos-store'

import Paginator from '../paginator/paginator'
import Video from '../videos/video'
import Search from '../search/search'
import appState from '../app/app-state'

@inject('router')
@observer
class Sub extends Component {
  componentDidMount () {
    this._getVideos()
  }

  componentDidUpdate () {
    this._getVideos()

    const marker = this._getQuery().marker

    if (marker) {
      document.querySelector(`#${marker}`)?.scrollIntoView()
    }
  }

  _getVideos () {
    if (videosStore.isLoading) return

    const sub = this._getSub()

    const oldSearchQuery = this.searchQuery
    const newSearchQuery = this._getSearchQuery()
    this.searchQuery = newSearchQuery

    const oldToken = this.pageToken
    const newToken = this._getPageToken()
    this.pageToken = newToken

    const oldPlaylistId = this.playlistId
    const newPlaylistId = sub && sub.playlistId
    this.playlistId = newPlaylistId

    if (this._shouldLoadAllPlaylists(sub, oldPlaylistId, newPlaylistId)) {
      this._isAllSubs = true
      videosStore.getVideosDataForAllPlaylists(subsStore.channelIds)

      return
    }

    if (
      oldPlaylistId !== newPlaylistId
      || oldToken !== newToken
      || oldSearchQuery !== newSearchQuery
    ) {
      this._isAllSubs = false

      if (newSearchQuery) {
        videosStore.getVideosDataForChannelSearch(sub, newSearchQuery, newToken)
      } else if (sub.isCustom) {
        videosStore.getVideosDataForCustomPlaylist(sub)
      } else {
        videosStore.getVideosDataForPlaylist(newPlaylistId, newToken)
      }
    }
  }

  _getSub () {
    return subsStore.getSubById(this.props.match.params.id)
  }

  _getQuery () {
    return parseQueryString(this.props.location.search)
  }

  _getPageToken () {
    return this._getQuery().pageToken
  }

  _getSearchQuery () {
    return this._getQuery().search
  }

  _isAllPlaylists () {
    return !this.props.match.params.id
  }

  _shouldLoadAllPlaylists (sub, oldPlaylistId, newPlaylistId) {
    if (sub) return false
    if (oldPlaylistId && !newPlaylistId) return true
    if (videosStore.hasLoadedAllPlaylists) return false

    return true
  }

  render () {
    const sub = this._getSub()

    if (!subsStore.subs.length) return null

    const { isLoading, prevPageToken, nextPageToken } = videosStore
    const nowPlaying = this._getQuery().nowPlaying

    return (
      <main className='videos'>
        {!nowPlaying && (
          <DocumentTitle title={`${sub?.title || 'All Subs'} | Videos`} />
        )}
        <Paginator
          location={this.props.location}
          prevPageToken={prevPageToken}
          nextPageToken={nextPageToken}
        >
          {this._search(sub)}
        </Paginator>
        {isLoading ? this._loader() : this._videos(sub)}
        <Paginator
          location={this.props.location}
          prevPageToken={prevPageToken}
          nextPageToken={nextPageToken}
        />
      </main>
    )
  }

  _search (sub) {
    if (!sub || sub.isCustom) return null

    return (
      <Search
        query={this._getSearchQuery()}
        onSearch={this._onSearchUpdate}
      />
    )
  }

  _videos (sub) {
    if (!videosStore.videos.length) {
      return (
        <div className='videos-empty'>
          <i className='fa fa-film'></i>
          No videos
          <i className='fa fa-film'></i>
        </div>
      )
    }

    const markedVideoId = this._isAllSubs ? appState.allSubsMarkedVideoId :
      sub ? sub.markedVideoId :
        null

    return _.map(videosStore.videos, (video) => {
      const id = video.id

      return (
        <Video
          key={id}
          location={this.props.location}
          onPlay={_.partial(this._playVideo, id)}
          playLink={this._playVideoLink(id)}
          addVideoMarkerLink={this._updateVideoMarkerLink}
          subs={subsStore.subs}
          video={video}
          isMarked={id === markedVideoId}
          onRemoveMark={this._removeVideoMark}
          channelImage={this._isAllPlaylists() && subsStore.getChannelImage(video.channelId)}
          addedToPlaylist={(playlist) => subsStore.addVideoToPlaylist(playlist, id)}
          removedFromPlaylist={(playlist) => subsStore.removeVideoFromPlaylist(playlist, id)}
        />
      )
    })
  }

  _loader () {
    return (
      <div className='loader'>
        {icon('spin fa-play-circle')}
        {icon('spin fa-play-circle')}
        {icon('spin fa-play-circle')}
      </div>
    )
  }

  _playVideo = (id) => {
    this._updateVideoMark(id)
  }

  _playVideoLink (id) {
    return updatedLink(this.props.location, { search: { nowPlaying: id } })
  }

  _removeVideoMark = () => {
    this._updateVideoMark()
    this._updateVideoMarkerLink()
  }

  _updateVideoMarkerLink = (marker) => {
    this.props.router.replace(updatedLink(this.props.location, {
      search: { marker },
    }))
  }

  _updateVideoMark (id) {
    const sub = this._getSub()

    if (this._isAllSubs) {
      appState.setAllSubsMarkedVideoId(id)
    } else if (sub) {
      subsStore.update(sub.id, { markedVideoId: id })
    }
  }

  _onSearchUpdate = (searchTerm) => {
    this.props.router.push(updatedLink(this.props.location, {
      search: {
        search: searchTerm || undefined,
        pageToken: undefined,
      },
    }))
  }
}

export default Sub
