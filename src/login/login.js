import { createClass, DOM } from 'react';
import { Navigation } from 'react-router'
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import LoginStore from './login-store';
import { updateApiKey } from './login-actions'

export default createClass({
  mixins: [ReactStateMagicMixin, Navigation],

  statics: {
    registerStore: LoginStore
  },

  componentDidMount () {
    this.refs.apiKey.getDOMNode().focus();
  },

  componentDidUpdate () {
    if (this.state.isApiKeyValid) {
      this.transitionTo('default');
    }
  },

  render () {
    return DOM.div({ className: 'login' },
      DOM.form({ onSubmit: this._onFormSubmit },
        DOM.h2(null, 'Please enter your API Key'),
        DOM.input({ ref: 'apiKey', initialValue: this.state.apiKey })
      )
    );
  },

  _onFormSubmit (e) {
    e.preventDefault();
    updateApiKey(this.refs.apiKey.getDOMNode().value);
  }
});
