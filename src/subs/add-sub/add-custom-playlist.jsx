import { action, observable, toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import _ from 'lodash'
import React, { Component } from 'react'

import { icon } from '../../lib/util'
import icons from '../../lib/icons-list'
import subsStore from '../subs-store'

import IconThumb from '../../icon-thumb/icon-thumb'
import IconPicker from '../../icon-picker/icon-picker'
import Modal from '../../modal/modal'

@inject('router')
@observer
class AddCustomPlaylist extends Component {
  @observable icon = {
    icon: icons[0],
    foregroundColor: '#FFFFFF',
    backgroundColor: '#333333',
  }
  @observable isPickingIcon = false

  componentDidMount () {
    this.refs.title.focus()
  }

  render () {
    return (
      <form className='add-sub add-custom-playlist' onSubmit={this._add}>
        <fieldset>
          <label>Title</label>
          <input ref='title' />
        </fieldset>
        <fieldset>
          <label>Thumbnail</label>
          <button className='pick-icon' onClick={this._toggleIconPicker}>
            <IconThumb {...this.icon} />
          </button>
        </fieldset>
        <fieldset className='controls'>
          <button className='submit'>{icon('plus', 'Add Custom Playlist')}</button>
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

    const id = subsStore.addCustomPlaylist({ title, icon: toJS(this.icon) })
    this.props.router.push(`/subs/${id}`)
  }
}

export default AddCustomPlaylist
