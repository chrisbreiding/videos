import _ from 'lodash'
import cs from 'classnames'
import MarkDown from 'markdown-it'
import { action } from 'mobx'
import { observer, useLocalStore } from 'mobx-react'
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import DocumentTitle from 'react-document-title'

import YoutubePlayer from '../lib/youtube-player'
import appState from '../app/app-state'
import { icon } from '../lib/util'
import videosStore from '../videos/videos-store'
import videosService from '../videos/videos-service'
import PlaylistPicker from '../playlist-picker/playlist-picker'

const md = new MarkDown({ linkify: true })

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  tokens[idx].attrPush(['target', '_blank'])
  return self.renderToken(tokens, idx, options)
}

const NowPlaying = observer((props) => {
  const state = useLocalStore(() => ({
    title: '...',
    description: 'Loading description...',
    isShowingDescription: false,
    isShowingPlaylists: false,
    setTitle: action((title) => {
      state.title = title
    }),
    setDescription: action((description) => {
      state.description = description
    }),
    setShowingDescription: action((isShowingDescription) => {
      if (isShowingDescription) state.isShowingPlaylists = false
      state.isShowingDescription = isShowingDescription
    }),
    setShowingPlaylists: action((isShowingPlaylists) => {
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

  const setVideoProps = (video) => {
    state.setTitle(video.title)
    state.setDescription(video.description)
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
  }, [props.id])

  if (!props.id) return null

  const description = md.render(state.description)

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
        onEnd={props.onEnd}
      />
      <div className='cover' />
      <div className='controls'>
        <Link className='close button' to={props.closeLink}>{icon('remove')}</Link>
        <button
          className={cs('toggle-auto-play', { enabled: props.autoPlayEnabled })}
          onClick={props.onToggleAutoPlay}
        >
          {icon('refresh')}
        </button>
        <button
          className={cs('toggle-description', { enabled: state.isShowingDescription })}
          onClick={state.toggleShowingDescription}
        >
          {icon('info')}
        </button>
        <button
          className={cs('toggle-playlists', { enabled: state.isShowingPlaylists })}
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
            playlists={props.playlists}
            addedToPlaylist={props.addedToPlaylist}
            removedFromPlaylist={props.removedFromPlaylist}
          />
        }
      </div>
    </div>
  )
})

export default NowPlaying
