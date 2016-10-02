import _ from 'lodash'
import { DOM } from 'react'
import moment from 'moment'

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

class Util {
  icon (iconName, rightText, leftText) {
    return DOM.span({ className: `icon${rightText || leftText ? ' with-text' : ''}` },
      leftText ? leftText : null,
      DOM.i({ className: `fa fa-${iconName}` }),
      rightText ? rightText : null
    )
  }

  duration (duration) {
    const parsed = parseIso8601Duration(duration)
    let parts = _.map(parsed.slice(1), toTwoDigits)
    parts.unshift(parsed[0])
    return parts.join(':')
  }

  date (date) {
    const mDate = moment(date)
    return DOM.span(null,
      DOM.span(null, mDate.fromNow()),
      DOM.br(),
      DOM.span({ className: 'formatted' }, mDate.format('MMM D, YYYY h:mma'))
    )
  }
}

export default new Util()
