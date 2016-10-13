import { observer } from 'mobx-react'
import React from 'react'
import { Link } from 'react-router'

const Title = observer(({ sub, link }) => (
  <Link to={link} className='sub-title' activeClassName='active'>
    <h3>{sub.title || sub.author}</h3>
    <p className='num-videos'>
      {sub.videos.size} {sub.videos.size === 1 ? 'video' : 'videos'}
    </p>
  </Link>
))

export default Title
