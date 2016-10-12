import { action } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'

import authStore from './auth-store'
import propTypes from '../lib/prop-types'

@observer
class Login extends Component {
  static contextTypes = {
    router: propTypes.router,
  }

  componentWillMount () {
    authStore.getApiKey()
    .then(action('login:got:api:key', (apiKey) => {
      authStore.setApiKey(apiKey)
    }))
  }

  componentDidMount () {
    this.refs.apiKey.focus()
  }

  _checkApiKey = () => {
    authStore.checkApiKey().then((isValid) => {
      if (isValid) {
        this.context.router.transitionTo({ pathname: '/' })
      }
    })
  }

  render () {
    return (
      <div className='login'>
        <form onSubmit={this._login}>
          <h2>Please enter your API Key</h2>
          <input ref='apiKey' value={authStore.apiKey} onChange={this._setApiKey} />
        </form>
      </div>
    )
  }

  _setApiKey = () => {
    authStore.setApiKey(this.refs.apiKey.value)
  }

  @action _login = (e) => {
    e.preventDefault()
    this._checkApiKey()
  }
}

export default Login
