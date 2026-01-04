import React from 'react'
import { icon } from '../lib/util'

export const IconThumb = ({ backgroundColor, foregroundColor, icon: thumbIcon }) => (
  <span
    className='icon-thumb'
    style={{
      backgroundColor,
      color: foregroundColor,
    }}
  >
    {icon(thumbIcon)}
  </span>
)
