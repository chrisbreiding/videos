import { createClass, DOM } from 'react';
import { Navigation } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import LoginStore from './login-store';
import { getApiKey, checkApiKey, updateApiKey } from './login-actions';

export default createClass({
  mixins: [ReactStateMagicMixin, Navigation],

  statics: {
    registerStore: LoginStore
  },

  componentDidMount () {
    getApiKey().then(this._checkApiKey);
    this.refs.apiKey.getDOMNode().focus();
  },

  shouldComponentUpdate (__, nextState) {
    return this.state.apiKey !== nextState.apiKey;
  },

  componentDidUpdate () {
    this.refs.apiKey.getDOMNode().value = this.state.apiKey;
    this._checkApiKey(this.state.apiKey);
  },

  _checkApiKey (apiKey) {
    checkApiKey(apiKey).then((isValid) => {
      if (isValid) this.transitionTo('subs');
    });
  },

  render () {
    return DOM.div({ className: 'login' },
      DOM.form({ onSubmit: this._onFormSubmit },
        DOM.h2(null, 'Please enter your API Key'),
        DOM.input({ ref: 'apiKey', defaulValue: this.state.apiKey })
      )
    );
  },

  _onFormSubmit (e) {
    e.preventDefault();
    updateApiKey(this.refs.apiKey.getDOMNode().value);
  }
});
