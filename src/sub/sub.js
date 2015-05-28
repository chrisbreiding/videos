import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { State, Navigation } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import VideosStore from '../videos/videos-store';
import { getVideosForPlaylist, clearVideos } from '../videos/videos-actions';
import SubStore from '../sub/sub-store';
import { getSub } from '../sub/sub-actions';
import PaginatorComponent from '../paginator/paginator';
import VideoComponent from '../videos/video';
import { icon } from '../lib/util';

const Paginator = createFactory(PaginatorComponent);
const Video = createFactory(VideoComponent);

export default createClass({
  mixins: [ReactStateMagicMixin, State, Navigation],

  statics: {
    registerStores: {
      sub: SubStore,
      videos: VideosStore
    }
  },

  componentDidMount () {
    getSub(this._getId());
  },

  componentDidUpdate (__, prevState) {
    const newId = this._getId();
    const oldId = prevState.sub.id;

    const newPlaylistId = this.state.sub.sub.playlistId;
    const oldPlaylistId = prevState.sub.sub.playlistId;

    const newToken = this._getPageToken();
    const oldToken = this.pageToken;
    this.pageToken = newToken;

    if (oldId !== newId) {
      getSub(newId);
    } else if (oldPlaylistId !== newPlaylistId || oldToken !== newToken) {
      setTimeout(() => getVideosForPlaylist(newPlaylistId, newToken) );
    }
  },

  _getId () {
    return this.getParams().id;
  },

  _getPageToken () {
    return this.getQuery().pageToken;
  },

  render () {
    return this.state.videos.videos.length ? this._sub() : this._loader();
  },

  _sub () {
    const { prevPageToken, nextPageToken } = this.state.videos;
    return DOM.div(null,
      Paginator({ prevPageToken, nextPageToken }),
      this._videos(),
      Paginator({ prevPageToken, nextPageToken })
    );
  },

  _videos() {
    return _.map(this.state.videos.videos, (video) => {
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
