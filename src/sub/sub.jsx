import _ from 'lodash'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'

import util, { icon } from '../lib/util'
import subsStore from '../subs/subs-store'
import videosStore from '../videos/videos-store'

import Paginator from '../paginator/paginator'
import Video from '../videos/video'
import Search from '../search/search'

@observer
class Sub extends Component {
  componentDidMount () {
    this._getVideos()
  }

  componentDidUpdate () {
    this._getVideos()
  }

  _getVideos () {
    const sub = this._getSub()

    if (!sub) return

    const newSearchQuery = this._getSearchQuery()
    const oldSearchQuery = this.searchQuery
    this.searchQuery = newSearchQuery

    const newToken = this._getPageToken()
    const oldToken = this.pageToken
    this.pageToken = newToken

    const newPlaylistId = sub.playlistId
    const oldPlaylistId = this.playlistId
    this.playlistId = newPlaylistId

    if (
      oldPlaylistId !== newPlaylistId
      || oldToken !== newToken
      || oldSearchQuery !== newSearchQuery
    ) {
      if (newSearchQuery) {
        action('get:channel:search:videos', () => {
          videosStore.getVideosDataForChannelSearch(sub, newSearchQuery, newToken)
        })()
      } else if (sub.isCustom) {
        action('get:custom:playlist:videos', () => {
          videosStore.getVideosDataForCustomPlaylist(sub)
        })()
      } else {
        action('get:playlist:videos', () => {
          videosStore.getVideosDataForPlaylist(newPlaylistId, newToken)
        })()
      }
    }
  }

  _getSub () {
    return subsStore.getSubById(this.props.match.params.id)
  }

  _getQuery () {
    return util.parseQueryString(this.props.location.search)
  }

  _getPageToken () {
    return this._getQuery().pageToken
  }

  _getSearchQuery () {
    return this._getQuery().search
  }

  render () {
    const sub = this._getSub()

    if (!subsStore.subs.length) return null

    if (!sub) {
      return <p className='videos-empty'>Please select a sub</p>
    }

    let { isLoading, prevPageToken, nextPageToken } = videosStore

    return (
      <main className='videos'>
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
    if (sub.isCustom) return null

    return (
      <Search
        query={this._getSearchQuery()}
        onSearch={this._onSearchUpdate}
      />
    )
  }

  _videos () {
    if (!videosStore.videos.length) {
      return (
        <div className='videos-empty'>
          <i className='fa fa-film'></i>
          No videos
          <i className='fa fa-film'></i>
        </div>
      )
    }

    return _.map(videosStore.videos, (video) => {
      const id = video.id

      return (
        <Video
          key={id}
          onPlay={_.partial(this._playVideo, id)}
          subs={subsStore.subs}
          video={video}
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
    window.hist.push({
      pathname: this.props.location.pathname,
      search: util.stringifyQueryString(_.extend({}, this._getQuery(), { nowPlaying: id })),
    })
  }

  _onSearchUpdate = (search) => {
    window.hist.push({
      pathname: this.props.location.pathname,
      search: util.stringifyQueryString(_.extend({}, this._getQuery(), {
        search: search || undefined,
        pageToken: undefined,
      })),
    })
  }
}

export default Sub
