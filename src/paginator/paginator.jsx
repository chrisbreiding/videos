import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import util, { icon } from '../lib/util'

@observer
class Paginator extends Component {
  render () {
    return (
      <div className='paginator'>
        {this._prev()}
        {this.props.children}
        {this._next()}
      </div>
    )
  }

  _prev () {
    const prev = this.props.prevPageToken
    if (!prev) return <span />

    return this._linkTo(prev ? '' : 'disabled', prev, icon('angle-left', 'Newer'))
  }

  _next () {
    const next = this.props.nextPageToken
    if (!next) return <span />

    return this._linkTo(next ? '' : 'disabled', next, icon('angle-right', null, 'Older'))
  }

  _linkTo (className, pageToken, children) {
    return (
      <Link
        className={`paginator-button ${className}`}
        to={{
          pathname: this.props.location.pathname,
          search: util.stringifyQueryString(_.extend({}, this._getQuery(), { pageToken })),
        }}
      >
        {children}
      </Link>
    )
  }

  _getQuery () {
    return util.parseQueryString(this.props.location.search)
  }
}

export default Paginator
