import cs from 'classnames'
import { NavLink } from 'react-router'

import type { SubModel } from '../../sub/sub-model'
import type { LinkLocation } from '../../lib/types'

export const Title = ({ sub, link }: { sub: SubModel; link: LinkLocation }) => (
  <NavLink
    to={link}
    className={({ isActive }) => cs('sub-title', { active: isActive })}
  >
    <h3>{sub.title}</h3>
    <p className="num-videos">
      {sub.videos.size} {sub.videos.size === 1 ? 'video' : 'videos'}
    </p>
  </NavLink>
)
