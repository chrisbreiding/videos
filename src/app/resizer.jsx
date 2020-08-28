import { action } from 'mobx'
import React, { Component } from 'react'

class Resizer extends Component {
  static defaultProps = {
    onResizeStart: () => {},
    onResize: () => {},
    onResizeEnd: () => {},
  }

  render () {
    return (
      <div
        className='resizer'
        style={{ top: this.props.height }}
        onMouseDown={this._startResize}
        onTouchStart={this._startResize}
      />
    )
  }

  componentDidMount () {
    this._isDragging = false

    document.addEventListener('mousemove', this._resize)
    document.addEventListener('touchmove', this._resize)
    document.addEventListener('mouseup', this._endResize)
    document.addEventListener('touchend', this._endResize)
  }

  @action _startResize = (e) => {
    e.preventDefault()

    this._isDragging = true
    this.props.onResizeStart()
  }

  @action _resize = (e) => {
    const minHeight = this.props.minHeight
    const maxHeight = this.props.maxHeight

    if (this._isDragging) {
      e.preventDefault()

      let height = e.pageY
      if (height < minHeight) height = minHeight
      if (height > maxHeight) height = maxHeight

      this.props.onResize(height)
    }
  }

  @action _endResize = () => {
    if (this._isDragging) {
      this.props.onResizeEnd()
    }
    this._isDragging = false
  }

  componentWillUnmount () {
    document.removeEventListener('mousemove', this._resize)
    document.removeEventListener('mouseup', this._endResize)
  }
}

export default Resizer
