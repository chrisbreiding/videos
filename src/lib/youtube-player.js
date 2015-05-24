import { createClass, DOM } from 'react';

const SCRIPT_ID = 'youtube-player-api-script';
const PLAYER_ID = 'youtube-player';

export default createClass({

  componentDidMount () {
    window.onYouTubeIframeAPIReady = this._apiLoaded;
    this._loadScript();
  },

  componentWillUnmount () {
    window.onYouTubeIframeAPIReady = null;
  },

  _loadScript () {
    if (this._scriptLoaded()) return this._apiLoaded();

    let script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
  },

  _scriptLoaded () {
    return !!document.getElementById(SCRIPT_ID);
  },

  _apiLoaded () {
    this._player = new YT.Player(PLAYER_ID, {
      height: '540',
      width: '960',
      videoId: this.props.id
    });
  },

  render () {
    return DOM.div({ className: PLAYER_ID, id: PLAYER_ID });
  }
});
