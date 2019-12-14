import _ from 'lodash'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import cs from 'classnames'
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
                value={backgroundColor}
                onChange={this._updateColor('background')}
              />
            </div>
          </fieldset>
          <fieldset>
            <label>Filter</label>
            <div className='fields'>
              <i className='fa fa-filter' />
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

  _updateColor = (key) => (e) => {
    this.props.onUpdate(`${key}Color`, e.target.value)
  }

  _updateIcon = (icon) => {
    this.props.onUpdate('icon', icon)
  }

  @action _updateFilter = (e) => {
    this.filter = e.target.value
  }
}

export default IconPicker
