import _ from 'lodash';
import React, { createClass } from 'react';
import { Link } from 'react-router';
import { icon } from '../../lib/util';
import Channel from './channel';
import CustomPlaylist from './custom-playlist';

export default createClass({
  render () {
    return <li className='sub-item'>
      <button className='remove' onClick={this._remove}>{icon('minus-circle')}</button>
      {this.props.sub.get('custom') ? <CustomPlaylist {...this.props} /> : <Channel {...this.props} /> }
    </li>
  },

  _remove () {
    if (confirm(`Remove ${this.props.sub.get('title') || this.props.sub.get('author')}?`)) {
      this.props.onRemove();
    }
  }
});
