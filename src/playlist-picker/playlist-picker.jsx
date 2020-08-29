import _ from 'lodash'
import { observer } from 'mobx-react'
import React from 'react'
import { icon } from '../lib/util'

const PlaylistPicker = observer((props) => {
  function setPlaylist (playlist, inPlaylist) {
    if (inPlaylist) {
      props.addedToPlaylist(playlist)
    } else {
      props.removedFromPlaylist(playlist)
    }
  }

  return (
    <div className='playlist-picker'>
      <span>Playlists:</span>
      <ul>
        {props.playlists.map((playlist) => {
          const inPlaylist = playlist.videos.has(props.videoId)

          return (
            <li key={playlist.id}>
              <button onClick={_.partial(setPlaylist, playlist, !inPlaylist)}>
                {icon(inPlaylist ? 'check-square' : 'square-o')}
                <span>{playlist.title}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
})

export default PlaylistPicker
