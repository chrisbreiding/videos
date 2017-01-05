import cs from 'classnames'
import _ from 'lodash'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Match } from 'react-router'

import appState from './app-state'
import authStore from '../login/auth-store'
import propTypes from '../lib/prop-types'
import subsStore from '../subs/subs-store'
import videosStore from '../videos/videos-store'

import NowPlaying from '../now-playing/now-playing'
import Resizer from './resizer'
import Subs from '../subs/subs'
import Sub from '../sub/sub'

const NoSubSelected = () => {
  if (!subsStore.subs.length) return null

  return <p className='videos-empty'>Please select a sub</p>
}

@observer
class App extends Component {
  @observable isResizing = false

  static contextTypes = {
    router: propTypes.router,
  }

  componentWillMount () {
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
        this.context.router.transitionTo({ pathname: '/login' })
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
        className={cs('app', { 'is-resizing': this.isResizing })}
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
          <Subs {...this.props} />
          <Match exactly pattern={this.props.pathname} component={NoSubSelected} />
          <Match pattern='/subs/:id' component={Sub} />
        </div>
      </div>
    )
  }

  _nowPlayingId () {
    return (this.props.location.query || {}).nowPlaying
  }

  _closeNowPlaying = () => {
    this.context.router.transitionTo({
      pathname: this.props.location.pathname,
      query: _.omit(this.props.location.query || {}, 'nowPlaying'),
    })
  }

  _onVideoEnded = () => {
    if (!appState.autoPlayEnabled) return

    const nextVideoId = videosStore.nextVideoId(this._nowPlayingId())
    if (nextVideoId) {
      this.context.router.transitionTo({
        pathname: this.props.location.pathname,
        query: _.extend({}, this.props.location.query, { nowPlaying: nextVideoId }),
      })
    }
  }

  @action _startResizing = () => {
    this.isResizing = true
  }

  @action _updateNowPlayingHeight = (height) => {
    appState.updateNowPlayingHeight(height)
  }

  @action _endResizing = () => {
    this.isResizing = false
  }
}

export default App
