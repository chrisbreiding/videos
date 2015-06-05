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
    const props = _.extend({}, this.props, { onRemove: this._remove });
    return DOM.li({ className: 'sub-item' },
      DOM.button({ className: 'remove', onClick: this.props.onRemove }, icon('minus-circle')),
      this.props.custom ? CustomPlaylist(props) : Channel(props)
    );
  },

  _remove () {
    if (confirm(`Remove ${this.props.title || this.props.author}?`)) {
      this.props.onRemove();
    }
  }
});
