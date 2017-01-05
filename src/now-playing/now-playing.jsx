import { observer } from 'mobx-react'
import React from 'react'

import YoutubePlayer from '../lib/youtube-player'
import appState from '../app/app-state'
import { icon } from '../lib/util'

const padding = 15

const NowPlaying = observer(({ id, onClose }) => {
  if (!id) return null

  return (
    <div className='now-playing' style={{ height: appState.nowPlayingHeight, padding }}>
      <YoutubePlayer
        id={id}
        width={appState.nowPlayingWidth - (padding * 2)}
        height={appState.nowPlayingHeight - (padding * 2)}
      />
      <div className='cover' />
      <button onClick={onClose}>{icon('remove')}</button>
    </div>
  )
})

export default NowPlaying
