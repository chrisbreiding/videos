import dispatcher from '../lib/dispatcher'
import actions from './login-actions'

class LoginStore {
  constructor () {
    this.bindListeners({
      onApiKeyUpdate: actions.DID_UPDATE_API_KEY,
    })
  }

  onApiKeyUpdate (apiKey) {
    this.apiKey = apiKey
  }
}

export default dispatcher.createStore(LoginStore, 'LoginStore')
