import _ from 'lodash'
import { Component, DOM } from 'react'
import { icon } from '../../lib/util'

class PlaylistPicker extends Component {
  render () {
    return DOM.div({ className: 'playlist-picker' },
      DOM.span(null, 'Playlists:'),
      DOM.ul(null, this.props.playlists.map((playlist) => {
        const inPlaylist = !!playlist.getIn(['videos', this.props.videoId])

        return DOM.li({ key: playlist.get('id') },
          DOM.button({ onClick: _.partial(this._setPlaylist, playlist, !inPlaylist) },
            icon(inPlaylist ? 'check-square' : 'square-o'),
            DOM.span(null, playlist.get('title'))
          )
        )
      }))
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
