import _ from 'lodash';
import { createClass, DOM } from 'react';

export default createClass({
  render () {
    return DOM.span(_.extend({
      className: 'icon-thumb',
      style: {
        backgroundColor: this.props.backgroundColor,
        color: this.props.foregroundColor
      }}, this.props), DOM.i({ className: `fa fa-${this.props.icon}` })
    );
  }
})
