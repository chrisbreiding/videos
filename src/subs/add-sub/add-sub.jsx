import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Link } from 'react-router'

import { icon } from '../../lib/util'

import AddChannel from './add-channel'
import AddCustomPlaylist from './add-custom-playlist'

@observer
class AddSub extends Component {
  render () {
    return (
      <div className='add-sub'>
        <header>
          <Link to={this.props.linkTo('channel')}>{icon('plus', 'Channel')}</Link>
          <Link to={this.props.linkTo('customPlaylist')}>{icon('plus', 'Custom Playlist')}</Link>
        </header>
        {this._subComponent()}
      </div>
    )
  }

  _subComponent () {
    const { type } = this.props
    if (!type) return null

    const Component = type === 'channel' ? AddChannel : AddCustomPlaylist

    return (
      <main>
        <header><Link to={this.props.linkTo()}>Done</Link></header>
        <Component {...this.props} />
      </main>
    )
  }
}

export default AddSub
