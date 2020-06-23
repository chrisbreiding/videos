import cs from 'classnames'
import _ from 'lodash'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'

import appState from './app-state'
import authStore from '../login/auth-store'
import subsStore from '../subs/subs-store'
import videosStore from '../videos/videos-store'
import { watchDoc } from '../lib/firebase'
import { icon, parseQueryString, updatedLink } from '../lib/util'

import NowPlaying from '../now-playing/now-playing'
import Resizer from './resizer'
import Subs from '../subs/subs'
import Sub from '../sub/sub'

@inject('router')
@observer
class App extends Component {
  @observable isResizing = false

  componentDidMount () {
    authStore.onChange((user) => {
      if (!user) {
        return this.props.router.push({ pathname: '/login' })
      }

      this._getApiKey()
    })
  }

  componentWillUnmount () {
    if (this.stopListening) {
      this.stopListening()
    }
  }

  async _getApiKey () {
    this.stopListening = watchDoc(async (data) => {
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

  }

  render () {
    if (!authStore.isAuthenticated) {
      return (
        <div className='loader'>
          {icon('sign-in')} Authenticating...
        </div>
      )
    }

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
          id={this._nowPlayingId()}
          closeLink={this._closeNowPlayingLink}
          onEnd={this._onVideoEnded}
          onToggleAutoPlay={appState.toggleAutoPlay}
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
    if (nextVideoId) {
      // TODO: update video mark

      this.props.router.push(updatedLink(this.props.location, {
        search: { nowPlaying: nextVideoId },
      }))
    }
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
