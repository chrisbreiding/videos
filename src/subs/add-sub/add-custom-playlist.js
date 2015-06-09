import _ from 'lodash';
import Immutable from 'immutable';
import { createFactory, createClass, DOM } from 'react';
import { addCustomPlaylist } from '../subs-actions';
import { icon } from '../../lib/util';
import icons from '../../lib/icons-list';
import IconThumbComponent from '../../icon-thumb/icon-thumb';
import IconPickerComponent from '../../icon-picker/icon-picker';
import ModalComponent from '../../modal/modal';

const IconThumb = createFactory(IconThumbComponent);
const IconPicker = createFactory(IconPickerComponent);
const Modal = createFactory(ModalComponent);

export default createClass({
  getInitialState () {
    return {
      icon: Immutable.Map({
        icon: icons[0],
        foregroundColor: '#FFF',
        backgroundColor: '#333'
      })
    }
  },

  componentDidMount () {
    this.refs.title.getDOMNode().focus();
  },

  render () {
    const iconPicker = this.state.pickingIcon ?
      Modal({
        className: 'icon-picker-modal',
        onClose: _.partial(this._setPickingIcon, false)
      },
        IconPicker(_.extend({
          ref: 'iconPicker',
          onUpdate: this._iconUpdated
        }, this.state.icon.toObject()))
      ) : null;

    return DOM.form({ className: 'add-custom-playlist', onSubmit: (e) => { e.preventDefault() } },
      DOM.fieldset(null,
        DOM.label(null, 'Title'),
        DOM.input({ ref: 'title' })
      ),
      DOM.fieldset(null,
        DOM.label(null, 'Thumbnail'),
        DOM.button({ className: 'submit', onClick: this._add }, icon('plus', 'Add')),
        DOM.button({ className: 'pick-icon', onClick: this._toggleIconPicker },
          IconThumb(this.state.icon.toObject())
        )
      ),
      iconPicker
    );
  },

  _iconUpdated(prop, value) {
    this.setState({ icon: this.state.icon.set(prop, value) });
  },

  _toggleIconPicker (e) {
    this._setPickingIcon(!this.state.pickingIcon);
  },

  _setPickingIcon (pickingIcon) {
    this.setState({ pickingIcon });
  },

  _add () {
    const title = this.refs.title.getDOMNode().value;
    if (!title) return;

    addCustomPlaylist(Immutable.Map({ title: title, icon: this.state.icon }));
    this.props.onAdd();
  }
});
