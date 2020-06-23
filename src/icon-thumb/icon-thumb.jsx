import React from 'react'
import { icon } from '../lib/util'

const IconThumb = ({ backgroundColor, foregroundColor, icon: thumbIcon }) => (
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

export default IconThumb
