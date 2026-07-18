import { useState, useCallback } from 'react'

import { Title } from './title'
import { SubTitleInput } from './sub-title-input'
import { IconPicker } from '../../icon-picker/icon-picker'
import { IconThumb } from '../../icon-thumb/icon-thumb'
import { Modal } from '../../modal/modal'
import type { SubModel } from '../../sub/sub-model'
import type { IconConfig, LinkLocation, SubProps } from '../../lib/types'

export const CustomPlaylist = ({
  sub,
  link,
  onUpdate,
  handleRef,
}: {
  sub: SubModel
  link: LinkLocation
  onUpdate: (props: Partial<SubProps>) => void
  handleRef: (element: Element | null) => void
}) => {
  const [isPickingIcon, setIsPickingIcon] = useState(false)

  const onTitleUpdate = useCallback(
    (title: string) => {
      onUpdate({ title })
    },
    [onUpdate],
  )

  const handleIconUpdated = useCallback(
    (updates: Partial<IconConfig>) => {
      onUpdate({ icon: { ...sub.icon, ...updates } as IconConfig })
    },
    [onUpdate, sub.icon],
  )

  return (
    <span className="custom-sub-item">
      <span className="sub-item-icon" ref={handleRef}>
        <IconThumb {...sub.icon!} />
      </span>
      <button
        className="sub-item-icon editable"
        onClick={() => setIsPickingIcon(true)}
      >
        <IconThumb {...sub.icon!} />
      </button>
      <Title sub={sub} link={link} />
      <SubTitleInput value={sub.title} onUpdate={onTitleUpdate} />
      {isPickingIcon && (
        <Modal
          className="icon-picker-modal"
          onClose={() => setIsPickingIcon(false)}
        >
          <IconPicker onUpdate={handleIconUpdated} chosenIcon={sub.icon!} />
        </Modal>
      )}
    </span>
  )
}
