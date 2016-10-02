import React, { Component } from 'react'
// import { History } from 'react-router'
// import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin'
import LoginStore from './login-store'
import { getApiKey, checkApiKey, updateApiKey } from './login-actions'

class Login extends Component {
  statics: {
    registerStore: LoginStore,
  }

  componentDidMount () {
    getApiKey().then(this._checkApiKey)
    this.refs.apiKey.focus()
  }

  shouldComponentUpdate (__, nextState) {
    return this.state.apiKey !== nextState.apiKey
  }

  componentDidUpdate () {
    this.refs.apiKey.value = this.state.apiKey
    this._checkApiKey(this.state.apiKey)
  }

  _checkApiKey (apiKey) {
    checkApiKey(apiKey).then((isValid) => {
      if (isValid) this.history.pushState(null, '/subs')
    })
  }

  render () {
    return (
      <div className='login'>
        <form onSubmit={this._onFormSubmit}>
          <h2>Please enter your API Key</h2>
          <input ref='apiKey' defaulValue={this.state.apiKey} />
        </form>
      </div>
    )
  }

  _onFormSubmit (e) {
    e.preventDefault()
    updateApiKey(this.refs.apiKey.value)
  }
}

export default Login
