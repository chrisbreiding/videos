import { Promise } from 'rsvp';
import dispatcher from '../lib/dispatcher';
import youtube from '../lib/youtube';
import { getItem, setItem } from '../lib/local-data';
import { API_KEY_KEY } from '../lib/constants';

class LoginActions {
  didUpdateApiKey (apiKey) {
    this.dispatch(apiKey);
  }

  getApiKey () {
    return getItem(API_KEY_KEY).then((apiKey) => {
      this.actions.didUpdateApiKey(apiKey);
      return apiKey;
    });
  }

  updateApiKey (apiKey) {
    this.actions.checkApiKey(apiKey).then((isValid) => {
      if (!isValid) return Promise.resolve(isValid);

      this.actions.didUpdateApiKey(apiKey);
      return setItem(API_KEY_KEY, apiKey);
    });
  }

  checkApiKey (apiKey) {
    return youtube.checkApiKey(apiKey);
  }
}

export default dispatcher.createActions(LoginActions);
