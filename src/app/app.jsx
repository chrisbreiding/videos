import cs from 'classnames'
import _ from 'lodash'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import { createHashHistory } from 'history'

import appState from './app-state'
import authStore from '../login/auth-store'
import videosStore from '../videos/videos-store'
import { parseQueryString, stringifyQueryString } from '../lib/util'

import NowPlaying from '../now-playing/now-playing'
import Resizer from './resizer'
import Subs from '../subs/subs'
import Sub from '../sub/sub'

window.hist = createHashHistory()

@observer
class App extends Component {
  @observable isResizing = false

  componentDidMount () {
    authStore.getApiKey()
    .then((apiKey) => {
      return authStore.checkApiKey(apiKey).then((isValid) => {
        return { apiKey, isValid }
      })
    })
    .then(({ apiKey, isValid }) => {
      if (isValid) {
        action('app:set:api:key', () => {
          authStore.setApiKey(apiKey)
        })()
      } else {
        window.hist.push({ pathname: '/login' })
      }
    })
  }

  render () {
    if (!authStore.isAuthenticated) {
      return (
        <div className='loader'>
          <i className='fa fa-sign-in'></i> Authenticating...
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
          onClose={this._closeNowPlaying}
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

  _closeNowPlaying = () => {
    window.hist.push({
      pathname: this.props.location.pathname,
      search: stringifyQueryString(_.omit(this._getQuery(), 'nowPlaying')),
    })
  }

  _getQuery () {
    return parseQueryString(this.props.location.search)
  }

  _onVideoEnded = () => {
    if (!appState.autoPlayEnabled) return

    const nextVideoId = videosStore.nextVideoId(this._nowPlayingId())
    if (nextVideoId) {
      window.hist.push({
        pathname: this.props.location.pathname,
        search: stringifyQueryString(_.extend({}, this._getQuery(), { nowPlaying: nextVideoId })),
      })
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
