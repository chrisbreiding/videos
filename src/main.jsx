import { configure as configureMobx } from 'mobx'
import { Provider } from 'mobx-react'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'
import React from 'react'
import { render } from 'react-dom'
import { Router, Link, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import RSVP from 'rsvp'
import DocumentTitle from 'react-document-title'

// https://github.com/mobxjs/mobx-react-lite/#observer-batching
import 'mobx-react-lite/batchingForReactDom'

import App from './app/app'
import Login from './login/login'

configureMobx({ enforceActions: 'always' })

RSVP.on('error', (e) => {
  /* eslint-disable no-console */
  console.error('Error caught by RSVP:')
  console.error(e.message)
  console.error(e.stack)
  /* eslint-enable no-console */
})

const browserHistory = createBrowserHistory()
const routerStore = new RouterStore()

const history = syncHistoryWithStore(browserHistory, routerStore)

render(
  <Provider router={routerStore}>
    <DocumentTitle title='Videos' />
    <Router history={history}>
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
  </Provider>,
  document.getElementById('app'),
)
