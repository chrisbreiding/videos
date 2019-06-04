import { useStrict } from 'mobx'
import React from 'react'
import { render } from 'react-dom'
import { HashRouter as Router, Link, Route, Switch } from 'react-router-dom'
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
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/login" component={Login} />
      <Route path="/subs" component={App} />
      <Route
        component={() => (
          <div>
            <p>404 - Not Found</p>
            <p><Link to='/subs'>Subs</Link></p>
          </div>
        )}
      />
    </Switch>
  </Router>
, document.getElementById('app'))
