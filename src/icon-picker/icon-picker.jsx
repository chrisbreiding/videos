import _ from 'lodash'
import React, { Component } from 'react'
import cs from 'classnames'
import icons from '../lib/icons-list'
import IconThumb from '../icon-thumb/icon-thumb'

class IconPicker extends Component {
  render () {
    return (
      <div className='icon-picker'>
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <label>Foreground Color</label>
            <input
              ref='foregroundColor'
              value={this.props.icon.get('foregroundColor')}
              onChange={_.partial(this._updateColor, 'foregroundColor')}
            />
          </fieldset>
          <fieldset>
            <label>Background Color</label>
            <input
              ref='backgroundColor'
              value={this.props.icon.get('backgroundColor')}
              onChange={_.partial(this._updateColor, 'backgroundColor')}
            />
          </fieldset>
        </form>
        <div className='icons'>
          {_.map(icons, (icon) => (
            <button
              key={icon}
              onClick={_.partial(this._updateProp, 'icon', icon)}
              className={cs('picker-icon', { chosen: this.props.icon.get('icon') === icon })}
            >
              <IconThumb {..._.extend({}, this.props, { icon: this.props.icon.set('icon', icon) })} />
            </button>
          ))}
        </div>
      </div>
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
