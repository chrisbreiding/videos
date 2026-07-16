import cs from 'classnames'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useRef, useState } from 'react'
import { matchPath } from 'react-router'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { appState, minNowPlayingHeight } from './app-state'
import { authStore } from '../login/auth-store'
import { subsStore } from '../subs/subs-store'
import { videosStore } from '../videos/videos-store'
import { onAuthStateChanged, watchDoc } from '../lib/firebase'
import { icon, parseQueryString, updatedLink } from '../lib/util'

import { AddToPlaylist } from '../playlist-picker/add-to-playlist'
import { NowPlaying } from '../now-playing/now-playing'
import { Resizer } from './resizer'
import { Subs } from '../subs/subs'
import { Sub } from '../sub/sub'
import { AddCustomPlaylist } from '../subs/add-sub/add-custom-playlist'
import { AddChannel } from '../subs/add-sub/add-channel'

export const App = inject('router')(observer(({ router }) => {
  const location = useLocation()
  const [isResizing, setIsResizing] = useState(false)

  const unsubscribersRef = useRef([])

  const getQuery = () => {
    return parseQueryString(location.search)
  }

  const getNowPlayingId = () => {
    return getQuery().nowPlaying
  }

  const getCloseNowPlayingLink = () => {
    return updatedLink(location, {
      search: { nowPlaying: undefined },
    })
  }

  const getApiKey = async () => {
    const unsubscribe = watchDoc(async (data) => {
      const apiKey = data.youtubeApiKey

      if (apiKey) {
        const isValid = await authStore.checkApiKey(apiKey)

        if (isValid) {
          authStore.setApiKey(apiKey)
        }
        // TODO: handle missing or invalid api key
      }

      if (data.subs) {
        subsStore.setSubs(data.subs)
      }

      if (data.allSubsMarkedVideoId) {
        appState.setAllSubsMarkedVideoId(data.allSubsMarkedVideoId, false)
      }

      if (data.watchedVideos) {
        appState.setWatchedVideos(data.watchedVideos)
      }
    })

    unsubscribersRef.current.push(unsubscribe)
  }

  const onVideoEnded = () => {
    if (!appState.autoPlayEnabled) return

    const nextVideoId = videosStore.nextVideoId(getNowPlayingId())
    if (!nextVideoId) return

    const match = matchPath({ path: '/subs/:id', end: false }, location.pathname)

    if (match) {
      const subId = match.params.id
      const sub = subsStore.getSubById(subId)

      if (sub) {
        subsStore.update(sub.id, { markedVideoId: nextVideoId })
      }
    }

    router.push(updatedLink(location, {
      search: { nowPlaying: nextVideoId },
    }))
  }

  const startResizing = () => {
    setIsResizing(true)
  }

  const updateNowPlayingHeight = (height) => {
    appState.updateNowPlayingHeight(height)
  }

  const endResizing = () => {
    setIsResizing(false)
  }

  const onSortStart = () => {
    appState.setSorting(true)
  }

  const onSortEnd = () => {
    appState.setSorting(false)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        authStore.setUserId(user.uid)
        return getApiKey()
      }

      appState.setSavedLocation(location)
      router.push({ pathname: '/login' })
    })

    unsubscribersRef.current.push(unsubscribe)

    return () => {
      _.each(unsubscribersRef.current, (unsubscribe) => {
        unsubscribe()
      })
    }
  }, [])

  if (!authStore.isAuthenticated) {
    return (
      <div className='loader'>
        {icon('sign-in')} Authenticating...
      </div>
    )
  }

  if (subsStore.isLoading) {
    return (
      <div className='loader'>
        {icon('spin fa-play-circle')} Loading...
      </div>
    )
  }

  if (!subsStore.subs.length && !location.pathname.includes('/add-channel')) {
    return <Navigate to='/add-channel' />
  }

  const nowPlayingId = getNowPlayingId()

  return (
    <div
      className={cs('app', {
        'is-resizing': isResizing,
        'is-sorting': appState.isSorting,
      })}
      style={{ height: appState.windowHeight }}
    >
      <NowPlaying
        autoPlayEnabled={appState.autoPlayEnabled}
        id={nowPlayingId}
        customPlaylists={subsStore.customPlaylists}
        closeLink={getCloseNowPlayingLink}
        onEnd={onVideoEnded}
        onToggleAutoPlay={appState.toggleAutoPlay}
        addedToPlaylist={(playlist) => subsStore.addVideoToPlaylist(playlist, nowPlayingId)}
        removedFromPlaylist={(playlist) => subsStore.removeVideoFromPlaylist(playlist, nowPlayingId)}
      />
      {nowPlayingId && (
        <Resizer
          height={appState.nowPlayingHeight}
          minHeight={minNowPlayingHeight}
          maxHeight={appState.maxNowPlayingHeight}
          onResizeStart={startResizing}
          onResize={updateNowPlayingHeight}
          onResizeEnd={endResizing}
        />
      )}
      <div className='subs'>
        <Subs
          router={router}
          location={location}
          onSortStart={onSortStart}
          onSortEnd={onSortEnd}
        />
        <Routes>
          <Route path='/' element={<Sub />} />
          <Route path='add-custom-playlist' element={<AddCustomPlaylist />} />
          <Route path='add-to-playlist' element={<AddToPlaylist />} />
          <Route path='add-channel' element={<AddChannel />} />
          <Route path='add-channel/:query' element={<AddChannel />} />
          <Route path='subs/:id/page/:pageToken' element={<Sub />} />
          <Route path='subs/:id' element={<Sub />} />
        </Routes>
      </div>
    </div>
  )
}))
