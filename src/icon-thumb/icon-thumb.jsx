import _ from 'lodash'
import React from 'react'

const IconThumb = (props) => (
  <span {..._.extend({
    className: 'icon-thumb',
    style: {
      backgroundColor: props.icon.get('backgroundColor'),
      color: props.icon.get('foregroundColor'),
    } }, props)}>
    <i className={`fa fa-${props.icon.get('icon')}`} />
  </span>
)

export default IconThumb
