import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Icon } from '../../lib/util'
import { subsStore } from '../subs-store'

import { IconThumb } from '../../icon-thumb/icon-thumb'
import { IconPicker } from '../../icon-picker/icon-picker'
import { Modal } from '../../modal/modal'
import type { IconConfig } from '../../lib/types'
import { solidIconNames } from '../../../generated/font-awesome'

export const AddCustomPlaylist = observer(() => {
  const navigate = useNavigate()
  const titleRef = useRef<HTMLInputElement>(null)
  const [iconState, setIconState] = useState<IconConfig>({
    icon: solidIconNames[0],
    type: 'solid',
    foregroundColor: '#FFFFFF',
    backgroundColor: '#333333',
  })
  const [isPickingIcon, setIsPickingIcon] = useState(false)

  useEffect(() => {
    titleRef.current!.focus()
  }, [])

  const iconUpdated = useCallback(
    (updates: Partial<IconConfig>) => {
      setIconState((prev) => ({ ...prev, ...updates }))
    },
    [setIconState],
  )

  const toggleIconPicker = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsPickingIcon(!isPickingIcon)
    },
    [setIsPickingIcon, isPickingIcon],
  )

  const add = (e: React.SubmitEvent) => {
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
        className="icon-picker-modal"
        onClose={_.partial(setIsPickingIcon, false)}
      >
        <IconPicker onUpdate={iconUpdated} chosenIcon={iconState} />
      </Modal>
    )
  }

  return (
    <form className="add-sub add-custom-playlist" onSubmit={add}>
      <fieldset>
        <label>Title</label>
        <input ref={titleRef} />
      </fieldset>
      <fieldset>
        <label>Thumbnail</label>
        <button className="pick-icon" onClick={toggleIconPicker}>
          <IconThumb {...iconState} />
        </button>
      </fieldset>
      <fieldset className="controls">
        <button className="submit">
          <Icon name="plus" /> Add Custom Playlist
        </button>
      </fieldset>
      {renderIconPicker()}
    </form>
  )
})
