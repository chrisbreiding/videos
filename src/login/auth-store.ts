import { action, computed, makeObservable, observable } from 'mobx'

import { getDoc, signIn, signOut } from '../lib/firebase'
import { checkApiKey as checkApiKeyYoutube } from '../lib/youtube'

class AuthStore {
  userId?: string
  youtubeApiKey?: string

  constructor() {
    makeObservable(this, {
      userId: observable,
      youtubeApiKey: observable,
      isAuthenticated: computed,
      setUserId: action,
      setApiKey: action,
    })
  }

  get isAuthenticated() {
    return !!this.userId && !!this.youtubeApiKey
  }

  async getApiKey(): Promise<string> {
    if (this.youtubeApiKey) return this.youtubeApiKey

    const { youtubeApiKey } = (await getDoc())!

    this.setApiKey(youtubeApiKey)

    return youtubeApiKey
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  setApiKey(youtubeApiKey?: string) {
    if (!youtubeApiKey) return

    this.youtubeApiKey = youtubeApiKey
  }

  checkApiKey = (apiKey?: string): Promise<boolean> => {
    if (!apiKey) return Promise.resolve(false)

    return checkApiKeyYoutube(apiKey)
  }

  login(email: string, password: string) {
    return signIn(email, password)
  }

  logout() {
    return signOut()
  }
}

export const authStore = new AuthStore()
