import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { authStore } from './auth-store'
import { Icon } from '../lib/util'

export const Logout = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const logout = async () => {
      await authStore.logout()
      navigate({ pathname: '/login' })
    }

    logout()
  }, [navigate])

  return (
    <div className="logout">
      <div className="loader">
        <Icon name="sign-out" /> Logging out...
      </div>
    </div>
  )
}
