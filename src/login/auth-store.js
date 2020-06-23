import { action, observable } from 'mobx'

import {
  getCurrentUser,
  getDoc,
  onAuthStateChanged,
  signIn,
  signOut,
  updateDoc,
} from '../lib/firebase'
import youtube from '../lib/youtube'

class AuthStore {
  @observable youtubeApiKey = ''

  isAuthenticated () {
    return !!getCurrentUser() && !!this.youtubeApiKey
  }

  userId () {
    return getCurrentUser()?.uid
  }

  onChange (cb) {
    onAuthStateChanged(cb)
  }

  async getApiKey () {
    if (this.youtubeApiKey) return this.youtubeApiKey

    const { youtubeApiKey } = await getDoc()

    this.setApiKey(youtubeApiKey)

    return youtubeApiKey
  }

  @action setApiKey (youtubeApiKey) {
    if (!youtubeApiKey) return

    this.youtubeApiKey = youtubeApiKey
  }

  saveApiKey = (youtubeApiKey) => {
    if (!youtubeApiKey) return Promise.resolve()

    this.youtubeApiKey = youtubeApiKey

    return updateDoc({ youtubeApiKey })
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
