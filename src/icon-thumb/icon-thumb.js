import _ from 'lodash'
import { DOM } from 'react'

const IconThumb = (props) => (
  DOM.span(_.extend({
    className: 'icon-thumb',
    style: {
      backgroundColor: props.icon.get('backgroundColor'),
      color: props.icon.get('foregroundColor'),
    } }, props), DOM.i({ className: `fa fa-${props.icon.get('icon')}` })
  )
)

export default IconThumb
