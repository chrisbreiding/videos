import _ from 'lodash';
import { render, createClass, DOM } from 'react';
import cs from 'classnames';
import { icon } from '../lib/util';

export default createClass({
  componentDidMount () {
    const el = this.el = document.createElement('div');
    el.className = cs('modal', this.props.className);
    document.body.appendChild(el);
    this._render();
  },

  componentDidUpdate () {
    this._render();
  },

  componentWillUnmount () {
    this.el.remove();
  },

  _render () {
    const modal = DOM.div({ className: 'modal-box' },
      DOM.button({ className: 'modal-close', onClick: this.props.onClose }, icon('remove')),
      DOM.div({ className: 'modal-content' }, this.props.children)
    );

    render(modal, this.el);
  },

  render () {
    return null;
  }
});