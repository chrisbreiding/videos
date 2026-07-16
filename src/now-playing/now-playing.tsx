import cs from 'classnames'
import MarkDown from 'markdown-it'
import { action } from 'mobx'
import { observer, useLocalStore } from 'mobx-react'
import { useEffect } from 'react'
import { Link } from 'react-router'

import { YoutubePlayer } from '../lib/youtube-player'
import { appState } from '../app/app-state'
import { DocumentTitle } from '../lib/document-title'
import { icon, durationSeconds } from '../lib/util'
import { videosStore } from '../videos/videos-store'
import { videosService } from '../videos/videos-service'
import { PlaylistPicker } from '../playlist-picker/playlist-picker'
import type { VideoModel } from '../videos/video-model'
import type { SubModel } from '../sub/sub-model'
import type { LinkLocation, VideoData } from '../lib/types'

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

export const NowPlaying = observer((props: NowPlayingProps) => {
  const state = useLocalStore(() => ({
    title: '...',
    description: 'Loading description...',
    isShowingDescription: false,
    isShowingPlaylists: false,
    setTitle: action((title: string) => {
      state.title = title
    }),
    setDescription: action((description: string) => {
      state.description = description
    }),
    setShowingDescription: action((isShowingDescription: boolean) => {
      if (isShowingDescription) state.isShowingPlaylists = false
      state.isShowingDescription = isShowingDescription
    }),
    setShowingPlaylists: action((isShowingPlaylists: boolean) => {
      if (isShowingPlaylists) state.isShowingDescription = false
      state.isShowingPlaylists = isShowingPlaylists
    }),
    toggleShowingDescription: () => {
      state.setShowingDescription(!state.isShowingDescription)
    },
    toggleShowingPlaylists: () => {
      state.setShowingPlaylists(!state.isShowingPlaylists)
    },
  }))

  const setVideoProps = (video: VideoData | VideoModel) => {
    state.setTitle(video.title!)
    state.setDescription(video.description!)
  }

  useEffect(() => {
    state.setShowingDescription(false)

    if (!props.id) return

    const video = videosStore.getVideoById(props.id)

    if (video) {
      setVideoProps(video)
      return
    }

    videosService.getVideo(props.id).then(setVideoProps)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.id])

  if (!props.id) return null

  const description = md.render(state.description)
  const watched = appState.watchedVideos[props.id]
  const video = videosStore.getVideoById(props.id)
  const length = video ? durationSeconds(video.duration) : 0
  // start from the beginning if progress is within 10% or 10s of end,
  // whichever is greater
  const endThreshold = Math.max(length * 0.1, 10)
  const isNearEnd = length && watched && watched.watchTimestamp >= length - endThreshold
  const startTime = watched && !isNearEnd ? watched.watchTimestamp : 0

  return (
    <div
      className={cs('now-playing', {
        'is-showing-description': state.isShowingDescription,
        'is-showing-playlists': state.isShowingPlaylists,
      })}
      style={{ height: appState.nowPlayingHeight }}
    >
      <DocumentTitle title={`${state.title} | Videos`} />
      <YoutubePlayer
        id={props.id}
        width={appState.nowPlayingWidth}
        height={appState.nowPlayingHeight}
        startTime={startTime}
        onEnd={props.onEnd}
        onTime={(watchTimestamp, immediate) => (
          appState.saveVideoProgress(props.id!, watchTimestamp, immediate)
        )}
      />
      <div className='cover' />
      <div className='controls'>
        <Link
          className='close button'
          title='Close Video'
          to={props.closeLink}
        >
          {icon('remove')}
        </Link>
        <button
          className={cs('toggle-auto-play', { enabled: props.autoPlayEnabled })}
          title='Toggle Auto Play'
          onClick={props.onToggleAutoPlay}
        >
          {icon('forward')}
        </button>
        <button
          className={cs('toggle-description', { enabled: state.isShowingDescription })}
          title='Toggle Description'
          onClick={state.toggleShowingDescription}
        >
          {icon('info')}
        </button>
        <button
          className={cs('toggle-playlists', { enabled: state.isShowingPlaylists })}
          title='Toggle Playlists'
          onClick={state.toggleShowingPlaylists}
        >
          {icon('list-ul')}
        </button>
      </div>
      <div
        className='description'
        dangerouslySetInnerHTML={{ __html: description }}
      />
      <div className='playlists'>
        {state.isShowingPlaylists &&
          <PlaylistPicker
            videoId={props.id}
            customPlaylists={props.customPlaylists}
            addedToPlaylist={props.addedToPlaylist}
            removedFromPlaylist={props.removedFromPlaylist}
          />
        }
      </div>
    </div>
  )
})
