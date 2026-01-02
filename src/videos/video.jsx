import cs from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React from 'react'
import { Link } from 'react-router-dom'
import { SortableHandle } from 'react-sortable-hoc'

import { icon, duration, date } from '../lib/util'
import PlaylistPicker from '../playlist-picker/playlist-picker'

const SortHandle = SortableHandle(() => (
  <div className='video-sort-handle'>
    {icon('ellipsis-v')}
    {icon('ellipsis-v')}
  </div>
))

const Video = observer((props) => {
  const playlistPicker = () => {
    if (!props.customPlaylists.length) return null

    return (
      <PlaylistPicker
        videoId={props.video.id}
        customPlaylists={props.customPlaylists}
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
  const durationDisplay = duration(props.video.duration)

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
        <SortHandle />
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
            {durationDisplay && <p className='duration'>{icon('clock-o', durationDisplay)}</p>}
            <p className='pub-date'>{date(props.video.published)}</p>
          </div>
        </main>
      </div>
      {playlistPicker()}
    </div>
  )
})

export default Video
