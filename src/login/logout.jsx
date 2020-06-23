import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'

import authStore from './auth-store'
import { icon } from '../lib/util'

const Login = inject('router')(observer(({ router }) => {
  useEffect(() => {
    (async () => {
      await authStore.logout()
      router.push({ pathname: '/login' })
    })()
  }, [true])

  return (
    <div className='logout'>
      <div className='loader'>
        {icon('sign-out')} Logging out...
      </div>
    </div>
  )
}))

export default Login
