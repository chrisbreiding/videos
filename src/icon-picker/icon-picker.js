import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import cs from 'classnames';
import { icon } from '../lib/util';
import icons from '../lib/icons-list';
import IconThumbComponent from '../icon-thumb/icon-thumb';

const IconThumb = createFactory(IconThumbComponent);

export default createClass({
  render () {
    return DOM.div({ className: 'icon-picker' },
      DOM.form({ onSubmit: (e) => { e.preventDefault() } },
        DOM.fieldset(null,
          DOM.label(null, 'Foreground Color'),
          DOM.input({
            ref: 'foregroundColor',
            value: this.props.foregroundColor,
            onChange: _.partial(this._updateColor, 'foregroundColor')
          }),
          DOM.figure({ style: { backgroundColor: this.props.foregroundColor } })
        ),
        DOM.fieldset(null,
          DOM.label(null, 'Background Color'),
          DOM.input({
            ref: 'backgroundColor',
            value: this.props.backgroundColor,
            onChange: _.partial(this._updateColor, 'backgroundColor')
          }),
          DOM.figure({ style: { backgroundColor: this.props.backgroundColor } })
        )
      ),
      DOM.div({ className: 'icons' },
        _.map(icons, (icon) => {
          return DOM.button({
            key: icon,
            onClick: _.partial(this._updateProp, 'icon', icon),
            className: cs('picker-icon', { chosen: this.props.icon === icon })
          }, IconThumb(_.extend({}, this.props, { icon: icon })));
        })
      )
    );
  },

  _updateColor (type) {
    this._updateProp(type, this.refs[type].getDOMNode().value);
  },

  _updateProp (prop, value) {
    this.props.onUpdate(prop, value);
  }
});
