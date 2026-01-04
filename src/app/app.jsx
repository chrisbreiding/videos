import cs from 'classnames'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import React, { useEffect, useRef, useState } from 'react'
import { matchPath } from 'react-router'
import { Route, Switch } from 'react-router-dom'

import appState from './app-state'
import authStore from '../login/auth-store'
import subsStore from '../subs/subs-store'
import videosStore from '../videos/videos-store'
import { onAuthStateChanged, watchDoc } from '../lib/firebase'
import { icon, parseQueryString, updatedLink } from '../lib/util'

import AddToPlaylist from '../playlist-picker/add-to-playlist'
import Migrate from './migrate'
import NowPlaying from '../now-playing/now-playing'
import { Resizer } from './resizer'
import { Subs } from '../subs/subs'
import { Sub } from '../sub/sub'
import { AddCustomPlaylist } from '../subs/add-sub/add-custom-playlist'
import AddChannel from '../subs/add-sub/add-channel'

export const App = inject('router')(observer(({ router, location }) => {
  const [isResizing, setIsResizing] = useState(false)
  const [needsMigration, setNeedsMigration] = useState(false)

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
        const needsMigration = Object.values(data.subs).some((sub) => !sub.type)

        if (needsMigration) {
          setNeedsMigration(true)

          return
        }

        subsStore.setSubs(data.subs)
      }

      if (data.allSubsMarkedVideoId) {
        appState.setAllSubsMarkedVideoId(data.allSubsMarkedVideoId, false)
      }
    })

    unsubscribersRef.current.push(unsubscribe)
  }

  const onVideoEnded = () => {
    if (!appState.autoPlayEnabled) return

    const nextVideoId = videosStore.nextVideoId(getNowPlayingId())
    if (!nextVideoId) return

    const match = matchPath(location.pathname, {
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

  const onMigrationComplete = () => {
    setNeedsMigration(false)
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

  if (needsMigration) {
    return <Migrate onComplete={onMigrationComplete} />
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
        <Switch>
          <Route exact path='/' component={Sub} />
          <Route exact path='/add-custom-playlist' component={AddCustomPlaylist} />
          <Route exact path='/add-to-playlist' component={AddToPlaylist} />
          <Route path='/add-channel/:query?' component={AddChannel} />
          <Route path='/subs/:id/page/:pageToken' component={Sub} />
          <Route path='/subs/:id' component={Sub} />
        </Switch>
      </div>
    </div>
  )
}))
