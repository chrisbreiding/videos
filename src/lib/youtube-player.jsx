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
      this._updatePlayerId()
    }

    if (prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
      this._updatePlayerDimensions()
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
      width: this.props.width,
      height: this.props.height,
    })
  }

  _updatePlayerId () {
    if (!this._player) return

    this._player.stopVideo()
    this._player.loadVideoById(this.props.id)
  }

  _updatePlayerDimensions () {
    this._player.setSize(this.props.width, this.props.height)
  }

  render () {
    return <div className={PLAYER_ID} id={PLAYER_ID} />
  }
}

export default YoutubePlayer
