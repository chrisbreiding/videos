import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import cs from 'classnames'
import icons from '../lib/icons-list'
import IconThumb from '../icon-thumb/icon-thumb'

@observer
class IconPicker extends Component {
  render () {
    const { foregroundColor, backgroundColor } = this.props.icon

    return (
      <div className='icon-picker'>
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <label>Foreground Color</label>
            <div className='fields'>
              <input
                type='color'
                value={foregroundColor}
                onChange={this._updateColor('foreground')}
              />
              <input
                ref='foregroundColor'
                value={foregroundColor}
                onChange={this._updateColor('foreground')}
              />
            </div>
          </fieldset>
          <fieldset>
            <label>Background Color</label>
            <div className='fields'>
              <input
                type='color'
                value={backgroundColor}
                onChange={this._updateColor('background')}
              />
              <input
                ref='backgroundColor'
                value={backgroundColor}
                onChange={this._updateColor('background')}
              />
            </div>
          </fieldset>
        </form>
        <div className='icons'>
          {_.map(icons, (icon) => (
            <button
              key={icon}
              onClick={_.partial(this._updateIcon, icon)}
              className={cs('picker-icon', {
                chosen: this.props.icon.icon === icon,
              })}
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

  _updateColor = (key) => (e) => {
    this.props.onUpdate(`${key}Color`, e.target.value)
  }

  _updateIcon = (icon) => {
    this._update('icon', icon)
  }
}

export default IconPicker
