import cs from 'classnames'
import { observer } from 'mobx-react'
import React from 'react'

import YoutubePlayer from '../lib/youtube-player'
import appState from '../app/app-state'
import { icon } from '../lib/util'

const padding = 15

const NowPlaying = observer((props) => {
  if (!props.id) return null

  return (
    <div className='now-playing' style={{ height: appState.nowPlayingHeight, padding }}>
      <YoutubePlayer
        id={props.id}
        width={appState.nowPlayingWidth - (padding * 2)}
        height={appState.nowPlayingHeight - (padding * 2)}
        onEnd={props.onEnd}
      />
      <div className='cover' />
      <button className='close' onClick={props.onClose}>{icon('remove')}</button>
      <button
        className={cs('toggle-auto-play', {
          enabled: props.autoPlayEnabled,
        })}
        onClick={props.onToggleAutoPlay}
      >
        {icon('refresh')}
      </button>
    </div>
  )
})

export default NowPlaying
