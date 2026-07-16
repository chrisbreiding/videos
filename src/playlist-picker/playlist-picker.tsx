import _ from 'lodash'
import { observer } from 'mobx-react'
import { icon } from '../lib/util'
import type { SubModel } from '../sub/sub-model'

interface PlaylistPickerProps {
  videoId: string
  customPlaylists: SubModel[]
  addedToPlaylist: (playlist: SubModel) => void
  removedFromPlaylist: (playlist: SubModel) => void
}

export const PlaylistPicker = observer((props: PlaylistPickerProps) => {
  function setPlaylist (playlist: SubModel, inPlaylist: boolean) {
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
        {props.customPlaylists.map((playlist) => {
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
