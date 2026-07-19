import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { useAuthContext } from './auth-context'
import { Icon } from '../lib/util'

export const Logout = () => {
  const navigate = useNavigate()
  const { logout } = useAuthContext()

  useEffect(() => {
    const doLogout = async () => {
      await logout()
      navigate({ pathname: '/login' })
    }

    doLogout()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  return (
    <div className="logout">
      <div className="loader">
        <Icon name="sign-out" /> Logging out...
      </div>
    </div>
  )
}
