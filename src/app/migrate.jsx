import { inject, observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { getItem } from '../lib/local-data'
import { update } from '../lib/remote-data'
import { icon } from '../lib/util'

const Migrate = inject('router')(observer(({ router }) => {
  useEffect(() => {
    (async () => {
      const subs = getItem('subs')
      const youtubeApiKey = getItem('apiKey')
      const allSubsMarkedVideoId = getItem('allSubsMarkedVideoId')

      await update({ subs, youtubeApiKey, allSubsMarkedVideoId })

      router.push({ pathname: '/' })
    })()
  }, [true])

  return (
    <div className='migrate'>
      <div className='loader'>
        {icon('sign-out')} Migrating data from local storage to firebase...
      </div>
    </div>
  )
}))

export default Migrate
