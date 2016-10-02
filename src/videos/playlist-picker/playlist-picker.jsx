import _ from 'lodash'
import React, { Component } from 'react'
import { icon } from '../../lib/util'

class PlaylistPicker extends Component {
  render () {
    return (
      <div className='playlist-picker'>
        <span>Playlists:</span>
        <ul>
          {this.props.playlists.map((playlist) => {
            const inPlaylist = !!playlist.getIn(['videos', this.props.videoId])

            return (
              <li key={playlist.get('id')}>
                <button onClick={_.partial(this._setPlaylist, playlist, !inPlaylist)}>
                  {icon(inPlaylist ? 'check-square' : 'square-o')}
                  <span>{playlist.get('title')}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  _setPlaylist (playlist, inPlaylist) {
    if (inPlaylist) {
      this.props.addedToPlaylist(playlist)
    } else {
      this.props.removedFromPlaylist(playlist)
    }
  }
}

export default PlaylistPicker
