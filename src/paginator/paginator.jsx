import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { icon } from '../lib/util'

class Paginator extends Component {
  contextTypes: {
    location: PropTypes.object,
  }

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
        to={this.context.location.pathname}
        query={_.extend({}, this.context.location.query, { pageToken })}
      >
        {children}
      </Link>
    )
  }
}

export default Paginator
