import cs from 'classnames'
import { useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { appState } from '../app/app-state'
import { DocumentTitle } from '../lib/document-title'
import { useStore } from '../lib/store'
import { Icon, parseQueryString, updatedLink } from '../lib/util'
import { subsStore } from '../subs/subs-store'
import { useVideosContext } from '../videos/videos-context'

import { Paginator } from '../paginator/paginator'
import { Search } from '../search/search'
import { Videos } from '../videos/videos'
import type { SubModel } from './sub-model'

export const Sub = () => {
  useStore(subsStore, appState)
  const {
    videos,
    isLoading,
    hasLoadedAllPlaylists,
    prevPageToken,
    nextPageToken,
    getVideosDataForPlaylist,
    getVideosDataForAllPlaylists,
    getVideosDataForChannelSearch,
    getVideosDataForPlaylistSearch,
    getVideosDataForCustomPlaylist,
    sort,
  } = useVideosContext()

  const location = useLocation()
  const query = parseQueryString(location.search)
  const navigate = useNavigate()
  const params = useParams()
  const previousLoadingValueRef = useRef(isLoading)
  const searchQueryRef = useRef<string | null | undefined>(null)
  const pageTokenRef = useRef<string | null | undefined>(null)
  const playlistIdRef = useRef<string | null | undefined>(null)
  const isAllSubsRef = useRef(false)

  const getSub = useCallback(() => {
    return subsStore.getSubById(params.id)
  }, [params.id])

  const scrollToMarker = (marker?: string) => {
    document.querySelector(`#${marker}`)?.scrollIntoView()
  }

  const finishedLoadingVideos = () => {
    return previousLoadingValueRef.current === true && isLoading === false
  }

  const shouldLoadAllPlaylists = (
    sub: SubModel | undefined,
    oldPlaylistId: string | null | undefined,
    newPlaylistId: string | null | undefined,
  ) => {
    if (sub) return false
    if (oldPlaylistId && !newPlaylistId) return true
    if (hasLoadedAllPlaylists) return false

    return true
  }

  const getVideos = () => {
    if (isLoading) return

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
      getVideosDataForAllPlaylists(subsStore.channelIds)

      return
    }

    if (!sub) {
      isAllSubsRef.current = true

      return
    }

    isAllSubsRef.current = false

    if (
      oldPlaylistId !== newPlaylistId ||
      oldToken !== newToken ||
      oldSearchQuery !== newSearchQuery
    ) {
      if (newSearchQuery) {
        if (sub.type === 'playlist') {
          getVideosDataForPlaylistSearch(sub.playlistId!, newSearchQuery)
        } else {
          getVideosDataForChannelSearch(sub, newSearchQuery, newToken)
        }
      } else if (sub.type === 'custom') {
        getVideosDataForCustomPlaylist(sub)
      } else {
        getVideosDataForPlaylist(newPlaylistId!, newToken)
      }
    }
  }

  const paginatorLink = (
    subId: string | undefined,
    pageToken: string | null | undefined,
  ) => {
    if (!pageToken) return

    return updatedLink(location, {
      pathname: `/subs/${subId}/page/${pageToken}`,
    })
  }

  const isPageBookMarked = (sub: SubModel) => {
    return sub.bookmarkedPageToken === pageTokenRef.current
  }

  const getMarkedVideoId = (sub: SubModel | undefined) => {
    if (isAllSubsRef.current) return appState.allSubsMarkedVideoId

    return sub ? sub.markedVideoId : null
  }

  const updateVideoMark = useCallback(
    (id?: string) => {
      const sub = getSub()

      if (isAllSubsRef.current) {
        appState.setAllSubsMarkedVideoId(id)
      } else if (sub) {
        subsStore.update(sub.id, { markedVideoId: id })
      }
    },
    [getSub],
  )

  const updateVideoMarkerLink = useCallback(
    (marker?: string) => {
      navigate(
        updatedLink(location, {
          search: { marker },
        }),
        { replace: true },
      )
      scrollToMarker(marker)
    },
    [navigate, location],
  )

  const updateBookmark = useCallback(
    (sub: SubModel) => () => {
      const bookmarkedPageToken = isPageBookMarked(sub)
        ? null
        : pageTokenRef.current
      sub.update({ bookmarkedPageToken })
      subsStore.save()
    },
    [],
  )

  const removeVideoMark = useCallback(() => {
    updateVideoMark()
    updateVideoMarkerLink()
  }, [updateVideoMark, updateVideoMarkerLink])

  const onSortStart = useCallback(() => {
    appState.setSorting(true)
  }, [])

  const onSortEnd = useCallback(
    (sortProps: string[]) => {
      appState.setSorting(false)
      const changed = sort(sortProps)

      if (changed) {
        subsStore.updatePlaylistVideosOrder(params.id, videos)
        subsStore.save()
      }
    },
    [params.id, sort, videos],
  )

  const onSearchUpdate = useCallback(
    (searchTerm?: string) => {
      navigate(
        updatedLink(
          {
            pathname: `/subs/${params.id}`,
          },
          {
            search: {
              search: searchTerm || undefined,
              pageToken: undefined,
            },
          },
        ),
      )
    },
    [navigate, params.id],
  )

  const renderSearch = (sub: SubModel | undefined) => {
    if (!sub || sub.type === 'custom') return null

    return <Search query={query.search} onSearch={onSearchUpdate} />
  }

  const renderBookmark = (sub: SubModel | undefined) => {
    if (!sub || !pageTokenRef.current) return null

    return (
      <button
        className={cs('bookmark', { 'is-bookmarked': isPageBookMarked(sub) })}
        onClick={updateBookmark(sub)}
      >
        <Icon name="bookmark" />
      </button>
    )
  }

  const renderVideos = (sub: SubModel | undefined) => {
    if (!videos.length) {
      return (
        <div className="videos-empty">
          <Icon name="film" />
          No videos
          <Icon name="film" />
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
      <div className="loader">
        <Icon name="play-circle" spin />
        <Icon name="play-circle" spin />
        <Icon name="play-circle" spin />
      </div>
    )
  }

  useEffect(() => {
    getVideos()

    if (query.marker && finishedLoadingVideos()) {
      scrollToMarker(query.marker)
    }

    previousLoadingValueRef.current = isLoading
  })

  const sub = getSub()
  const subId = params.id
  const prevLink = paginatorLink(subId, prevPageToken)
  const nextLink = paginatorLink(subId, nextPageToken)

  return (
    <main className="videos">
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
}
