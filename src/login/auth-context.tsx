import { createContext, ReactNode, useContext, useState } from 'react'

import { getDoc, signIn, signOut } from '../lib/firebase'
import { checkApiKey as checkApiKeyYoutube } from '../lib/youtube'

interface AuthContextValue {
  isAuthenticated: boolean
  setUserId: (userId: string) => void
  setApiKey: (youtubeApiKey: string) => void
  checkApiKey: (apiKey?: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

// subs-store.ts sits outside the React tree, so it can't call
// useAuthContext() to get the api key itself. AuthProvider points this at
// its own getApiKey on mount (it only ever mounts once), so the exported
// getApiKey below reads and caches through the same state that drives
// isAuthenticated.
let getApiKeyImpl: () => Promise<string>

export const getApiKey = (): Promise<string> => getApiKeyImpl()

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [youtubeApiKey, setApiKey] = useState<string | undefined>(undefined)

  const isAuthenticated = !!userId && !!youtubeApiKey

  getApiKeyImpl = async () => {
    if (youtubeApiKey) return youtubeApiKey

    const { youtubeApiKey: fetchedApiKey } = (await getDoc())!

    setApiKey(fetchedApiKey)

    return fetchedApiKey
  }

  const checkApiKey = (apiKey?: string): Promise<boolean> => {
    if (!apiKey) return Promise.resolve(false)

    return checkApiKeyYoutube(apiKey)
  }

  const login = async (email: string, password: string) => {
    await signIn(email, password)
  }

  const logout = async () => {
    await signOut()
  }

  const value: AuthContextValue = {
    isAuthenticated,
    setUserId,
    setApiKey,
    checkApiKey,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)!
