import _ from 'lodash'
import { observer } from 'mobx-react'
import { useRef, useState, useCallback } from 'react'

import { Title } from './title'
import { IconPicker } from '../../icon-picker/icon-picker'
import { IconThumb } from '../../icon-thumb/icon-thumb'
import { Modal } from '../../modal/modal'
import type { SubModel } from '../../sub/sub-model'
import type { IconConfig, LinkLocation, SubProps } from '../../lib/types'

export const CustomPlaylist = observer(({ sub, link, onUpdate, handleRef }: {
  sub: SubModel
  link: LinkLocation
  onUpdate: (props: Partial<SubProps>) => void
  handleRef: (element: Element | null) => void
}) => {
  const [isPickingIcon, setIsPickingIcon] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const handleChange = useCallback(() => {
    onUpdate({ title: titleRef.current!.value })
  }, [onUpdate])

  const handleIconUpdated = useCallback((updates: Partial<IconConfig>) => {
    onUpdate({ icon: { ...sub.icon, ...updates } as IconConfig })
  }, [onUpdate, sub.icon])

  return (
    <span className='custom-sub-item'>
      <span className='sub-item-icon' ref={handleRef}>
        <IconThumb {...sub.icon!} />
      </span>
      <button className='sub-item-icon editable' onClick={() => setIsPickingIcon(true)} >
        <IconThumb {...sub.icon!} />
      </button>
      <Title sub={sub} link={link} />
      <input ref={titleRef} onChange={handleChange} value={sub.title} />
      {isPickingIcon && (
        <Modal className='icon-picker-modal' onClose={() => setIsPickingIcon(false)}>
          <IconPicker
            onUpdate={handleIconUpdated}
            icon={sub.icon!}
          />
        </Modal>
      )}
    </span>
  )
})
