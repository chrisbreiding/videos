import _ from 'lodash'
import React from 'react'
import moment from 'moment'
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

export function mapObject (obj, fn) {
  return _.transform(obj, (memo, value, key) => {
    memo[key] = fn(value)
  }, {})
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

export function date (date) {
  const mDate = moment(date)
  return (
    <span>
      <span>{mDate.fromNow()}</span>
      <br />
      <span className='formatted'>
        {mDate.format('MMM D, YYYY h:mma')}
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
