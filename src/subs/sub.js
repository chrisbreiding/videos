import _ from 'lodash';
import { createClass, DOM } from 'react';
import { State } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import VideosStore from '../videos/videos-store';
import { getVideosForChannel } from '../videos/videos-actions';

export default createClass({
  mixins: [ReactStateMagicMixin, State],

  statics: {
    registerStore: VideosStore
  },

  componentDidMount () {
    getVideosForChannel(this._getId());
  },

  componentDidUpdate (__, prevState) {
    const id = this._getId();
    if (!prevState.channelId || prevState.channelId === id) return;

    getVideosForChannel(id);
  },

  _getId () {
    return this.getParams().id;
  },

  render () {
    return DOM.div(null, _.map(this.state.videos, (video) => {
      return DOM.div(null, video.title);
    }));
  }
});
