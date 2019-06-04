import { observer } from 'mobx-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const Title = observer(({ sub, link }) => (
  <NavLink to={link} className='sub-title' activeClassName='active'>
    <h3>{sub.title || sub.author}</h3>
    <p className='num-videos'>
      {sub.videos.size} {sub.videos.size === 1 ? 'video' : 'videos'}
    </p>
  </NavLink>
))

export default Title
