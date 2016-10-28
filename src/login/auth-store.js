import { action, observable } from 'mobx'
import { Promise } from 'rsvp'

import { getItem, setItem } from '../lib/local-data'
import { API_KEY_KEY } from '../lib/constants'
import youtube from '../lib/youtube'

class AuthStore {
  @observable apiKey = ''

  getApiKey () {
    return getItem(API_KEY_KEY)
  }

  setApiKey = (apiKey) => {
    if (!apiKey) return

    this.apiKey = apiKey
  }

  saveApiKey =  (apiKey) => {
    if (!apiKey) return Promise.resolve()

    this.apiKey = apiKey
    return setItem(API_KEY_KEY, this.apiKey)
  }

  checkApiKey = (apiKey) => {
    if (!apiKey) return Promise.resolve(false)

    return youtube.checkApiKey(apiKey)
  }

  login () {
    this.checkApiKey(this.apiKey).then(action('set:api:key', (isValid) => {
      if (!isValid) return Promise.resolve(isValid)

      return setItem(API_KEY_KEY, this.apiKey).then(() => {
        return isValid
      })
    }))
  }
}

export default new AuthStore()
