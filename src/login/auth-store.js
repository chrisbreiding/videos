import { action, observable } from 'mobx'

import { getDoc, signIn, signOut } from '../lib/firebase'
import youtube from '../lib/youtube'

class AuthStore {
  @observable userId
  @observable youtubeApiKey

  isAuthenticated () {
    return !!this.userId && !!this.youtubeApiKey
  }

  async getApiKey () {
    if (this.youtubeApiKey) return this.youtubeApiKey

    const { youtubeApiKey } = await getDoc()

    this.setApiKey(youtubeApiKey)

    return youtubeApiKey
  }

  @action setUserId (userId) {
    this.userId = userId
  }

  @action setApiKey (youtubeApiKey) {
    if (!youtubeApiKey) return

    this.youtubeApiKey = youtubeApiKey
  }

  checkApiKey = (apiKey) => {
    if (!apiKey) return Promise.resolve(false)

    return youtube.checkApiKey(apiKey)
  }

  login (email, password) {
    return signIn(email, password)
  }

  logout () {
    return signOut()
  }
}

export default new AuthStore()
