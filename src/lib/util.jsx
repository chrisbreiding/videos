import _ from 'lodash'
import React from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)
import qs from 'qs'

const re = /^P(?:(\d+(?:[\.,]\d{0,3})?W)|(\d+(?:[\.,]\d{0,3})?Y)?(\d+(?:[\.,]\d{0,3})?M)?(\d+(?:[\.,]\d{0,3})?D)?(?:T(\d+(?:[\.,]\d{0,3})?H)?(\d+(?:[\.,]\d{0,3})?M)?(\d+(?:[\.,]\d{0,3})?S)?)?)$/
const HR = 5
const MIN = 6
const S = 7

function parseIso8601Duration (text) {
  const matches = text.match(re)
  return _.reduce([HR, MIN, S], (memo, index) => {
    if (matches[index]) {
      memo.push(parseInt(matches[index], 10).toString())
    } else if (index === MIN || index === S) {
      memo.push('0')
    }
    return memo
  }, [])
}

function toTwoDigits (num) {
  return num.length === 2 ? num : `0${num}`
}

export function transformObject (obj, fn) {
  return _.transform(obj, (memo, value, key) => {
    memo[key] = fn(value)
  }, {})
}

export function convertMapToObject (map) {
  const obj = {}
  map.forEach((value, key) => {
    obj[key] = value
  })
  return obj
}

export function convertMapEntriesToObject (mapEntries) {
  const obj = {}
  mapEntries.forEach(([key, value]) => {
    obj[key] = value
  })
  return obj
}

export function icon (iconName, rightText, leftText) {
  return (
    <span className={`icon${rightText || leftText ? ' with-text' : ''}`}>
      {leftText ? leftText : null}
      <i className={`fa fa-${iconName}`} />
      {rightText ? rightText : null}
    </span>
  )
}

export function duration (duration) {
  if (!duration) return

  const parsed = parseIso8601Duration(duration)
  let parts = _.map(parsed.slice(1), toTwoDigits)
  parts.unshift(parsed[0])
  return parts.join(':')
}

export function durationSeconds (duration) {
  if (!duration) return 0

  const matches = duration.match(re)
  if (!matches) return 0

  const hours = parseInt(matches[HR], 10) || 0
  const mins = parseInt(matches[MIN], 10) || 0
  const secs = parseInt(matches[S], 10) || 0

  return hours * 3600 + mins * 60 + secs
}

export function date (date) {
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

export function stringifyQueryString (props) {
  return `?${qs.stringify(props)}`
}

export function parseQueryString (queryString) {
  if (!_.isString(queryString)) return {}

  return qs.parse(queryString.replace(/^\?/, ''))
}

export function updatedLink (location, updates = {}) {
  const pathname = updates.pathname || location.pathname
  let search = location.search

  if (updates.search) {
    const queryObject = parseQueryString(search)
    search = stringifyQueryString(_.extend({}, queryObject, updates.search))
  }

  return { pathname, search }
}
