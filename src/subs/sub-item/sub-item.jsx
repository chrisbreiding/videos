import { observer } from 'mobx-react'
import React from 'react'
import { SortableHandle } from 'react-sortable-hoc'

import { icon } from '../../lib/util'

import Title from './title'
import CustomPlaylist from './custom-playlist'

const SortHandle = SortableHandle(({ thumb }) => (
  <span className='sub-item-icon'>
    <img src={thumb} />
  </span>
))

const Channel = observer(({ sub, link }) => (
  <span>
    <SortHandle thumb={sub.thumb} />
    <Title sub={sub} link={link} />
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
