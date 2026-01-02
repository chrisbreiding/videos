import { observer } from 'mobx-react'
import React, { useEffect } from 'react'

import { fetch, update } from '../lib/remote-data'
import { icon } from '../lib/util'

const Migrate = observer(({ onComplete }) => {
  useEffect(() => {
    (async () => {
      const data = await fetch()
      const subs = data.subs || {}

      const updatedSubs = Object.fromEntries(
        Object.entries(subs).map(([id, sub]) => {
          const type = sub.isCustom || id.startsWith('custom-') ? 'custom' : 'channel'
          delete sub.isCustom

          return [id, { ...sub, type }]
        }),
      )

      await update({ subs: updatedSubs })

      onComplete()
    })()
  }, [true])

  return (
    <div className='migrate'>
      <div className='loader'>
        {icon('refresh')} Migrating sub types...
      </div>
    </div>
  )
})

export default Migrate
