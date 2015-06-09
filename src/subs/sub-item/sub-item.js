import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent } from 'react-router';
import { icon } from '../../lib/util';
import ChannelComponent from './channel';
import CustomPlaylistComponent from './custom-playlist';

const Channel = createFactory(ChannelComponent);
const CustomPlaylist = createFactory(CustomPlaylistComponent);
const Link = createFactory(LinkComponent);

export default createClass({
  render () {
    return DOM.li({ className: 'sub-item' },
      DOM.button({ className: 'remove', onClick: this._remove }, icon('minus-circle')),
      this.props.sub.get('custom') ? CustomPlaylist(this.props) : Channel(this.props)
    );
  },

  _remove () {
    if (confirm(`Remove ${this.props.sub.get('title') || this.props.sub.get('author')}?`)) {
      this.props.onRemove();
    }
  }
});
