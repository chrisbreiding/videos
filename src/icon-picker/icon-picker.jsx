import _ from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import cs from 'classnames'

import { icon as renderIcon } from '../lib/util'
import { iconsList } from '../lib/icons-list'
import { IconThumb } from '../icon-thumb/icon-thumb'

export const IconPicker = ({ icon, onUpdate }) => {
  const [filter, setFilter] = useState('')

  const { foregroundColor, backgroundColor } = icon

  const updateColorDebounced = useMemo(() => {
    return _.debounce((key, color) => {
      onUpdate(`${key}Color`, color)
    }, 100)
  }, [onUpdate])

  const onColorChange = (key, debounce) => (e) => {
    if (debounce) {
      updateColorDebounced(key, e.target.value)
    } else {
      onUpdate(`${key}Color`, e.target.value)
    }
  }

  const updateIcon = useCallback((iconName) => {
    onUpdate('icon', iconName)
  }, [onUpdate])

  const updateFilter = (e) => {
    setFilter(e.target.value)
  }

  const filteredIcons = useMemo(() => {
    return filter
      ? _.filter(iconsList, (iconName) => iconName.includes(filter))
      : iconsList
  }, [filter])

  const icons = useMemo(() => {
    if (!filteredIcons.length) {
      return (
        <div className='empty-icons'>
          <p>No icons matching filter '{filter}'</p>
        </div>
      )
    }

    return _.map(filteredIcons, (iconName) => (
      <button
        key={iconName}
        onClick={() => updateIcon(iconName)}
        className={cs('picker-icon', {
          chosen: icon.icon === iconName,
        })}
      >
        <IconThumb
          backgroundColor={icon.backgroundColor}
          foregroundColor={icon.foregroundColor}
          icon={iconName}
        />
      </button>
    ))
  }, [filteredIcons, icon, filter, updateIcon])

  return (
    <div className='icon-picker'>
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <label>Foreground Color</label>
          <div className='fields'>
            <input
              type='color'
              value={foregroundColor}
              onChange={onColorChange('foreground', true)}
            />
            <input
              value={foregroundColor}
              onChange={onColorChange('foreground', false)}
            />
          </div>
        </fieldset>
        <fieldset>
          <label>Background Color</label>
          <div className='fields'>
            <input
              type='color'
              value={backgroundColor}
              onChange={onColorChange('background', true)}
            />
            <input
              value={backgroundColor}
              onChange={onColorChange('background', false)}
            />
          </div>
        </fieldset>
        <fieldset>
          <label>Filter</label>
          <div className='fields'>
            {renderIcon('filter')}
            <input
              value={filter}
              onChange={updateFilter}
            />
          </div>
        </fieldset>
      </form>
      <div className='icons'>
        {icons}
      </div>
    </div>
  )
}
