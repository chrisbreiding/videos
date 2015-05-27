import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent, Navigation, State } from 'react-router';
import AddChannelComponent from './add-channel';
import AddCustomPlaylistComponent from './add-custom-playlist';
import { icon } from '../../lib/util';

const AddChannel = createFactory(AddChannelComponent);
const AddCustomPlaylist = createFactory(AddCustomPlaylistComponent);
const Link = createFactory(LinkComponent);

export default createClass({
  mixins: [Navigation, State],

  render () {
    return DOM.div({ className: 'add-sub' },
      DOM.header(null,
        Link(this._linkProps('channel'), icon('plus', 'Channel')),
        Link(this._linkProps('customPlaylist'), icon('plus', 'Custom Playlist'))
      ),
      this._subComponent()
    );
  },

  _subComponent () {
    const type = this._addingType();
    if (!type) return null;

    return DOM.main(null,
      DOM.header(null, Link(this._linkProps(), 'Done')),
      { channel: AddChannel, customPlaylist: AddCustomPlaylist }[type]({
        onAdd: this._closeAdding
      })
    );
  },

  _linkProps (type) {
    return {
      to: this.getPathname(),
      params: this.getParams(),
      query: _.extend({}, this.getQuery(), { adding: type })
    }
  },

  _closeAdding () {
    const { to, params, query } = this._linkProps();
    this.transitionTo(to, params, query);
  },

  _addingType () {
    return this.getQuery().adding;
  }
});
