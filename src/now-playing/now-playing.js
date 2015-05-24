import { createFactory, createClass, DOM } from 'react';
import { State, Navigation } from 'react-router';
import YoutubePlayerComponent from '../lib/youtube-player';
import { icon } from '../lib/util';

const YoutubePlayer = createFactory(YoutubePlayerComponent);

export default createClass({
  mixins: [State, Navigation],

  render () {
    const id = this.getQuery().nowPlaying;
    if (!id) return null;

    return DOM.div({ className: 'now-playing' },
      YoutubePlayer({ id }),
      DOM.button({ onClick: this._onClose }, icon('remove'))
    );
  },

  _onClose () {
    const query = _.omit(this.getQuery() || {}, 'nowPlaying');
    this.transitionTo(this.getPathname(), this.getParams(), query);
  }
});
