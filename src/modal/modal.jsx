import React, { Component } from 'react'
import { render } from 'react-dom'
import cs from 'classnames'
import { icon } from '../lib/util'

class Modal extends Component {
  componentDidMount () {
    const el = this.el = document.createElement('div')
    el.className = cs('modal', this.props.className)
    document.body.appendChild(el)
    this._render()
  }

  componentDidUpdate () {
    this._render()
  }

  componentWillUnmount () {
    this.el.remove()
  }

  _render () {
    render(
      <div className='modal-box'>
        <button className='modal-close' onClick={this.props.onClose}>
          {icon('remove')}
        </button>
        <div className='modal-content'>
          {this.props.children}
        </div>
      </div>
    , this.el)
  }

  render () {
    return null
  }
}

export default Modal
