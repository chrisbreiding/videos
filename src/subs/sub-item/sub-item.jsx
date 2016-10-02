import React from 'react'

import { icon } from '../../lib/util'

import Title from './title'
import CustomPlaylist from './custom-playlist'

const Channel = ({ sub }) => (
  <span>
    <Title sub={sub} />
    <img src={sub.get('thumb')} />
  </span>
)

const SubItem  = (props) => {
  function remove () {
    if (confirm(`Remove ${props.sub.get('title') || props.sub.get('author')}?`)) {
      props.onRemove()
    }
  }
  return (
    <li className='sub-item'>
      <button className='remove' onClick={remove}>{icon('minus-circle')}</button>
      {this.props.sub.get('custom') ? <CustomPlaylist {...props} /> : <Channel {...props} /> }
    </li>
  )
}

export default SubItem
