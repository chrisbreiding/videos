import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'

import authStore from './auth-store'
import { icon } from '../lib/util'

@inject('router')
@observer
class Login extends Component {
  componentDidMount () {
    this.refs.email.focus()
  }

  render () {
    return (
      <div className='login'>
        <form onSubmit={this._login}>
          <h2>Please Log In</h2>
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

      // TODO: store previous route and return to it
      this.props.router.push({ pathname: '/' })
    } catch (err) {
      // TODO: display error message

      // eslint-disable-next-line no-console
      console.log('error logging in:', err.message)
    }
  }
}

export default Login
