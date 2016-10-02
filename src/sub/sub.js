import _ from 'lodash'
import { Component, DOM } from 'react'
// import { History } from 'react-router'
// import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin'
import moment from 'moment'
import SubStore from './sub-store'
import subActions from './sub-actions'
import SubsStore from '../subs/subs-store'
import subsActions from '../subs/subs-actions'
import VideosStore from '../videos/videos-store'
import videosActions from '../videos/videos-actions'
import Paginator from '../paginator/paginator'
import Video from '../videos/video'
import { icon } from '../lib/util'
import Search from '../search/search'


class Sub extends Component {
  // mixins: [ReactStateMagicMixin, History],

  statics: {
    registerStores: {
      sub: SubStore,
      subs: SubsStore,
      videos: VideosStore,
    }
  }

  componentDidMount () {
    subActions.getSub(this._getId())
    subsActions.fetch()
  }

  componentDidUpdate (__, prevState) {
    const newId = this._getId()
    const oldId = prevState.sub.id

    const newPlaylistId = this.state.sub.sub.get('playlistId')
    const oldPlaylistId = prevState.sub.sub.get('playlistId')

    const newSearchQuery = this._getSearchQuery()
    const oldSearchQuery = this.searchQuery
    this.searchQuery = newSearchQuery

    const newToken = this._getPageToken()
    const oldToken = this.pageToken
    this.pageToken = newToken

    if (oldId !== newId) {
      subActions.getSub(newId)
    } else if (
      oldPlaylistId !== newPlaylistId
      || oldToken !== newToken
      || oldSearchQuery !== newSearchQuery
    ) {
      setTimeout(() => {
        if (newSearchQuery) {
          videosActions.getVideosDataForChannelSearch(
            this.state.sub.sub.get('id'),
            newSearchQuery,
            newToken
          )
        } else if (this.state.sub.sub.get('custom')) {
          videosActions.getVideosDataForCustomPlaylist(newId)
        } else {
          videosActions.getVideosDataForPlaylist(newPlaylistId, newToken)
        }
      })
    }
  }

  _getId () {
    return this.props.params.id
  }

  _getPageToken () {
    return this.props.location.query.pageToken
  }

  _getSearchQuery () {
    return this.props.location.query.search
  }

  render () {
    let { isLoading, prevPageToken, nextPageToken } = this.state.videos
    if (isLoading) {
      nextPageToken = undefined
      prevPageToken = undefined
    }
    return DOM.div(null,
      Paginator({ prevPageToken, nextPageToken }, this._search()),
      isLoading ? this._loader() : this._videos(),
      Paginator({ prevPageToken, nextPageToken })
    )
  }

  _search () {
    if (this.state.sub.sub.get('custom')) return null

    return Search({ query: this._getSearchQuery(), onSearch: this._onSearchUpdate })
  }

  _videos () {
    if (!this.state.videos.videos.size) {
      return DOM.div({ className: 'empty' }, 'No videos')
    }

    const isCustom = this.state.sub.sub.get('custom')

    return this.state.videos.videos
      .sort((video1, video2) => {
        const method = isCustom ? 'isAfter' : 'isBefore'
        return moment(video1.get('published'))[method](video2.get('published')) ? 1 : -1
      })
      .map((video) => {
        const id = video.get('id')

        return Video({
          key: id,
          onPlay: _.partial(this._playVideo, id),
          subs: this.state.subs.subs,
          video,
          addedToPlaylist: (playlist) => subsActions.addVideoToPlaylist(playlist, id),
          removedFromPlaylist: (playlist) => subsActions.removeVideoFromPlaylist(playlist, id),
        })
      })
  }

  _loader () {
    return DOM.div({ className: 'loader' },
      icon('spin fa-play-circle'),
      icon('spin fa-play-circle'),
      icon('spin fa-play-circle')
    )
  }

  _playVideo (id) {
    const query = _.extend({}, this.props.location.query, { nowPlaying: id })
    this.history.pushState(null, this.props.location.pathname, query)
  }

  _onSearchUpdate (search) {
    const query = _.extend({}, this.props.location.query, {
      search: search || undefined,
      pageToken: undefined,
    })
    this.history.pushState(null, this.props.location.pathname, query)
  }
}

export default Sub
