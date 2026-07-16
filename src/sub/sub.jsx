import cs from 'classnames'
import { observer } from 'mobx-react'
import React, { useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { appState } from '../app/app-state'
import { DocumentTitle } from '../lib/document-title'
import { icon, parseQueryString, updatedLink } from '../lib/util'
import { subsStore } from '../subs/subs-store'
import { videosStore } from '../videos/videos-store'

import { Paginator } from '../paginator/paginator'
import { Search } from '../search/search'
import { Videos } from '../videos/videos'

export const Sub = observer(() => {
  const location = useLocation()
  const query = parseQueryString(location.search)
  const navigate = useNavigate()
  const params = useParams()
  const previousLoadingValueRef = useRef(videosStore.isLoading)
  const searchQueryRef = useRef(null)
  const pageTokenRef = useRef(null)
  const playlistIdRef = useRef(null)
  const isAllSubsRef = useRef(false)

  const getSub = useCallback(() => {
    return subsStore.getSubById(params.id)
  }, [params.id])

  const scrollToMarker = (marker) => {
    document.querySelector(`#${marker}`)?.scrollIntoView()
  }

  const finishedLoadingVideos = () => {
    return previousLoadingValueRef.current === true && videosStore.isLoading === false
  }

  const shouldLoadAllPlaylists = (sub, oldPlaylistId, newPlaylistId) => {
    if (sub) return false
    if (oldPlaylistId && !newPlaylistId) return true
    if (videosStore.hasLoadedAllPlaylists) return false

    return true
  }

  const getVideos = () => {
    if (videosStore.isLoading) return

    const sub = getSub()

    const oldSearchQuery = searchQueryRef.current
    const newSearchQuery = query.search
    searchQueryRef.current = newSearchQuery

    const oldToken = pageTokenRef.current
    const newToken = params.pageToken
    pageTokenRef.current = newToken

    const oldPlaylistId = playlistIdRef.current
    const newPlaylistId = sub && sub.playlistId
    playlistIdRef.current = newPlaylistId

    if (shouldLoadAllPlaylists(sub, oldPlaylistId, newPlaylistId)) {
      isAllSubsRef.current = true
      videosStore.getVideosDataForAllPlaylists(subsStore.channelIds)

      return
    }

    if (
      oldPlaylistId !== newPlaylistId
      || oldToken !== newToken
      || oldSearchQuery !== newSearchQuery
    ) {
      isAllSubsRef.current = false

      if (newSearchQuery) {
        if (sub.type === 'playlist') {
          videosStore.getVideosDataForPlaylistSearch(sub.playlistId, newSearchQuery)
        } else {
          videosStore.getVideosDataForChannelSearch(sub, newSearchQuery, newToken)
        }
      } else if (sub.type === 'custom') {
        videosStore.getVideosDataForCustomPlaylist(sub)
      } else {
        videosStore.getVideosDataForPlaylist(newPlaylistId, newToken)
      }
    }
  }

  const paginatorLink = (subId, pageToken) => {
    if (!pageToken) return

    return updatedLink(location, {
      pathname: `/subs/${subId}/page/${pageToken}`,
    })
  }

  const isPageBookMarked = (sub) => {
    return sub.bookmarkedPageToken === pageTokenRef.current
  }

  const getMarkedVideoId = (sub) => {
    if (isAllSubsRef.current) return appState.allSubsMarkedVideoId

    return sub ? sub.markedVideoId : null
  }

  const updateVideoMark = useCallback((id) => {
    const sub = getSub()

    if (isAllSubsRef.current) {
      appState.setAllSubsMarkedVideoId(id)
    } else if (sub) {
      subsStore.update(sub.id, { markedVideoId: id })
    }
  }, [getSub])

  const updateVideoMarkerLink = useCallback((marker) => {
    navigate(updatedLink(location, {
      search: { marker },
    }), { replace: true })
    scrollToMarker(marker)
  }, [navigate, location])

  const updateBookmark = useCallback((sub) => () => {
    const bookmarkedPageToken = isPageBookMarked(sub) ? null : pageTokenRef.current
    sub.update({ bookmarkedPageToken })
    subsStore.save()
  }, [])

  const removeVideoMark = useCallback(() => {
    updateVideoMark()
    updateVideoMarkerLink()
  }, [updateVideoMark, updateVideoMarkerLink])

  const onSortStart = useCallback(() => {
    appState.setSorting(true)
  }, [])

  const onSortEnd = useCallback((sortProps) => {
    appState.setSorting(false)
    const changed = videosStore.sort(sortProps)

    if (changed) {
      subsStore.updatePlaylistVideosOrder(params.id, videosStore.videos)
      subsStore.save()
    }
  }, [params.id])

  const onSearchUpdate = useCallback((searchTerm) => {
    navigate(updatedLink({
      pathname: `/subs/${params.id}`,
    }, {
      search: {
        search: searchTerm || undefined,
        pageToken: undefined,
      },
    }))
  }, [navigate, params.id])

  const renderSearch = (sub) => {
    if (!sub || sub.type === 'custom') return null

    return (
      <Search
        query={query.search}
        onSearch={onSearchUpdate}
      />
    )
  }

  const renderBookmark = (sub) => {
    if (!sub || !pageTokenRef.current) return null

    return (
      <button
        className={cs('bookmark', { 'is-bookmarked': isPageBookMarked(sub) })}
        onClick={updateBookmark(sub)}
      >
        {icon('bookmark')}
      </button>
    )
  }

  const renderVideos = (sub) => {
    if (!videosStore.videos.length) {
      return (
        <div className='videos-empty'>
          {icon('film')}
          No videos
          {icon('film')}
        </div>
      )
    }

    const isCustom = sub?.type === 'custom'

    return (
      <Videos
        showChannelImage={isAllSubsRef.current || isCustom}
        isSortable={isCustom}
        location={location}
        markedVideoId={getMarkedVideoId(sub)}
        onPlay={updateVideoMark}
        onRemoveMark={removeVideoMark}
        onSortStart={onSortStart}
        onSortEnd={onSortEnd}
        onUpdateVideoMarkerLink={updateVideoMarkerLink}
      />
    )
  }

  const renderLoader = () => {
    return (
      <div className='loader'>
        {icon('spin fa-play-circle')}
        {icon('spin fa-play-circle')}
        {icon('spin fa-play-circle')}
      </div>
    )
  }

  useEffect(() => {
    getVideos()

    if (query.marker && finishedLoadingVideos()) {
      scrollToMarker(query.marker)
    }

    previousLoadingValueRef.current = videosStore.isLoading
  })

  const sub = getSub()
  const subId = params.id
  const { isLoading, prevPageToken, nextPageToken } = videosStore
  const prevLink = paginatorLink(subId, prevPageToken)
  const nextLink = paginatorLink(subId, nextPageToken)

  return (
    <main className='videos'>
      {!query.nowPlaying && (
        <DocumentTitle title={`${sub?.title || 'All Subs'} | Videos`} />
      )}
      <Paginator prevLink={prevLink} nextLink={nextLink}>
        {renderSearch(sub)}
        {renderBookmark(sub)}
      </Paginator>
      {isLoading ? renderLoader() : renderVideos(sub)}
      <Paginator prevLink={prevLink} nextLink={nextLink} />
    </main>
  )
})
