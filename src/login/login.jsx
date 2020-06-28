import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'

import { onAuthStateChanged } from '../lib/firebase'
import appState from '../app/app-state'
import authStore from './auth-store'
import { icon } from '../lib/util'

@inject('router')
@observer
class Login extends Component {
  @observable loginFailed

  componentDidMount () {
    const unsubscribe = onAuthStateChanged((user) => {
      unsubscribe()

      if (user) {
        this.props.router.push({ pathname: '/' })
      }
    })

    this.refs.email.focus()
  }

  render () {
    return (
      <div className='login'>
        <form onSubmit={this._login}>
          <h2>Please Log In</h2>
          {this.loginFailed && <p>Login failed. Try again.</p>}
          <fieldset>
            <label htmlFor="email">Email</label>
            <input ref="email" name="email" />
          </fieldset>
          <fieldset>
            <label htmlFor="password">Password</label>
            <input ref="password" name="password" type='password' />
          </fieldset>
          <fieldset className='controls'>
            <button type="submit">{icon('sign-in')} Log In</button>
          </fieldset>
        </form>
      </div>
    )
  }

  _login = async (e) => {
    e.preventDefault()

    const email = this.refs.email.value
    const password = this.refs.password.value

    try {
      await authStore.login(email, password)

      this._setFailed(false)
      const location = appState.savedLocation || { pathname: '/' }
      this.props.router.push(location)
      appState.setSavedLocation()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('error logging in:', err.message)

      this._setFailed(true)
    }
  }

  @action _setFailed (failed) {
    this.loginFailed = failed
  }
}

export default Login
