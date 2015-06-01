import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { State, Navigation } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubStore from './sub-store';
import subActions from './sub-actions';
import SubsStore from '../subs/subs-store';
import subsActions from '../subs/subs-actions';
import VideosStore from '../videos/videos-store';
import videosActions from '../videos/videos-actions';
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
      subs: SubsStore,
      videos: VideosStore
    }
  },

  componentDidMount () {
    subActions.getSub(this._getId());
    subsActions.fetch();
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
      subActions.getSub(newId);
    } else if (oldPlaylistId !== newPlaylistId || oldToken !== newToken) {
      setTimeout(() => {
        if (this.state.sub.sub.custom) {
          videosActions.getVideosDataForCustomPlaylist(newId);
        } else {
          videosActions.getVideosDataForPlaylist(newPlaylistId, newToken);
        }
      });
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
        key: video.id,
        onPlay: _.partial(this._playVideo, video.id),
        subs: this.state.subs.subs,
        addedToPlaylist: (playlist) => { subsActions.addVideoToPlaylist(playlist, video.id) },
        removedFromPlaylist: (playlist) => { subsActions.removeVideoFromPlaylist(playlist, video.id) }
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
