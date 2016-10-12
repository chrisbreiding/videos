/* global YT */
// https://developers.google.com/youtube/iframe_api_reference

import React, { Component } from 'react'

const SCRIPT_ID = 'youtube-player-api-script'
const PLAYER_ID = 'youtube-player'

class YoutubePlayer extends Component {
  componentDidMount () {
    window.onYouTubeIframeAPIReady = this._initPlayer
    this._loadScript()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.id !== this.props.id) {
      this._updatePlayer()
    }
  }

  componentWillUnmount () {
    this._player.destroy()
    window.onYouTubeIframeAPIReady = null
  }

  _loadScript () {
    if (this._scriptLoaded()) return this._initPlayer()

    let script = document.createElement('script')
    script.id = SCRIPT_ID
    script.type = 'text/javascript'
    script.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(script)
  }

  _scriptLoaded = () => {
    return !!document.getElementById(SCRIPT_ID)
  }

  _initPlayer = () => {
    this._player = new YT.Player(PLAYER_ID, {
      videoId: this.props.id,
      playerVars: { autoplay: 1 },
      width: '960',
      height: '540',
    })
  }

  _updatePlayer () {
    if (!this._player) return

    this._player.stopVideo()
    this._player.loadVideoById(this.props.id)
  }

  render () {
    return <div className={PLAYER_ID} id={PLAYER_ID} />
  }
}

export default YoutubePlayer
