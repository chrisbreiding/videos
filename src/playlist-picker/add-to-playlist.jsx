import { observer, useLocalStore } from 'mobx-react'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { subsStore } from '../subs/subs-store'
import { parseQueryString } from '../lib/util'
import { action } from 'mobx'

// this route and component exist so a bookmarklet can be used to add a video
// to a playlist directly from YouTube
export const AddToPlaylist = observer(() => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = useLocalStore(() => ({
    error: null,
    setError: action((error) => {
      state.error = error
    }),
  }))

  useEffect(() => {
    const { playlistId, videoId } = parseQueryString(location.search)
    const playlist = subsStore.customPlaylists.find((playlist) => {
      return playlist.id === playlistId
    })

    if (playlist) {
      subsStore.addVideoToPlaylist(playlist, videoId)
      navigate({ pathname: `/subs/${playlist.id}`, search: '' })
    } else {
      state.setError('Playlist not found')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  return (
    <div className='add-to-playlist'>
      {!state.error && (
        <p>Adding video to playlist...</p>
      )}
      {!!state.error && (
        <>
          <p>Failed to add video to playlist:</p>
          <p>{state.error}</p>
        </>
      )}
    </div>
  )
})
