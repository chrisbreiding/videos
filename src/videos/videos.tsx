import cs from 'classnames'
import type { Location } from 'react-router'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'

import { updatedLink } from '../lib/util'
import { useStore } from '../lib/store'
import { subsStore } from '../subs/subs-store'
import { useVideosContext } from '../videos/videos-context'

import { Video } from './video'
import type { SubModel } from '../sub/sub-model'

interface VideosProps {
  showChannelImage: boolean
  isSortable: boolean
  location: Location
  markedVideoId?: string | null
  onPlay: (id: string) => void
  onRemoveMark: () => void
  onSortStart: () => void
  onSortEnd: (sortedIds: string[]) => void
  onUpdateVideoMarkerLink: (marker: string) => void
}

const VideosList = (props: VideosProps) => {
  useStore(subsStore)
  const { videos } = useVideosContext()

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
      {videos.map((video, index) => {
        const id = video.id
        const playVideoLink = updatedLink(location, {
          search: { nowPlaying: id },
        })

        return (
          <Video
            key={id}
            index={index}
            isSortable={isSortable}
            onPlay={() => onPlay(id)}
            playLink={playVideoLink}
            addVideoMarkerLink={onUpdateVideoMarkerLink}
            customPlaylists={subsStore.customPlaylists}
            video={video}
            isMarked={id === markedVideoId}
            onRemoveMark={onRemoveMark}
            channelImage={
              showChannelImage && subsStore.getChannelImage(video.channelId)
            }
            addedToPlaylist={(playlist: SubModel) =>
              subsStore.addVideoToPlaylist(playlist, id)
            }
            removedFromPlaylist={(playlist: SubModel) =>
              subsStore.removeVideoFromPlaylist(playlist, id)
            }
          />
        )
      })}
    </div>
  )
}

export const Videos = (props: VideosProps) => {
  const { videos } = useVideosContext()

  const handleDragEnd = (event: DragEndEvent) => {
    const ids = videos.map((video) => video.id)
    const sortedIds = event.canceled ? ids : move(ids, event)

    props.onSortEnd(sortedIds)
  }

  return (
    <DragDropProvider onDragStart={props.onSortStart} onDragEnd={handleDragEnd}>
      <VideosList {...props} />
    </DragDropProvider>
  )
}
