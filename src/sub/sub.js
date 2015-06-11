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

    const newPlaylistId = this.state.sub.sub.get('playlistId');
    const oldPlaylistId = prevState.sub.sub.get('playlistId');

    const newToken = this._getPageToken();
    const oldToken = this.pageToken;
    this.pageToken = newToken;

    if (oldId !== newId) {
      subActions.getSub(newId);
    } else if (oldPlaylistId !== newPlaylistId || oldToken !== newToken) {
      setTimeout(() => {
        if (this.state.sub.sub.get('custom')) {
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
    return this.state.videos.videos.size ? this._sub() : this._loader();
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
    return this.state.videos.videos.map((video) => {
      const id = video.get('id');

      return Video({
        key: id,
        onPlay: _.partial(this._playVideo, id),
        subs: this.state.subs.subs,
        video: video,
        addedToPlaylist: (playlist) => { subsActions.addVideoToPlaylist(playlist, id) },
        removedFromPlaylist: (playlist) => { subsActions.removeVideoFromPlaylist(playlist, id) }
      });
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
