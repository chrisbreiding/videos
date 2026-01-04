import { action, computed, makeObservable, observable } from 'mobx'

import { getDoc, signIn, signOut } from '../lib/firebase'
import { checkApiKey as checkApiKeyYoutube } from '../lib/youtube'

class AuthStore {
  userId
  youtubeApiKey

  constructor () {
    makeObservable(this, {
      userId: observable,
      youtubeApiKey: observable,
      isAuthenticated: computed,
      setUserId: action,
      setApiKey: action,
    })
  }

  get isAuthenticated () {
    return !!this.userId && !!this.youtubeApiKey
  }

  async getApiKey () {
    if (this.youtubeApiKey) return this.youtubeApiKey

    const { youtubeApiKey } = await getDoc()

    this.setApiKey(youtubeApiKey)

    return youtubeApiKey
  }

  setUserId (userId) {
    this.userId = userId
  }

  setApiKey (youtubeApiKey) {
    if (!youtubeApiKey) return

    this.youtubeApiKey = youtubeApiKey
  }

  checkApiKey = (apiKey) => {
    if (!apiKey) return Promise.resolve(false)

    return checkApiKeyYoutube(apiKey)
  }

  login (email, password) {
    return signIn(email, password)
  }

  logout () {
    return signOut()
  }
}

export const authStore = new AuthStore()
