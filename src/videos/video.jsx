import cs from 'classnames'
import _ from 'lodash'
import { inject, observer } from 'mobx-react'
import React from 'react'
import { Link } from 'react-router-dom'

import { icon, duration, date } from '../lib/util'
import PlaylistPicker from './playlist-picker/playlist-picker'

const Video = inject('router')(observer((props) => {
  const playlists = _.filter(props.subs, (sub) => sub.isCustom)

  function playlistPicker () {
    if (!playlists.length) return null

    return (
      <PlaylistPicker
        videoId={props.video.id}
        playlists={playlists}
        addedToPlaylist={props.addedToPlaylist}
        removedFromPlaylist={props.removedFromPlaylist}
      />
    )
  }

  const removeMark = (e) => {
    e.stopPropagation()

    props.onRemoveMark()
  }

  const videoMarkerName = 'video-marker'

  return (
    <div className={cs('video', { 'is-marked': props.isMarked })}>
      {props.isMarked && (
        <div
          className={videoMarkerName}
          id={videoMarkerName}
          onClick={_.partial(props.addVideoMarkerLink, videoMarkerName)}
        >
          <div className='remove-video-marker' onClick={removeMark}>
            {icon('remove')}
          </div>
        </div>
      )}
      <div className='contents'>
        <aside>
          <Link className='play-video' to={props.playLink} onClick={props.onPlay}>
            <img src={props.video.thumb} />
            {props.channelImage && <img className='channel' src={props.channelImage} />}
            {icon('youtube-play')}
          </Link>
        </aside>
        <main>
          <h4>{props.video.title}</h4>
          <div>
            <p className='duration'>{icon('clock-o', duration(props.video.duration))}</p>
            <p className='pub-date'>{date(props.video.published)}</p>
          </div>
        </main>
      </div>
      {playlistPicker()}
    </div>
  )
}))

export default Video
