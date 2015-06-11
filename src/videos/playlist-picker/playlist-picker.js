import _ from 'lodash';
import { createClass, DOM } from 'react';
import cs from 'classnames';
import { icon } from '../../lib/util';

export default createClass({
  getInitialState () {
    return { pickingPlaylist: false };
  },

  render () {
    const iconName = this.state.picking ? 'chevron-up' : 'chevron-down';

    return DOM.div({ className: cs('playlist-picker', { picking: this.state.picking }) },
      DOM.button({ onClick: this._togglePicking }, icon(iconName, null, 'Playlists')),
      DOM.ul(null, this.props.playlists.map((playlist) => {
        const inPlaylist = !!playlist.getIn(['videos', this.props.videoId]);

        return DOM.li({ key: playlist.get('id') },
          DOM.button({ onClick: _.partial(this._setPlaylist, playlist, !inPlaylist) },
            icon(inPlaylist ? 'check-square' : 'square-o'),
            DOM.span(null, playlist.get('title'))
          )
        );
      }))
    );
  },

  _togglePicking () {
    this.setState({ picking: !this.state.picking });
  },

  _setPlaylist (playlist, inPlaylist) {
    if (inPlaylist) {
      this.props.addedToPlaylist(playlist);
    } else {
      this.props.removedFromPlaylist(playlist);
    }
  }
});
