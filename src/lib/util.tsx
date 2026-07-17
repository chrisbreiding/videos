import { findIconDefinition } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import _ from 'lodash'
import type { ReactNode } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import qs from 'qs'

import type { LinkLocation, LinkUpdates, ParsedQuery } from './types'
import { IconName } from '../../generated/font-awesome'

dayjs.extend(relativeTime)

const re = /^P(?:(\d+(?:[\.,]\d{0,3})?W)|(\d+(?:[\.,]\d{0,3})?Y)?(\d+(?:[\.,]\d{0,3})?M)?(\d+(?:[\.,]\d{0,3})?D)?(?:T(\d+(?:[\.,]\d{0,3})?H)?(\d+(?:[\.,]\d{0,3})?M)?(\d+(?:[\.,]\d{0,3})?S)?)?)$/
const HR = 5
const MIN = 6
const S = 7

function parseIso8601Duration (text: string): string[] {
  const matches = text.match(re)!

  return _.reduce([HR, MIN, S], (memo: string[], index) => {
    if (matches[index]) {
      memo.push(parseInt(matches[index], 10).toString())
    } else if (index === MIN || index === S) {
      memo.push('0')
    }
    return memo
  }, [] as string[])
}

function toTwoDigits (num: string): string {
  return num.length === 2 ? num : `0${num}`
}

export function transformObject<T, R> (obj: Record<string, T>, fn: (value: T) => R): Record<string, R> {
  return _.transform(obj, (memo: Record<string, R>, value, key) => {
    memo[key] = fn(value)
  }, {} as Record<string, R>)
}

export function convertMapToObject<V> (map: Map<string, V>): Record<string, V> {
  const obj: Record<string, V> = {}
  map.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

export function convertMapEntriesToObject<V> (mapEntries: Array<[string, V]>): Record<string, V> {
  const obj: Record<string, V> = {}
  mapEntries.forEach(([key, value]) => {
    obj[key] = value
  })
  return obj
}

// Prefer explicit type for brands and regular. If no prefix is specified,
// prefer solid, then regular, then brands.
function findIcon (name: IconName, type?: 'solid' | 'regular' | 'brands') {
  if (type === 'brands') {
    return findIconDefinition({ prefix: 'fab', iconName: name })
  }

  if (type === 'regular') {
    return findIconDefinition({ prefix: 'far', iconName: name })
  }

  return findIconDefinition({ prefix: 'fas', iconName: name })
    || findIconDefinition({ prefix: 'far', iconName: name })
    || findIconDefinition({ prefix: 'fab', iconName: name })
}

interface IconProps {
  name: IconName
  type?: 'solid' | 'regular' | 'brands'
  spin?: boolean
  rightText?: ReactNode
  leftText?: ReactNode
}

export function Icon ({ name, type, spin, rightText, leftText }: IconProps) {
  return (
    <span className={`icon${rightText || leftText ? ' with-text' : ''}`}>
      {leftText ? <span>{leftText}</span> : null}
      <FontAwesomeIcon icon={findIcon(name, type)} spin={spin} />
      {rightText ? <span>{rightText}</span> : null}
    </span>
  )
}

export function duration (duration?: string): string | undefined {
  if (!duration) return

  const parsed = parseIso8601Duration(duration)
  let parts = _.map(parsed.slice(1), toTwoDigits)
  parts.unshift(parsed[0])
  return parts.join(':')
}

export function durationSeconds (duration?: string): number {
  if (!duration) return 0

  const matches = duration.match(re)
  if (!matches) return 0

  const hours = parseInt(matches[HR], 10) || 0
  const mins = parseInt(matches[MIN], 10) || 0
  const secs = parseInt(matches[S], 10) || 0

  return hours * 3600 + mins * 60 + secs
}

export function date (date: dayjs.ConfigType) {
  const dDate = dayjs(date)
  return (
    <span>
      <span>{dDate.fromNow()}</span>
      <br />
      <span className='formatted'>
        {dDate.format('MMM D, YYYY h:mma')}
      </span>
    </span>
  )
}

export function stringifyQueryString (props: Record<string, unknown>): string {
  return `?${qs.stringify(props)}`
}

export function parseQueryString (queryString?: string): ParsedQuery {
  if (!_.isString(queryString)) return {}

  return qs.parse(queryString.replace(/^\?/, '')) as unknown as ParsedQuery
}

export function updatedLink (location: LinkLocation, updates: LinkUpdates = {}): LinkLocation {
  const pathname = updates.pathname || location.pathname
  let search = location.search

  if (updates.search) {
    const queryObject = parseQueryString(search)
    search = stringifyQueryString(_.extend({}, queryObject, updates.search))
  }

  return { pathname, search }
}
