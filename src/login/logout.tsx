import { observer } from 'mobx-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { authStore } from './auth-store'
import { Icon } from '../lib/util'

export const Logout = observer(() => {
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      await authStore.logout()
      navigate({ pathname: '/login' })
    })()
  }, [navigate])

  return (
    <div className='logout'>
      <div className='loader'>
        <Icon name='sign-out' /> Logging out...
      </div>
    </div>
  )
})
