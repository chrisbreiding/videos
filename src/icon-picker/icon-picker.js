import _ from 'lodash'
import { createFactory, Component, DOM } from 'react'
import cs from 'classnames'
import icons from '../lib/icons-list'
import IconThumbComponent from '../icon-thumb/icon-thumb'

const IconThumb = createFactory(IconThumbComponent)

class IconPicker extends Component {
  render () {
    return DOM.div({ className: 'icon-picker' },
      DOM.form({ onSubmit: (e) => { e.preventDefault() } },
        DOM.fieldset(null,
          DOM.label(null, 'Foreground Color'),
          DOM.input({
            ref: 'foregroundColor',
            value: this.props.icon.get('foregroundColor'),
            onChange: _.partial(this._updateColor, 'foregroundColor'),
          })
        ),
        DOM.fieldset(null,
          DOM.label(null, 'Background Color'),
          DOM.input({
            ref: 'backgroundColor',
            value: this.props.icon.get('backgroundColor'),
            onChange: _.partial(this._updateColor, 'backgroundColor'),
          })
        )
      ),
      DOM.div({ className: 'icons' },
        _.map(icons, (icon) => {
          return DOM.button({
            key: icon,
            onClick: _.partial(this._updateProp, 'icon', icon),
            className: cs('picker-icon', { chosen: this.props.icon.get('icon') === icon }),
          }, IconThumb(_.extend({}, this.props, { icon: this.props.icon.set('icon', icon) })))
        })
      )
    )
  }

  _updateColor (type) {
    this._updateProp(type, this.refs[type].value)
  }

  _updateProp (prop, value) {
    this.props.onUpdate(prop, value)
  }
}

export default IconPicker
