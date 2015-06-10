import _ from 'lodash';
import Immutable from 'immutable';
import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent } from 'react-router';
import { icon } from '../../lib/util';
import IconPickerComponent from '../../icon-picker/icon-picker';
import IconThumbComponent from '../../icon-thumb/icon-thumb';
import ModalComponent from '../../modal/modal';

const IconPicker = createFactory(IconPickerComponent);
const IconThumb = createFactory(IconThumbComponent);
const Link = createFactory(LinkComponent);
const Modal = createFactory(ModalComponent);

export default createClass({
  getInitialState () {
    return {};
  },

  render () {
    const iconPicker = this.state.pickingIcon ?
      Modal({ className: 'icon-picker-modal', onClose: _.partial(this._setPickingIcon, false) },
        IconPicker({
          ref: 'iconPicker',
          onUpdate: this._iconUpdated,
          icon: this.props.sub.get('icon')
        })
      ) : null;

    return DOM.span({ className: 'custom-sub-item' },
      Link({ to: 'sub', params: { id: this.props.sub.get('id') } },
        DOM.h3(null, this.props.sub.get('title'))
      ),
      DOM.input({ ref: 'title', onChange: this._onChange, value: this.props.sub.get('title') }),
      DOM.span({ className: 'sub-item-icon' },
        IconThumb({ icon: this.props.sub.get('icon') })
      ),
      DOM.button({ className: 'sub-item-icon editable', onClick: _.partial(this._setPickingIcon, true) },
        IconThumb({ icon: this.props.sub.get('icon') })
      ),
      iconPicker
    );
  },

  _onChange () {
    this._update({ title: this.refs.title.getDOMNode().value });
  },

  _iconUpdated (key, value) {
    this._update({ icon: this.props.sub.get('icon').set(key, value) });
  },

  _update (props) {
    this.props.onUpdate(this.props.sub.merge(Immutable.Map(props)));
  },

  _setPickingIcon (pickingIcon) {
    this.setState({ pickingIcon });
  }
});
