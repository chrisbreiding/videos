import _ from 'lodash'
import Immutable from 'immutable'
import React, { Component } from 'react'
import Title from './title'
import IconPicker from '../../icon-picker/icon-picker'
import IconThumb from '../../icon-thumb/icon-thumb'
import Modal from '../../modal/modal'

class CustomPlaylist extends Component {
  constructor (...props) {
    super(...props)

    this.state = {}
  }

  render () {
    const iconPicker = this.state.pickingIcon ?
      <Modal className='icon-picker-modal' onClose={_.partial(this._setPickingIcon, false)}>
        <IconPicker
          ref='iconPicker'
          onUpdate={this._iconUpdated}
          icon={this.props.sub.get('icon')}
        />
      </Modal> : null

    return (<span className='custom-sub-item'>
      <Title sub={this.props.sub} />
      <input ref='title' onChange={this._onChange} value={this.props.sub.get('title')} />
      <span className='sub-item-icon'>
        <IconThumb icon={this.props.sub.get('icon')} />
      </span>
      <button className='sub-item-icon editable' onClick={_.partial(this._setPickingIcon, true)} >
        <IconThumb icon={this.props.sub.get('icon')} />
      </button>
      {iconPicker}
    </span>)
  }

  _onChange () {
    this._update({ title: this.refs.title.value })
  }

  _iconUpdated (key, value) {
    this._update({ icon: this.props.sub.get('icon').set(key, value) })
  }

  _update (props) {
    this.props.onUpdate(this.props.sub.merge(Immutable.Map(props)))
  }

  _setPickingIcon (pickingIcon) {
    this.setState({ pickingIcon })
  }
}

export default CustomPlaylist
