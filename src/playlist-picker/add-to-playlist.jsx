import { inject, observer, useLocalStore } from 'mobx-react'
import React, { useEffect } from 'react'
import subsStore from '../subs/subs-store'
import { parseQueryString } from '../lib/util'
import { action } from 'mobx'

const AddToPlaylist = inject('router')(observer((props) => {
  const state = useLocalStore(() => ({
    error: null,
    setError: action((error) => {
      state.error = error
    }),
  }))

  useEffect(() => {
    const { playlistId, videoId } = parseQueryString(props.location.search)
    const playlist = subsStore.playlists.find((playlist) => {
      return playlist.id === playlistId
    })

    if (playlist) {
      subsStore.addVideoToPlaylist(playlist, videoId)
      props.router.push({ pathname: `/subs/${playlist.id}`, search: '' })
    } else {
      state.setError('Playlist not found')
    }
  }, [props])

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
}))

export default AddToPlaylist
