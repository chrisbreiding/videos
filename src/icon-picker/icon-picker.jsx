import _ from 'lodash'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import cs from 'classnames'

import { icon } from '../lib/util'
import icons from '../lib/icons-list'
import IconThumb from '../icon-thumb/icon-thumb'

@observer
class IconPicker extends Component {
  @observable filter = ''

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
                onChange={this._onColorChange('foreground', true)}
              />
              <input
                ref='foregroundColor'
                value={foregroundColor}
                onChange={this._onColorChange('foreground', false)}
              />
            </div>
          </fieldset>
          <fieldset>
            <label>Background Color</label>
            <div className='fields'>
              <input
                type='color'
                value={backgroundColor}
                onChange={this._onColorChange('background', true)}
              />
              <input
                value={backgroundColor}
                onChange={this._onColorChange('background', false)}
              />
            </div>
          </fieldset>
          <fieldset>
            <label>Filter</label>
            <div className='fields'>
              {icon('filter')}
              <input
                value={this.filter}
                onChange={this._updateFilter}
              />
            </div>
          </fieldset>
        </form>
        <div className='icons'>
          {this._icons()}
        </div>
      </div>
    )
  }

  _icons () {
    const filteredIcons = this.filter ?
      _.filter(icons, (icon) => icon.includes(this.filter)) :
      icons

    if (!filteredIcons.length) {
      return (
        <div className='empty-icons'>
          <p>No icons matching filter '{this.filter}'</p>
        </div>
      )
    }

    return _.map(filteredIcons, (icon) => (
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
    ))
  }

  _onColorChange = (key, debounce) => (e) => {
    if (debounce) {
      this._updateColorDebounced(key, e.target.value)
    } else {
      this._updateColor(key, e.target.value)
    }
  }

  _updateColor = (key, color) => {
    this.props.onUpdate(`${key}Color`, color)
  }

  _updateColorDebounced = _.debounce((key, color) => {
    this._updateColor(key, color)
  }, 100)

  _updateIcon = (icon) => {
    this.props.onUpdate('icon', icon)
  }

  @action _updateFilter = (e) => {
    this.filter = e.target.value
  }
}

export default IconPicker
