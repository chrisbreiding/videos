import { useStrict } from 'mobx'
import React from 'react'
import { render } from 'react-dom'
import { HashRouter as Router, Link, Match, Miss } from 'react-router'
import RSVP from 'rsvp'

import App from './app/app'
import Login from './login/login'

useStrict(true)

RSVP.on('error', (e) => {
  /* eslint-disable no-console */
  console.error('Error caught by RSVP:')
  console.error(e.message)
  console.error(e.stack)
  /* eslint-enable no-console */
})

render(
  <Router>
    <div>
      <Match exactly pattern="/" component={App} />
      <Match exactly pattern="/login" component={Login} />
      <Match pattern="/subs" component={App} />
      <Miss
        component={() => (
          <div>
            <p>404 - Not Found</p>
            <p><Link to={{ pathname: '/subs' }}>Subs</Link></p>
          </div>
        )}
      />
    </div>
  </Router>
, document.getElementById('app'))
