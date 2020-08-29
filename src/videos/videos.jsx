import cs from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React from 'react'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

import { updatedLink } from '../lib/util'
import subsStore from '../subs/subs-store'
import videosStore from '../videos/videos-store'

import Video from './video'

const SortableVideo = SortableElement(Video)

const VideosList = observer((props) => {
  const {
    showChannelImage,
    isCustom,
    location,
    markedVideoId,
    onPlay,
    onRemoveMark,
    onUpdateVideoMarkerLink,
  } = props

  const VideoItem = isCustom ? SortableVideo : Video

  return (
    <div className={cs('videos-list', { 'videos-is-custom': isCustom })}>
      {_.map(videosStore.videos, (video, index) => {
        const id = video.id
        const playVideoLink = updatedLink(location, { search: { nowPlaying: id } })

        return (
          <VideoItem
            key={id}
            index={index}
            onPlay={_.partial(onPlay, id)}
            playLink={playVideoLink}
            addVideoMarkerLink={onUpdateVideoMarkerLink}
            playlists={subsStore.playlists}
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

const SortableVideos = SortableContainer(VideosList)

const Videos = (props) => {
  const onSortEnd = (sortProps) => {
    props.onSortEnd(sortProps)
  }

  const TheVideos = props.isCustom ? SortableVideos : VideosList

  return (
    <TheVideos
      {...props}
      useDragHandle={true}
      helperClass='videos-sort-helper'
      onSortStart={props.onSortStart}
      onSortEnd={onSortEnd}
    />
  )
}

export default Videos
