import { observer } from 'mobx-react'
import React from 'react'
import { SortableHandle } from 'react-sortable-hoc'
import { NavLink } from 'react-router-dom'

import { icon } from '../../lib/util'

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

const Channel = observer(({ sub, link, bookmarkLink }) => (
  <span>
    <SortHandle thumb={sub.thumb} />
    <Title sub={sub} link={link} />
    <BookmarkLink link={bookmarkLink} />
  </span>
))

const SubItem = observer((props) => {
  function remove () {
    if (confirm(`Remove ${props.sub.title || props.sub.author}?`)) {
      props.onRemove()
    }
  }

  return (
    <li className='sub-item'>
      {props.sub.isCustom ? <CustomPlaylist {...props} /> : <Channel {...props} /> }
      <button className='remove' onClick={remove}>{icon('minus-circle')}</button>
    </li>
  )
})

export default SubItem
