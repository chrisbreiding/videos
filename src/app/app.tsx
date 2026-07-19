import cs from 'classnames'
import { useEffect, useRef, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  matchPath,
  useLocation,
  useNavigate,
} from 'react-router'

import { minNowPlayingHeight, useAppContext } from './app-context'
import { useAuthContext } from '../login/auth-context'
import { useSubsContext } from '../subs/subs-context'
import { useVideosContext } from '../videos/videos-context'
import { onAuthStateChanged, watchDoc } from '../lib/firebase'
import { Icon, parseQueryString, updatedLink } from '../lib/util'

import { AddToPlaylist } from '../playlist-picker/add-to-playlist'
import { NowPlaying } from '../now-playing/now-playing'
import { Resizer } from './resizer'
import { Subs } from '../subs/subs'
import { Sub } from '../sub/sub'
import { AddCustomPlaylist } from '../subs/add-sub/add-custom-playlist'
import { AddChannel } from '../subs/add-sub/add-channel'
import type { SubModel } from '../sub/sub-model'

export const App = () => {
  const {
    subs,
    isLoading: isLoadingSubs,
    customPlaylists,
    getSubById,
    setSubs,
    update: updateSub,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
  } = useSubsContext()
  const { nextVideoId } = useVideosContext()
  const { isAuthenticated, setUserId, setApiKey, checkApiKey } =
    useAuthContext()
  const {
    autoPlayEnabled,
    isSorting,
    windowHeight,
    maxNowPlayingHeight,
    nowPlayingHeight,
    setSorting,
    setAllSubsMarkedVideoId,
    setWatchedVideos,
    updateNowPlayingHeight: updateNowPlayingHeightContext,
    toggleAutoPlay,
    setSavedLocation,
  } = useAppContext()

  const location = useLocation()
  const navigate = useNavigate()
  const [isResizing, setIsResizing] = useState(false)

  const unsubscribersRef = useRef<Array<() => void>>([])

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

      const isValid = await checkApiKey(apiKey)

      if (isValid) {
        setApiKey(apiKey!)
      }
      // TODO: handle missing or invalid api key

      if (data.subs) {
        setSubs(data.subs)
      }

      if (data.allSubsMarkedVideoId) {
        setAllSubsMarkedVideoId(data.allSubsMarkedVideoId, false)
      }

      if (data.watchedVideos) {
        setWatchedVideos(data.watchedVideos)
      }
    })

    unsubscribersRef.current.push(unsubscribe)
  }

  const onVideoEnded = () => {
    if (!autoPlayEnabled) return

    const nextId = nextVideoId(getNowPlayingId())
    if (!nextId) return

    const match = matchPath(
      { path: '/subs/:id', end: false },
      location.pathname,
    )

    if (match) {
      const subId = match.params.id
      const sub = getSubById(subId)

      if (sub) {
        updateSub(sub.id, { markedVideoId: nextId })
      }
    }

    navigate(
      updatedLink(location, {
        search: { nowPlaying: nextId },
      }),
    )
  }

  const startResizing = () => {
    setIsResizing(true)
  }

  const updateNowPlayingHeight = (height: number) => {
    updateNowPlayingHeightContext(height)
  }

  const endResizing = () => {
    setIsResizing(false)
  }

  const onSortStart = () => {
    setSorting(true)
  }

  const onSortEnd = () => {
    setSorting(false)
  }

  useEffect(() => {
    const unsubscribers = unsubscribersRef.current

    const unsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid)
        return getApiKey()
      }

      setSavedLocation(location)
      navigate({ pathname: '/login' })
    })

    unsubscribers.push(unsubscribe)

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        unsubscribe()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isAuthenticated || isLoadingSubs) {
    return (
      <div className="loader">
        <Icon name="play-circle" spin /> Loading...
      </div>
    )
  }

  if (!subs.length && !location.pathname.includes('/add-channel')) {
    return <Navigate to="/add-channel" />
  }

  const nowPlayingId = getNowPlayingId()

  return (
    <div
      className={cs('app', {
        'is-resizing': isResizing,
        'is-sorting': isSorting,
      })}
      style={{ height: windowHeight }}
    >
      <NowPlaying
        autoPlayEnabled={autoPlayEnabled}
        id={nowPlayingId}
        customPlaylists={customPlaylists}
        closeLink={getCloseNowPlayingLink()}
        onEnd={onVideoEnded}
        onToggleAutoPlay={toggleAutoPlay}
        addedToPlaylist={(playlist: SubModel) =>
          addVideoToPlaylist(playlist, nowPlayingId!)
        }
        removedFromPlaylist={(playlist: SubModel) =>
          removeVideoFromPlaylist(playlist, nowPlayingId!)
        }
      />
      {nowPlayingId && (
        <Resizer
          height={nowPlayingHeight}
          minHeight={minNowPlayingHeight}
          maxHeight={maxNowPlayingHeight}
          onResizeStart={startResizing}
          onResize={updateNowPlayingHeight}
          onResizeEnd={endResizing}
        />
      )}
      <div className="subs">
        <Subs
          location={location}
          onSortStart={onSortStart}
          onSortEnd={onSortEnd}
        />
        <Routes>
          <Route path="/" element={<Sub />} />
          <Route path="add-custom-playlist" element={<AddCustomPlaylist />} />
          <Route path="add-to-playlist" element={<AddToPlaylist />} />
          <Route path="add-channel" element={<AddChannel />} />
          <Route path="add-channel/:query" element={<AddChannel />} />
          <Route path="subs/:id/page/:pageToken" element={<Sub />} />
          <Route path="subs/:id" element={<Sub />} />
        </Routes>
      </div>
    </div>
  )
}
