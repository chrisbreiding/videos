import dispatcher from '../lib/dispatcher';
import { UPDATE_API_KEY } from './login-actions'

class LoginStore {
  constructor () {
    this.isApiKeyValid = false;

    this.bindListeners({
      onApiKeyUpdate: UPDATE_API_KEY
    });
  }

  onApiKeyUpdate ({ apiKey, isValid }) {
    this.apiKey = apiKey;
    this.isApiKeyValid = isValid;
  }
}

export default dispatcher.createStore(LoginStore, 'LoginStore');
