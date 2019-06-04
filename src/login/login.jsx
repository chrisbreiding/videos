import { action } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'

import authStore from './auth-store'

@observer
class Login extends Component {
  componentWillMount () {
    authStore.getApiKey().then(action('login:set:api:key', (apiKey) => {
      authStore.setApiKey(apiKey)
    }))
  }

  componentDidMount () {
    this.refs.apiKey.focus()
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

  @action _setApiKey = () => {
    authStore.setApiKey(this.refs.apiKey.value)
  }

  _login = (e) => {
    e.preventDefault()

    const apiKey = this.refs.apiKey.value

    authStore.checkApiKey(apiKey).then((isValid) => {
      if (!isValid) return

      action('login:save:api:key', () => {
        authStore.saveApiKey(apiKey).then(() => {
          window.hist.push({ pathname: '/' })
        })
      })()
    })
  }
}

export default Login
