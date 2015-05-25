import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { State, Navigation } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import VideosStore from '../videos/videos-store';
import { getVideosForChannel } from '../videos/videos-actions';
import PaginatorComponent from '../paginator/paginator';
import VideoComponent from '../videos/video';
import { icon } from '../lib/util';

const Paginator = createFactory(PaginatorComponent);
const Video = createFactory(VideoComponent);

export default createClass({
  mixins: [ReactStateMagicMixin, State, Navigation],

  statics: {
    registerStore: VideosStore
  },

  componentDidMount () {
    getVideosForChannel(this._getId());
  },

  componentDidUpdate (__, prevState) {
    const newId = this._getId();
    const oldId = prevState.channelId;

    const newToken = this._getPageToken();
    const oldToken = this.pageToken;
    this.pageToken = newToken;

    if (oldId !== newId || oldToken !== newToken) {
      getVideosForChannel(newId, newToken);
    }
  },

  _getId () {
    return this.getParams().id;
  },

  _getPageToken () {
    return this.getQuery().pageToken;
  },

  render () {
    return this.state.videos.length ? this._sub() : this._loader();
  },

  _sub () {
    const { prevPageToken, nextPageToken } = this.state;
    return DOM.div(null,
      Paginator({ prevPageToken, nextPageToken }),
      this._videos(),
      Paginator({ prevPageToken, nextPageToken })
    );
  },

  _videos() {
    return _.map(this.state.videos, (video) => {
      return Video(_.extend({
        key: video.id, onPlay: _.partial(this._playVideo, video.id)
      }, video));
    });
  },

  _loader () {
    return DOM.div({ className: 'loader' },
      icon('spin fa-play-circle'),
      icon('spin fa-play-circle'),
      icon('spin fa-play-circle')
    );
  },

  _playVideo (id) {
    const query = _.extend({}, this.getQuery(), { nowPlaying: id });
    this.transitionTo(this.getPathname(), this.getParams(), query);
  }
});
