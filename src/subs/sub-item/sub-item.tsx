import { observer } from 'mobx-react'
import { useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/react/sortable'
import { NavLink } from 'react-router'

import { Icon } from '../../lib/util'
import { getChannelDetails, getPlaylistDetails } from '../../lib/youtube'

import { Title } from './title'
import { CustomPlaylist } from './custom-playlist'
import type { SubModel } from '../../sub/sub-model'
import type { LinkLocation, SubProps } from '../../lib/types'

type HandleRef = (element: Element | null) => void

type BookmarkLinkTo = LinkLocation | string | null

interface SubItemProps {
  sub: SubModel
  index: number
  link: LinkLocation
  bookmarkLink?: BookmarkLinkTo
  onUpdate: (props: Partial<SubProps>) => void
  onRemove: () => void
}

const BookmarkLink = observer(({ link }: { link?: BookmarkLinkTo }) => {
  if (!link) return null

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <NavLink onClick={onClick} to={link} className='sub-bookmark'>
      <Icon name='bookmark' />
    </NavLink>
  )
})

const Channel = observer(({ sub, link, bookmarkLink, onUpdate, handleRef }: {
  sub: SubModel
  link: LinkLocation
  bookmarkLink?: BookmarkLinkTo
  onUpdate: (props: Partial<SubProps>) => void
  handleRef: HandleRef
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUpdatingThumb, setIsUpdatingThumb] = useState(false)

  const onChange = () => {
    onUpdate({ title: inputRef.current!.value })
  }

  const onThumbClick = async () => {
    if (isUpdatingThumb) return

    setIsUpdatingThumb(true)

    try {
      const getDetails = sub.type === 'channel'
        ? getChannelDetails(sub.id)
        : getPlaylistDetails(sub.playlistId!)

      const details = await getDetails
      onUpdate({ thumb: details.thumb })
    } catch (err) {
      console.error('Failed to update thumbnail:', err) // eslint-disable-line no-console
    } finally {
      setIsUpdatingThumb(false)
    }
  }

  return (
    <span className={`${sub.type}-sub-item`}>
      <span className='sub-item-icon' ref={handleRef}>
        <img src={sub.thumb} />
      </span>
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

export const SubItem = observer((props: SubItemProps) => {
  const { ref, handleRef } = useSortable({
    id: props.sub.id,
    index: props.index,
  })

  function remove () {
    if (confirm(`Remove ${props.sub.title || props.sub.author}?`)) {
      props.onRemove()
    }
  }

  return (
    <li className='sub-item' ref={ref}>
      {props.sub.type === 'custom'
        ? <CustomPlaylist {...props} handleRef={handleRef} />
        : <Channel {...props} onUpdate={props.onUpdate} handleRef={handleRef} />}
      <button className='remove' onClick={remove}>
        <Icon name='minus-circle' />
      </button>
    </li>
  )
})
