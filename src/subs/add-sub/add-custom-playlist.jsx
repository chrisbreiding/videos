import _ from 'lodash'
import Immutable from 'immutable'
import React, { Component } from 'react'
import { addCustomPlaylist } from '../subs-actions'
import { icon } from '../../lib/util'
import icons from '../../lib/icons-list'
import IconThumb from '../../icon-thumb/icon-thumb'
import IconPicker from '../../icon-picker/icon-picker'
import Modal from '../../modal/modal'

class AddCustomPlaylist extends Component {
  constructor (...props) {
    super(...props)

    this.state = {
      icon: Immutable.Map({
        icon: icons[0],
        foregroundColor: '#FFF',
        backgroundColor: '#333',
      }),
    }
  }

  componentDidMount () {
    this.refs.title.focus()
  }

  render () {
    const iconPicker = this.state.pickingIcon ?
      <Modal
        className='icon-picker-modal'
        onClose={_.partial(this._setPickingIcon, false)}
      >
        <IconPicker
          ref='iconPicker'
          onUpdate={this._iconUpdated}
          icon={this.state.icon}
        />
      </Modal> : null

    return (<form className='add-custom-playlist' onSubmit={(e) => { e.preventDefault() }}>
      <fieldset>
        <label>Title</label>
        <input ref='title' />
      </fieldset>
      <fieldset>
        <label>Thumbnail</label>
        <button className='submit' onClick={this._add}>{icon('plus', 'Add')}</button>
        <button className='pick-icon' onClick={this._toggleIconPicker}>
          <IconThumb icon={this.state.icon} />
        </button>
      </fieldset>
      {iconPicker}
    </form>)
  }

  _iconUpdated (prop, value) {
    this.setState({ icon: this.state.icon.set(prop, value) })
  }

  _toggleIconPicker () {
    this._setPickingIcon(!this.state.pickingIcon)
  }

  _setPickingIcon (pickingIcon) {
    this.setState({ pickingIcon })
  }

  _add () {
    const title = this.refs.title.value
    if (!title) return

    addCustomPlaylist(Immutable.Map({ title, icon: this.state.icon }))
    this.props.onAdd()
  }
}

export default AddCustomPlaylist
