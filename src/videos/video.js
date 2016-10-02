import { DOM } from 'react'
import { icon, duration, date } from '../lib/util'
import PlaylistPicker from './playlist-picker/playlist-picker'

const Video = (props) => {
  const playlists = props.subs.filter((sub) => sub.get('custom'))

  function playlistPicker () {
    if (!playlists.size) return null

    return PlaylistPicker({
      videoId: props.video.get('id'),
      playlists,
      addedToPlaylist: props.addedToPlaylist,
      removedFromPlaylist: props.removedFromPlaylist,
    })
  }

  return DOM.div({ className: 'video' },
    DOM.div({ className: 'contents' },
      DOM.aside(null,
        DOM.button({ className: 'play-video', onClick: props.onPlay },
          DOM.img({ src: props.video.get('thumb') }),
          icon('youtube-play')
        )
      ),
      DOM.main(null,
        DOM.h4(null, props.video.get('title')),
        DOM.div(null,
          DOM.p({ className: 'duration' }, icon('clock-o', duration(props.video.get('duration')))),
          DOM.p({ className: 'pub-date' }, date(props.video.get('published')))
        )
      )
    ),
    playlistPicker()
  )
}

export default Video
