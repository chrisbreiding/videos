import React from 'react'
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

  return (
    <div className='video'>
      <div className='contents'>
        <aside>
          <button className='play-video' onClick={props.onPlay}>
            <img src={props.video.get('thumb')} />
            {icon('youtube-play')}
          </button>
        </aside>
        <main>
          <h4>{props.video.get('title')}</h4>
          <div>
            <p className='duration'>{icon('clock-o', duration(props.video.get('duration')))}</p>
            <p className='pub-date'>{date(props.video.get('published'))}</p>
          </div>
        </main>
      </div>
      {playlistPicker()}
    </div>
  )
}

export default Video
