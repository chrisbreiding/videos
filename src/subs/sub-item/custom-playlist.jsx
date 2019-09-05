import _ from 'lodash'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { SortableHandle } from 'react-sortable-hoc'

import Title from './title'
import IconPicker from '../../icon-picker/icon-picker'
import IconThumb from '../../icon-thumb/icon-thumb'
import Modal from '../../modal/modal'

const SortHandle = SortableHandle(({ icon }) => (
  <span className='sub-item-icon'>
    <IconThumb {...icon} />
  </span>
))

@observer
class CustomPlaylist extends Component {
  @observable isPickingIcon = false

  render () {
    return (
      <span className='custom-sub-item'>
        <SortHandle icon={this.props.sub.icon} />
        <button className='sub-item-icon editable' onClick={_.partial(this._setPickingIcon, true)} >
          <IconThumb {...this.props.sub.icon} />
        </button>
        <Title sub={this.props.sub} link={this.props.link} />
        <input ref='title' onChange={this._onChange} value={this.props.sub.title} />
        {this._iconPicker()}
      </span>
    )
  }

  _iconPicker () {
    if (!this.isPickingIcon) return null

    return (
      <Modal className='icon-picker-modal' onClose={_.partial(this._setPickingIcon, false)}>
        <IconPicker
          ref='iconPicker'
          onUpdate={this._iconUpdated}
          icon={this.props.sub.icon}
        />
      </Modal>
    )
  }

  _onChange = () => {
    this._update({ title: this.refs.title.value })
  }

  @action _iconUpdated = (key, value) => {
    this._update({
      icon: _.extend(this.props.sub.icon, { [key]: value }),
    })
  }

  _update (props) {
    this.props.onUpdate(props)
  }

  @action _setPickingIcon = (isPickingIcon) => {
    this.isPickingIcon = isPickingIcon
  }
}

export default CustomPlaylist
