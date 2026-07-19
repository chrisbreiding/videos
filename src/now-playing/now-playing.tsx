import cs from 'classnames'
import MarkDown from 'markdown-it'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { YoutubePlayer } from '../lib/youtube-player'
import { useAppContext } from '../app/app-context'
import { DocumentTitle } from '../lib/document-title'
import { Icon, durationSeconds } from '../lib/util'
import { useVideosContext } from '../videos/videos-context'
import { videosService } from '../videos/videos-service'
import { PlaylistPicker } from '../playlist-picker/playlist-picker'
import { VideoModel } from '../videos/video-model'
import type { SubModel } from '../sub/sub-model'
import type { LinkLocation } from '../lib/types'

const md = new MarkDown({ linkify: true })

md.renderer.rules.link_open = function (tokens, idx, options, _env, self) {
  tokens[idx].attrPush(['target', '_blank'] as [string, string])
  return self.renderToken(tokens, idx, options)
}

interface NowPlayingProps {
  id?: string
  autoPlayEnabled: boolean
  customPlaylists: SubModel[]
  closeLink: LinkLocation
  onEnd: () => void
  onToggleAutoPlay: () => void
  addedToPlaylist: (playlist: SubModel) => void
  removedFromPlaylist: (playlist: SubModel) => void
}

export const NowPlaying = (props: NowPlayingProps) => {
  const { watchedVideos, nowPlayingHeight, nowPlayingWidth, saveVideoProgress } =
    useAppContext()
  const { getVideoById } = useVideosContext()

  const [title, setTitle] = useState('...')
  const [description, setDescription] = useState('Loading description...')
  const [isShowingDescription, setIsShowingDescription] = useState(false)
  const [isShowingPlaylists, setIsShowingPlaylists] = useState(false)

  const showDescription = (show: boolean) => {
    if (show) setIsShowingPlaylists(false)
    setIsShowingDescription(show)
  }

  const showPlaylists = (show: boolean) => {
    if (show) setIsShowingDescription(false)
    setIsShowingPlaylists(show)
  }

  const toggleShowingDescription = () => {
    showDescription(!isShowingDescription)
  }

  const toggleShowingPlaylists = () => {
    showPlaylists(!isShowingPlaylists)
  }

  const setVideoProps = (video: VideoModel) => {
    setTitle(video.title)
    setDescription(video.description)
  }

  useEffect(() => {
    showDescription(false)

    if (!props.id) return
    const id = props.id

    const video = getVideoById(id)

    if (video) {
      setVideoProps(video)
      return
    }

    const loadVideo = async () => {
      const videoData = await videosService.getVideo(id)
      setVideoProps(VideoModel.fromVideoData(videoData))
    }

    loadVideo()
  }, [props.id, getVideoById])

  if (!props.id) return null

  const descriptionHtml = md.render(description)
  const watched = watchedVideos[props.id]
  const video = getVideoById(props.id)
  const length = video ? durationSeconds(video.duration) : 0
  // start from the beginning if progress is within 10% or 10s of end,
  // whichever is greater
  const endThreshold = Math.max(length * 0.1, 10)
  const isNearEnd =
    length && watched && watched.watchTimestamp >= length - endThreshold
  const startTime = watched && !isNearEnd ? watched.watchTimestamp : 0

  return (
    <div
      className={cs('now-playing', {
        'is-showing-description': isShowingDescription,
        'is-showing-playlists': isShowingPlaylists,
      })}
      style={{ height: nowPlayingHeight }}
    >
      <DocumentTitle title={`${title} | Videos`} />
      <YoutubePlayer
        id={props.id}
        width={nowPlayingWidth}
        height={nowPlayingHeight}
        startTime={startTime}
        onEnd={props.onEnd}
        onTime={(watchTimestamp, immediate) =>
          saveVideoProgress(props.id!, watchTimestamp, immediate)
        }
      />
      <div className="cover" />
      <div className="controls">
        <Link className="close button" title="Close Video" to={props.closeLink}>
          <Icon name="remove" />
        </Link>
        <button
          className={cs('toggle-auto-play', { enabled: props.autoPlayEnabled })}
          title="Toggle Auto Play"
          onClick={props.onToggleAutoPlay}
        >
          <Icon name="repeat" />
        </button>
        <button
          className={cs('toggle-description', {
            enabled: isShowingDescription,
          })}
          title="Toggle Description"
          onClick={toggleShowingDescription}
        >
          <Icon name="circle-info" />
        </button>
        <button
          className={cs('toggle-playlists', {
            enabled: isShowingPlaylists,
          })}
          title="Toggle Playlists"
          onClick={toggleShowingPlaylists}
        >
          <Icon name="list-ul" />
        </button>
      </div>
      <div
        className="description"
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
      <div className="playlists">
        {isShowingPlaylists && (
          <PlaylistPicker
            videoId={props.id}
            customPlaylists={props.customPlaylists}
            addedToPlaylist={props.addedToPlaylist}
            removedFromPlaylist={props.removedFromPlaylist}
          />
        )}
      </div>
    </div>
  )
}
