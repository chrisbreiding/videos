import React from 'react'

const IconThumb = ({ backgroundColor, foregroundColor, icon }) => (
  <span
    className='icon-thumb'
    style={{
      backgroundColor,
      color: foregroundColor,
    }}
  >
    <i className={`fa fa-${icon}`} />
  </span>
)

export default IconThumb
