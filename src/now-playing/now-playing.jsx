import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
// import { History } from 'react-router'
import YoutubePlayer from '../lib/youtube-player'
import { icon } from '../lib/util'

class NowPlaying extends Component {
  // mixins: [History],

  contextTypes: {
    location: PropTypes.object,
  }

  render () {
    const id = this.context.location.query.nowPlaying
    if (!id) return null

    return (<div className='now-playing'>
      <YoutubePlayer id={id} />
      <button onClick={this._onClose}>{icon('remove')}</button>,
    </div>)
  }

  _onClose () {
    const query = _.omit(this.context.location.query || {}, 'nowPlaying')
    this.history.pushState(null, this.context.location.pathname, query)
  }
}

export default NowPlaying
