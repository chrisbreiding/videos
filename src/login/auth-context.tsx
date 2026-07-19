import { createContext, ReactNode, useContext, useState } from 'react'

import { getDoc, signIn, signOut } from '../lib/firebase'
import { checkApiKey as checkApiKeyYoutube } from '../lib/youtube'

interface AuthContextValue {
  isAuthenticated: boolean
  setUserId: (userId: string) => void
  setApiKey: (youtubeApiKey: string) => void
  getApiKey: () => Promise<string>
  checkApiKey: (apiKey?: string) => Promise<boolean>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [youtubeApiKey, setApiKey] = useState<string | undefined>(undefined)

  const isAuthenticated = !!userId && !!youtubeApiKey

  const getApiKey = async () => {
    if (youtubeApiKey) return youtubeApiKey

    // App only renders the components that call getApiKey (subs/videos
    // context) once isAuthenticated is true, which requires youtubeApiKey to
    // already be cached (see app.tsx). This fallback can't be reached in the
    // current app, but is kept as a safety net in case that invariant changes.
    /* istanbul ignore next */
    const { youtubeApiKey: fetchedApiKey } = (await getDoc())!
    /* istanbul ignore next */
    setApiKey(fetchedApiKey)
    /* istanbul ignore next */
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
    getApiKey,
    checkApiKey,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)!
