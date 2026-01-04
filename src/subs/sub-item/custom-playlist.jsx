import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { useRef, useState } from 'react'
import { SortableHandle } from 'react-sortable-hoc'

import Title from './title'
import { IconPicker } from '../../icon-picker/icon-picker'
import IconThumb from '../../icon-thumb/icon-thumb'
import { Modal } from '../../modal/modal'

const SortHandle = SortableHandle(({ icon }) => (
  <span className='sub-item-icon'>
    <IconThumb {...icon} />
  </span>
))

export const CustomPlaylist = observer(({ sub, link, onUpdate }) => {
  const [isPickingIcon, setIsPickingIcon] = useState(false)
  const titleRef = useRef()

  const handleChange = () => {
    onUpdate({ title: titleRef.current.value })
  }

  const handleIconUpdated = (key, value) => {
    onUpdate({
      icon: _.extend(sub.icon, { [key]: value }),
    })
  }

  return (
    <span className='custom-sub-item'>
      <SortHandle icon={sub.icon} />
      <button className='sub-item-icon editable' onClick={() => setIsPickingIcon(true)} >
        <IconThumb {...sub.icon} />
      </button>
      <Title sub={sub} link={link} />
      <input ref={titleRef} onChange={handleChange} value={sub.title} />
      {isPickingIcon && (
        <Modal className='icon-picker-modal' onClose={() => setIsPickingIcon(false)}>
          <IconPicker
            onUpdate={handleIconUpdated}
            icon={sub.icon}
          />
        </Modal>
      )}
    </span>
  )
})
