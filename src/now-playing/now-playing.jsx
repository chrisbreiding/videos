import { observer } from 'mobx-react'
import React from 'react'

import YoutubePlayer from '../lib/youtube-player'
import { icon } from '../lib/util'

const NowPlaying = observer(({ id, onClose }) => {
  if (!id) return null

  return (
    <div className='now-playing'>
      <YoutubePlayer id={id} />
      <button onClick={onClose}>{icon('remove')}</button>
    </div>
  )
})

export default NowPlaying
