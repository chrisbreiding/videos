import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { icon } from '../lib/util'

@observer
class Paginator extends Component {
  render () {
    return (
      <div className='paginator'>
        {this._linkTo(this.props.prevLink, 'left', 'Newer')}
        {this.props.children}
        {this._linkTo(this.props.nextLink, 'right', null, 'Older')}
      </div>
    )
  }

  _linkTo (link, direction, leftText, rightText) {
    if (!link) return <span />

    return (
      <Link className={'paginator-button'} to={link}>
        {icon(`angle-${direction}`, leftText, rightText)}
      </Link>
    )
  }
}

export default Paginator
