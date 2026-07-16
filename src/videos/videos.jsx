import cs from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'

import { updatedLink } from '../lib/util'
import { subsStore } from '../subs/subs-store'
import { videosStore } from '../videos/videos-store'

import { Video } from './video'

const VideosList = observer((props) => {
  const {
    showChannelImage,
    isSortable,
    location,
    markedVideoId,
    onPlay,
    onRemoveMark,
    onUpdateVideoMarkerLink,
  } = props

  return (
    <div className={cs('videos-list', { 'videos-is-sortable': isSortable })}>
      {_.map(videosStore.videos, (video, index) => {
        const id = video.id
        const playVideoLink = updatedLink(location, { search: { nowPlaying: id } })

        return (
          <Video
            key={id}
            index={index}
            isSortable={isSortable}
            onPlay={_.partial(onPlay, id)}
            playLink={playVideoLink}
            addVideoMarkerLink={onUpdateVideoMarkerLink}
            customPlaylists={subsStore.customPlaylists}
            video={video}
            isMarked={id === markedVideoId}
            onRemoveMark={onRemoveMark}
            channelImage={showChannelImage && subsStore.getChannelImage(video.channelId)}
            addedToPlaylist={(playlist) => subsStore.addVideoToPlaylist(playlist, id)}
            removedFromPlaylist={(playlist) => subsStore.removeVideoFromPlaylist(playlist, id)}
          />
        )
      })}
    </div>
  )
})

export const Videos = (props) => {
  const handleDragEnd = (event) => {
    const ids = _.map(videosStore.videos, 'id')
    const sortedIds = event.canceled ? ids : move(ids, event)

    props.onSortEnd(sortedIds)
  }

  return (
    <DragDropProvider onDragStart={props.onSortStart} onDragEnd={handleDragEnd}>
      <VideosList {...props} />
    </DragDropProvider>
  )
}
