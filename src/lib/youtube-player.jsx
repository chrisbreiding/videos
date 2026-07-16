/* global YT */
// https://developers.google.com/youtube/iframe_api_reference

import React, { useEffect, useRef } from 'react'

const SCRIPT_ID = 'youtube-player-api-script'
const PLAYER_ID = 'youtube-player'

const TRACK_INTERVAL = 1000

export const YoutubePlayer = ({ id, width, height, onEnd, onTime, startTime }) => {
  const playerRef = useRef(null)
  const isReadyRef = useRef(false)
  const trackIntervalRef = useRef(null)
  const onTimeRef = useRef(onTime)
  const startTimeRef = useRef(startTime)

  onTimeRef.current = onTime
  startTimeRef.current = startTime

  const scriptLoaded = () => {
    return !!document.getElementById(SCRIPT_ID)
  }

  const initPlayer = () => {
    isReadyRef.current = false

    playerRef.current = new YT.Player(PLAYER_ID, {
      videoId: id,
      playerVars: {
        autoplay: 1,
        start: Math.floor(startTimeRef.current || 0),
      },
      width,
      height,
      events: {
        onReady: () => {
          isReadyRef.current = true
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.ENDED) {
            onEnd()
          }

          if (e.data === YT.PlayerState.PAUSED) {
            saveTime(true)
          }
        },
      },
    })

    startTracking()
  }

  const saveTime = (immediate) => {
    const player = playerRef.current

    if (!player || !isReadyRef.current || !onTimeRef.current) return

    const time = player.getCurrentTime()

    if (typeof time !== 'number' || isNaN(time)) return

    onTimeRef.current(time, immediate)
  }

  const startTracking = () => {
    clearInterval(trackIntervalRef.current)

    trackIntervalRef.current = setInterval(() => {
      const player = playerRef.current

      if (!player || !isReadyRef.current) return
      if (player.getPlayerState() !== YT.PlayerState.PLAYING) return

      saveTime(false)
    }, TRACK_INTERVAL)
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
      clearInterval(trackIntervalRef.current)
      saveTime(true)

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy()
      }

      window.onYouTubeIframeAPIReady = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current) return

    playerRef.current.stopVideo()
    playerRef.current.loadVideoById({
      videoId: id,
      startSeconds: startTimeRef.current || 0,
    })
  }, [id])

  useEffect(() => {
    if (!playerRef.current || !isReadyRef.current) return

    playerRef.current.setSize(width, height)
  }, [width, height])

  return <div className={PLAYER_ID} id={PLAYER_ID} />
}
