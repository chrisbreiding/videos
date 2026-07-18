import _ from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import cs from 'classnames'

import { Icon } from '../lib/util'
import { IconThumb } from '../icon-thumb/icon-thumb'
import type { IconConfig, IconType } from '../lib/types'
import {
  brandsIconNames,
  type IconName,
  regularIconNames,
  solidIconNames,
} from '../../generated/font-awesome'

interface IconOption {
  name: IconName
  type: IconType
}

const allIcons: IconOption[] = [
  ..._.map(solidIconNames, (name) => ({ name, type: 'solid' as const })),
  ..._.map(regularIconNames, (name) => ({ name, type: 'regular' as const })),
  ..._.map(brandsIconNames, (name) => ({ name, type: 'brands' as const })),
]

interface IconItemProps {
  isChosen: boolean
  icon: IconConfig
  onUpdate: (updates: Partial<IconConfig>) => void
}

const IconItem = ({ isChosen, icon, onUpdate }: IconItemProps) => {
  const update = useCallback(() => {
    onUpdate(icon)
  }, [icon, onUpdate])

  return (
    <button
      key={`${icon.type}-${icon.icon}`}
      onClick={update}
      className={cs('picker-icon', {
        chosen: isChosen,
      })}
    >
      <IconThumb
        backgroundColor={icon.backgroundColor}
        foregroundColor={icon.foregroundColor}
        icon={icon.icon}
        type={icon.type}
      />
    </button>
  )
}

interface IconPickerProps {
  chosenIcon: IconConfig
  onUpdate: (updates: Partial<IconConfig>) => void
}

export const IconPicker = ({ chosenIcon, onUpdate }: IconPickerProps) => {
  const [filter, setFilter] = useState('')

  const { foregroundColor, backgroundColor } = chosenIcon

  const updateColorDebounced = useMemo(() => {
    return _.debounce((key: string, color: string) => {
      onUpdate({ [`${key}Color`]: color })
    }, 100)
  }, [onUpdate])

  const onColorChange =
    (key: string, debounce: boolean) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (debounce) {
          updateColorDebounced(key, e.target.value)
        } else {
          onUpdate({ [`${key}Color`]: e.target.value })
        }
      }

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
        <div className="empty-icons">
          <p>No icons matching filter '{filter}'</p>
        </div>
      )
    }

    return _.map(filteredIcons, ({ name, type }) => (
      <IconItem
        key={`${type}-${name}`}
        icon={{ icon: name, type, foregroundColor, backgroundColor }}
        isChosen={chosenIcon.icon === name && chosenIcon.type === type}
        onUpdate={onUpdate}
      />
    ))
  }, [
    filteredIcons,
    chosenIcon,
    filter,
    onUpdate,
    foregroundColor,
    backgroundColor,
  ])

  return (
    <div className="icon-picker">
      <form onSubmit={(e) => e.preventDefault()}>
        <fieldset>
          <label>Foreground Color</label>
          <div className="fields">
            <input
              type="color"
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
          <div className="fields">
            <input
              type="color"
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
          <div className="fields">
            <Icon name="filter" />
            <input value={filter} onChange={updateFilter} />
          </div>
        </fieldset>
      </form>
      <div className="icons">{icons}</div>
    </div>
  )
}
