// import dispatcher from '../lib/dispatcher'
import { getItem, setItem } from '../lib/local-data'
import { API_KEY_KEY } from '../lib/constants'

class LoginActions {
  didUpdateApiKey (apiKey) {
    this.dispatch(apiKey)
  }
}

export default dispatcher.createActions(LoginActions)
