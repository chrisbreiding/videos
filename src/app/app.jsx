import React, { createClass } from 'react';
import { History } from 'react-router'
import { getApiKey, checkApiKey } from '../login/login-actions';
import NowPlaying from '../now-playing/now-playing';
import Subs from '../subs/subs';

export default createClass({
  mixins: [History],

  componentDidMount () {
    getApiKey().then((apiKey) => {
      return checkApiKey(apiKey);
    }).then((isValid) => {
      if (!isValid) this.history.pushState(null, '/login');
    });
  },

  render () {
    return <div className='app'>
      <NowPlaying />
      <div className='subs'>
        <Subs params={this.props.params} />
        <main>{this.props.children}</main>
      </div>
    </div>
  }
});
