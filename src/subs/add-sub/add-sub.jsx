import _ from 'lodash';
import React, { createClass, PropTypes } from 'react';
import { Link, History } from 'react-router';
import AddChannel from './add-channel';
import AddCustomPlaylist from './add-custom-playlist';
import { icon } from '../../lib/util';

export default createClass({
  mixins: [History],

  contextTypes: {
    location: PropTypes.object
  },

  render () {
    return <div className='add-sub' >
      <header>
        <Link {...this._linkProps('channel')}>{icon('plus', 'Channel')}</Link>
        <Link {...this._linkProps('customPlaylist')}>{icon('plus', 'Custom Playlist')}</Link>
      </header>
      {this._subComponent()}
    </div>
  },

  _subComponent () {
    const type = this._addingType();
    if (!type) return null;

    const Component = type === 'channel' ? AddChannel : AddCustomPlaylist;

    return <main>
      <header><Link {...this._linkProps()}>Done</Link></header>
      <Component onAdd={this._closeAdding} clearSearch={this._clearSearch} params={this.props.params} />
    </main>
  },

  _linkProps (type) {
    const ret = {
      to: this.context.location.pathname,
      query: _.extend({}, this.context.location.query, { adding: type })
    };
    return ret;
  },

  _closeAdding () {
    const { to, query } = this._linkProps();
    this.history.pushState(null, to, query);
  },

  _clearSearch () {
    this.history.replaceState(null, this.context.location.pathname, _.omit(this.context.location.query, 'q'));
  },

  _addingType () {
    return this.context.location.query.adding;
  }
});
