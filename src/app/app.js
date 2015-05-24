import { createFactory, createClass, DOM } from 'react';
import { Navigation } from 'react-router'
import { getApiKey, checkApiKey } from '../login/login-actions';
import NowPlayingComponent from '../now-playing/now-playing';
import SubsComponent from '../subs/subs';

const NowPlaying = createFactory(NowPlayingComponent);
const Subs = createFactory(SubsComponent);

export default createClass({
  mixins: [Navigation],

  componentDidMount () {
    getApiKey().then((apiKey) => {
      return checkApiKey(apiKey);
    }).then((isValid) => {
      if (!isValid) this.transitionTo('login');
    });
  },

  render () {
    return DOM.div({ className: 'app' }, NowPlaying(), Subs());
  }
});
