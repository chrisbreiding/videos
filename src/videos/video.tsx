import cs from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { Link } from 'react-router'
import { useSortable } from '@dnd-kit/react/sortable'

import { Icon, duration, durationSeconds, date } from '../lib/util'
import { appState } from '../app/app-state'
import { PlaylistPicker } from '../playlist-picker/playlist-picker'
import type { VideoModel } from './video-model'
import type { SubModel } from '../sub/sub-model'
import type { LinkLocation } from '../lib/types'

const WatchProgress = ({ id, duration }: { id: string, duration?: string }) => {
  const watched = appState.watchedVideos[id]
  if (!watched) return null

  const length = durationSeconds(duration)
  if (!length) return null

  const percent = Math.min(100, (watched.watchTimestamp / length) * 100)

  // don't show super-short progress bar
  if (percent < 2) return null

  return (
    <div className='watch-progress'>
      <div className='watch-progress-bar' style={{ width: `${percent}%` }} />
    </div>
  )
}

interface VideoProps {
  video: VideoModel
  index: number
  isSortable: boolean
  isMarked: boolean
  playLink: LinkLocation
  channelImage?: string | false
  customPlaylists: SubModel[]
  onPlay: () => void
  onRemoveMark: () => void
  addVideoMarkerLink: (marker: string) => void
  addedToPlaylist: (playlist: SubModel) => void
  removedFromPlaylist: (playlist: SubModel) => void
}

export const Video = observer((props: VideoProps) => {
  const { ref, handleRef } = useSortable({
    id: props.video.id,
    index: props.index,
    disabled: !props.isSortable,
  })

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

  const removeMark = (e: React.MouseEvent) => {
    e.stopPropagation()

    props.onRemoveMark()
  }

  const videoMarkerName = 'video-marker'
  const durationDisplay = duration(props.video.duration)

  return (
    <div ref={ref} className={cs('video', { 'is-marked': props.isMarked })}>
      {props.isMarked && (
        <div
          className={videoMarkerName}
          id={videoMarkerName}
          onClick={_.partial(props.addVideoMarkerLink, videoMarkerName)}
        >
          <div className='remove-video-marker' onClick={removeMark}>
            <Icon name='remove' />
          </div>
        </div>
      )}
      <div className='contents'>
        <div className='video-sort-handle' ref={handleRef}>
          <Icon name='ellipsis-vertical' />
          <Icon name='ellipsis-vertical' />
        </div>
        <aside>
          <Link className='play-video' to={props.playLink} onClick={props.onPlay}>
            <img src={props.video.thumb} />
            {props.channelImage && <img className='channel' src={props.channelImage} />}
            <WatchProgress id={props.video.id} duration={props.video.duration} />
          </Link>
        </aside>
        <main>
          <h4>{props.video.title}</h4>
          <div>
            {durationDisplay && <p className='duration'>
              <Icon name='clock' rightText={durationDisplay} />
            </p>}
            <p className='pub-date'>{date(props.video.published)}</p>
          </div>
        </main>
      </div>
      {playlistPicker()}
    </div>
  )
})
