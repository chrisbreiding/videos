import _ from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import cs from 'classnames'

import { Icon } from '../lib/util'
import { IconThumb } from '../icon-thumb/icon-thumb'
import type { IconConfig, IconType } from '../lib/types'
import { brandsIconNames, type IconName, regularIconNames, solidIconNames } from '../../generated/font-awesome'

interface IconPickerProps {
  icon: IconConfig
  onUpdate: (updates: Partial<IconConfig>) => void
}

interface PickableIcon {
  name: IconName
  type: IconType
}

const allIcons: PickableIcon[] = [
  ..._.map(solidIconNames, (name) => ({ name, type: 'solid' as const })),
  ..._.map(regularIconNames, (name) => ({ name, type: 'regular' as const })),
  ..._.map(brandsIconNames, (name) => ({ name, type: 'brands' as const })),
]

export const IconPicker = ({ icon, onUpdate }: IconPickerProps) => {
  const [filter, setFilter] = useState('')

  const { foregroundColor, backgroundColor } = icon

  const updateColorDebounced = useMemo(() => {
    return _.debounce((key: string, color: string) => {
      onUpdate({ [`${key}Color`]: color })
    }, 100)
  }, [onUpdate])

  const onColorChange = (key: string, debounce: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (debounce) {
      updateColorDebounced(key, e.target.value)
    } else {
      onUpdate({ [`${key}Color`]: e.target.value })
    }
  }

  const updateIcon = useCallback((iconName: IconName, iconType: IconType) => {
    onUpdate({ icon: iconName, type: iconType })
  }, [onUpdate])

  const updateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value)
  }

  const filteredIcons = useMemo(() => {
    return filter
      ? _.filter(allIcons, ({ name }) => name.includes(filter))
      : allIcons
  }, [filter])

  const icons = useMemo(() => {
    if (!filteredIcons.length) {
      return (
        <div className='empty-icons'>
          <p>No icons matching filter '{filter}'</p>
        </div>
      )
    }

    return _.map(filteredIcons, ({ name, type }) => (
      <button
        key={`${type}-${name}`}
        onClick={() => updateIcon(name, type)}
        className={cs('picker-icon', {
          chosen: icon.icon === name && icon.type === type,
        })}
      >
        <IconThumb
          backgroundColor={icon.backgroundColor}
          foregroundColor={icon.foregroundColor}
          icon={name}
          type={type}
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
            <Icon name='filter' />
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
