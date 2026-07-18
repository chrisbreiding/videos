import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { onAuthStateChanged } from '../lib/firebase'
import { appState } from '../app/app-state'
import { authStore } from './auth-store'
import { Icon } from '../lib/util'

export const Login = () => {
  const navigate = useNavigate()
  const [loginFailed, setLoginFailed] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    unsubscribe = onAuthStateChanged((user) => {
      unsubscribe?.()

      if (user) {
        navigate({ pathname: '/' })
      }
    })

    emailRef.current!.focus()
  }, [navigate])

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault()

    const email = emailRef.current!.value
    const password = passwordRef.current!.value

    try {
      await authStore.login(email, password)

      setLoginFailed(false)
      const location = appState.savedLocation || { pathname: '/' }
      navigate(location)
      appState.setSavedLocation()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('error logging in:', (err as Error).message)

      setLoginFailed(true)
    }
  }

  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <h2>Please Log In</h2>
        {loginFailed && <p>Login failed. Try again.</p>}
        <fieldset>
          <label htmlFor="email">Email</label>
          <input ref={emailRef} name="email" />
        </fieldset>
        <fieldset>
          <label htmlFor="password">Password</label>
          <input ref={passwordRef} name="password" type="password" />
        </fieldset>
        <fieldset className="controls">
          <button type="submit">
            <Icon name="sign-in" /> Log In
          </button>
        </fieldset>
      </form>
    </div>
  )
}
