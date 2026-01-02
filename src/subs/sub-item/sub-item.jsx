import { observer } from 'mobx-react'
import React, { useRef, useState } from 'react'
import { SortableHandle } from 'react-sortable-hoc'
import { NavLink } from 'react-router-dom'

import { icon } from '../../lib/util'
import youtube from '../../lib/youtube'

import Title from './title'
import CustomPlaylist from './custom-playlist'

const SortHandle = SortableHandle(({ thumb }) => (
  <span className='sub-item-icon'>
    <img src={thumb} />
  </span>
))

const BookmarkLink = observer(({ link }) => {
  if (!link) return null

  const onClick = (e) => {
    e.stopPropagation()
  }

  return (
    <NavLink onClick={onClick} to={link} className='sub-bookmark'>
      {icon('bookmark')}
    </NavLink>
  )
})

const Channel = observer(({ sub, link, bookmarkLink, onUpdate }) => {
  const inputRef = useRef()
  const [isUpdatingThumb, setIsUpdatingThumb] = useState(false)

  const onChange = () => {
    onUpdate({ title: inputRef.current.value })
  }

  const onThumbClick = async () => {
    if (isUpdatingThumb) return

    setIsUpdatingThumb(true)

    try {
      const getDetails = sub.type === 'channel'
        ? youtube.getChannelDetails(sub.id)
        : youtube.getPlaylistDetails(sub.playlistId)

      const details = await getDetails
      onUpdate({ thumb: details.thumb })
    } catch (err) {
      console.error('Failed to update thumbnail:', err)
    } finally {
      setIsUpdatingThumb(false)
    }
  }

  return (
    <span className={`${sub.type}-sub-item`}>
      <SortHandle thumb={sub.thumb} />
      <button
        className='sub-item-icon editable'
        onClick={onThumbClick}
        disabled={isUpdatingThumb}
      >
        <img src={sub.thumb} />
      </button>
      <Title sub={sub} link={link} />
      <input ref={inputRef} onChange={onChange} value={sub.title || sub.author} />
      <BookmarkLink link={bookmarkLink} />
    </span>
  )
})

const SubItem = observer((props) => {
  function remove () {
    if (confirm(`Remove ${props.sub.title || props.sub.author}?`)) {
      props.onRemove()
    }
  }

  return (
    <li className='sub-item'>
      {props.sub.type === 'custom'
        ? <CustomPlaylist {...props} />
        : <Channel {...props} onUpdate={props.onUpdate} />}
      <button className='remove' onClick={remove}>{icon('minus-circle')}</button>
    </li>
  )
})

export default SubItem
