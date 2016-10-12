import mobx, { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import _ from 'lodash'
import React, { Component } from 'react'

import { icon } from '../../lib/util'
import icons from '../../lib/icons-list'

import IconThumb from '../../icon-thumb/icon-thumb'
import IconPicker from '../../icon-picker/icon-picker'
import Modal from '../../modal/modal'

@observer
class AddCustomPlaylist extends Component {
  @observable icon = {
    icon: icons[0],
    foregroundColor: '#FFF',
    backgroundColor: '#333',
  }
  @observable isPickingIcon = false

  componentDidMount () {
    this.refs.title.focus()
  }

  render () {
    return (
      <form className='add-custom-playlist' onSubmit={this._add}>
        <fieldset>
          <label>Title</label>
          <input ref='title' />
        </fieldset>
        <fieldset>
          <label>Thumbnail</label>
          <button className='submit'>{icon('plus', 'Add')}</button>
          <button className='pick-icon' onClick={this._toggleIconPicker}>
            <IconThumb {...this.icon} />
          </button>
        </fieldset>
        {this._iconPicker()}
      </form>
    )
  }

  _iconPicker () {
    if (!this.isPickingIcon) return

    return (
      <Modal
        className='icon-picker-modal'
        onClose={_.partial(this._setPickingIcon, false)}
      >
        <IconPicker
          ref='iconPicker'
          onUpdate={this._iconUpdated}
          icon={this.icon}
        />
      </Modal>
    )
  }

  @action _iconUpdated = (key, value) => {
    this.icon[key] = value
  }

  @action _toggleIconPicker = (e) => {
    e.preventDefault()
    this._setPickingIcon(!this.isPickingIcon)
  }

  @action _setPickingIcon = (isPickingIcon) => {
    this.isPickingIcon = isPickingIcon
  }

  _add = (e) => {
    e.preventDefault()

    const title = this.refs.title.value
    if (!title) return

    this.props.onAdd('custom', { title, icon: mobx.toJS(this.icon) })
  }
}

export default AddCustomPlaylist
