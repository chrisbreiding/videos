import cs from 'classnames'
import _ from 'lodash'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { matchPath } from 'react-router'
import { Route, Switch } from 'react-router-dom'

import appState from './app-state'
import authStore from '../login/auth-store'
import subsStore from '../subs/subs-store'
import videosStore from '../videos/videos-store'
import { onAuthStateChanged, watchDoc } from '../lib/firebase'
import { icon, parseQueryString, updatedLink } from '../lib/util'

import Migrate from './migrate'
import NowPlaying from '../now-playing/now-playing'
import Resizer from './resizer'
import Subs from '../subs/subs'
import Sub from '../sub/sub'

@inject('router')
@observer
class App extends Component {
  @observable isResizing = false
  unsubscribers = []

  componentDidMount () {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        authStore.setUserId(user.uid)
        return this._getApiKey()
      }

      appState.setSavedLocation(this.props.location)
      this.props.router.push({ pathname: '/login' })
    })

    this.unsubscribers.push(unsubscribe)
  }

  componentWillUnmount () {
    _.each(this.unsubscribers, (unsubscribe) => {
      unsubscribe()
    })
  }

  async _getApiKey () {
    const unsubscribe = watchDoc(async (data) => {
      if (data.subs) {
        subsStore.setSubs(data.subs)
      }

      if (data.allSubsMarkedVideoId) {
        appState.setAllSubsMarkedVideoId(data.allSubsMarkedVideoId, false)
      }

      const apiKey = data.youtubeApiKey

      if (apiKey) {
        const isValid = await authStore.checkApiKey(apiKey)

        if (isValid) {
          authStore.setApiKey(apiKey)
        }
      }

      // TODO: handle missing or invalid api key
    })

    this.unsubscribers.push(unsubscribe)
  }

  render () {
    if (!authStore.isAuthenticated) {
      return (
        <div className='loader'>
          {icon('sign-in')} Authenticating...
        </div>
      )
    }

    if (this.props.location.pathname === '/migrate') {
      return <Migrate />
    }

    const nowPlayingId = this._nowPlayingId()

    return (
      <div
        className={cs('app', {
          'is-resizing': this.isResizing,
          'is-sorting': appState.isSorting,
        })}
        style={{ height: appState.windowHeight }}
      >
        <NowPlaying
          autoPlayEnabled={appState.autoPlayEnabled}
          id={nowPlayingId}
          playlists={subsStore.playlists}
          closeLink={this._closeNowPlayingLink}
          onEnd={this._onVideoEnded}
          onToggleAutoPlay={appState.toggleAutoPlay}
          addedToPlaylist={(playlist) => subsStore.addVideoToPlaylist(playlist, nowPlayingId)}
          removedFromPlaylist={(playlist) => subsStore.removeVideoFromPlaylist(playlist, nowPlayingId)}
        />
        <Resizer
          height={appState.nowPlayingHeight}
          onResizeStart={this._startResizing}
          onResize={this._updateNowPlayingHeight}
          onResizeEnd={this._endResizing}
        />
        <div className='subs'>
          <Subs
            {...this.props}
            onSortStart={this._onSortStart}
            onSortEnd={this._onSortEnd}
          />
          <Switch>
            <Route exact path='/' component={Sub} />
            <Route path='/subs/:id/page/:pageToken' component={Sub} />
            <Route path='/subs/:id' component={Sub} />
          </Switch>
        </div>
      </div>
    )
  }

  _nowPlayingId () {
    return this._getQuery().nowPlaying
  }

  _closeNowPlayingLink = () => {
    return updatedLink(this.props.location, {
      search: { nowPlaying: undefined },
    })
  }

  _getQuery () {
    return parseQueryString(this.props.location.search)
  }

  _onVideoEnded = () => {
    if (!appState.autoPlayEnabled) return

    const nextVideoId = videosStore.nextVideoId(this._nowPlayingId())
    if (!nextVideoId) return

    const match = matchPath(this.props.location.pathname, {
      path: '/subs/:id',
    })

    if (match) {
      const subId = match.params.id
      const sub = subsStore.getSubById(subId)

      if (!subId) {
        appState.setAllSubsMarkedVideoId(nextVideoId)
      } else if (sub) {
        subsStore.update(sub.id, { markedVideoId: nextVideoId })
      }
    }

    this.props.router.push(updatedLink(this.props.location, {
      search: { nowPlaying: nextVideoId },
    }))
  }

  @action _startResizing = () => {
    this.isResizing = true
  }

  _updateNowPlayingHeight = (height) => {
    appState.updateNowPlayingHeight(height)
  }

  @action _endResizing = () => {
    this.isResizing = false
  }

  _onSortStart = () => {
    appState.setSorting(true)
  }

  _onSortEnd = () => {
    appState.setSorting(false)
  }
}

export default App
