import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import _ from 'lodash'
import React, { useEffect, useRef, useState } from 'react'

import { icon } from '../../lib/util'
import icons from '../../lib/icons-list'
import subsStore from '../subs-store'

import IconThumb from '../../icon-thumb/icon-thumb'
import { IconPicker } from '../../icon-picker/icon-picker'
import Modal from '../../modal/modal'

export const AddCustomPlaylist = inject('router')(observer(({ router }) => {
  const titleRef = useRef()
  const [iconState, setIconState] = useState({
    icon: icons[0],
    foregroundColor: '#FFFFFF',
    backgroundColor: '#333333',
  })
  const [isPickingIcon, setIsPickingIcon] = useState(false)

  useEffect(() => {
    titleRef.current.focus()
  }, [])

  const iconUpdated = (key, value) => {
    setIconState((prev) => ({ ...prev, [key]: value }))
  }

  const toggleIconPicker = (e) => {
    e.preventDefault()
    setIsPickingIcon(!isPickingIcon)
  }

  const add = (e) => {
    e.preventDefault()

    const title = titleRef.current.value
    if (!title) return

    const id = subsStore.addCustomPlaylist({ title, icon: toJS(iconState) })
    router.push(`/subs/${id}`)
  }

  const renderIconPicker = () => {
    if (!isPickingIcon) return null

    return (
      <Modal
        className='icon-picker-modal'
        onClose={_.partial(setIsPickingIcon, false)}
      >
        <IconPicker
          onUpdate={iconUpdated}
          icon={iconState}
        />
      </Modal>
    )
  }

  return (
    <form className='add-sub add-custom-playlist' onSubmit={add}>
      <fieldset>
        <label>Title</label>
        <input ref={titleRef} />
      </fieldset>
      <fieldset>
        <label>Thumbnail</label>
        <button className='pick-icon' onClick={toggleIconPicker}>
          <IconThumb {...iconState} />
        </button>
      </fieldset>
      <fieldset className='controls'>
        <button className='submit'>{icon('plus', 'Add Custom Playlist')}</button>
      </fieldset>
      {renderIconPicker()}
    </form>
  )
}))
