import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { icon } from '../../lib/util'
import { iconsList } from '../../lib/icons-list'
import { subsStore } from '../subs-store'

import { IconThumb } from '../../icon-thumb/icon-thumb'
import { IconPicker } from '../../icon-picker/icon-picker'
import { Modal } from '../../modal/modal'
import type { IconConfig } from '../../lib/types'

export const AddCustomPlaylist = observer(() => {
  const navigate = useNavigate()
  const titleRef = useRef<HTMLInputElement>(null)
  const [iconState, setIconState] = useState<IconConfig>({
    icon: iconsList[0],
    foregroundColor: '#FFFFFF',
    backgroundColor: '#333333',
  })
  const [isPickingIcon, setIsPickingIcon] = useState(false)

  useEffect(() => {
    titleRef.current!.focus()
  }, [])

  const iconUpdated = (key: string, value: string) => {
    setIconState((prev) => ({ ...prev, [key]: value }))
  }

  const toggleIconPicker = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPickingIcon(!isPickingIcon)
  }

  const add = (e: React.FormEvent) => {
    e.preventDefault()

    const title = titleRef.current!.value
    if (!title) return

    const id = subsStore.addCustomPlaylist({ title, icon: toJS(iconState) })
    navigate(`/subs/${id}`)
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
})
