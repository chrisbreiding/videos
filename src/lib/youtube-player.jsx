/* global YT */
// https://developers.google.com/youtube/iframe_api_reference

import React, { useEffect, useRef } from 'react'

const SCRIPT_ID = 'youtube-player-api-script'
const PLAYER_ID = 'youtube-player'

export const YoutubePlayer = ({ id, width, height, onEnd }) => {
  const playerRef = useRef(null)

  const scriptLoaded = () => {
    return !!document.getElementById(SCRIPT_ID)
  }

  const initPlayer = () => {
    playerRef.current = new YT.Player(PLAYER_ID, {
      videoId: id,
      playerVars: { autoplay: 1 },
      width,
      height,
    })

    playerRef.current.addEventListener('onStateChange', (e) => {
      if (e.data === YT.PlayerState.ENDED) {
        onEnd()
      }
    })
  }

  const loadScript = () => {
    if (scriptLoaded()) return initPlayer()

    let script = document.createElement('script')
    script.id = SCRIPT_ID
    script.type = 'text/javascript'
    script.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(script)
  }

  useEffect(() => {
    window.onYouTubeIframeAPIReady = initPlayer
    loadScript()

    return () => {
      playerRef.current.destroy()
      window.onYouTubeIframeAPIReady = null
    }
  }, [])

  useEffect(() => {
    if (!playerRef.current) return

    playerRef.current.stopVideo()
    playerRef.current.loadVideoById(id)
  }, [id])

  useEffect(() => {
    if (!playerRef.current) return

    playerRef.current.setSize(width, height)
  }, [width, height])

  return <div className={PLAYER_ID} id={PLAYER_ID} />
}
