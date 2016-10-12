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
              value={this.props.icon.foregroundColor}
              onChange={this._updateForegroundColor}
            />
          </fieldset>
          <fieldset>
            <label>Background Color</label>
            <input
              ref='backgroundColor'
              value={this.props.icon.backgroundColor}
              onChange={this._updateBackgroundColor}
            />
          </fieldset>
        </form>
        <div className='icons'>
          {_.map(icons, (icon) => (
            <button
              key={icon}
              onClick={_.partial(this._updateIcon, icon)}
              className={cs('picker-icon', { chosen: this.props.icon.icon === icon })}
            >
              <IconThumb
                backgroundColor={this.props.icon.backgroundColor}
                foregroundColor={this.props.icon.foregroundColor}
                icon={icon}
              />
            </button>
          ))}
        </div>
      </div>
    )
  }

  _updateBackgroundColor = () => {
    this._update('backgroundColor', this.refs.backgroundColor.value)
  }

  _updateForegroundColor = () => {
    this._update('foregroundColor', this.refs.foregroundColor.value)
  }

  _updateIcon = (icon) => {
    this._update('icon', icon)
  }

  _update (key, value) {
    this.props.onUpdate(key, value)
  }
}

export default IconPicker
