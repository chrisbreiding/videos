import { configure as configureMobx } from 'mobx'
import { Provider } from 'mobx-react'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'
import React from 'react'
import { render } from 'react-dom'
import { Router, Link, Route, Switch } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import DocumentTitle from 'react-document-title'

// https://github.com/mobxjs/mobx-react-lite/#observer-batching
import 'mobx-react-lite/batchingForReactDom'

import App from './app/app'
import Login from './login/login'
import Logout from './login/logout'

// TODO: need to figure out why mobx thinks it's in production mode
// when developing. it makes errors from this impossible to debug
// configureMobx({ enforceActions: 'always' })

const browserHistory = createBrowserHistory()
const routerStore = new RouterStore()

const history = syncHistoryWithStore(browserHistory, routerStore)

document.addEventListener('touchstart', () => {
  document.body.className = 'has-touch'
})

render(
  <Provider router={routerStore}>
    <DocumentTitle title='Videos' />
    <Router history={history}>
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/migrate" component={App} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/logout" component={Logout} />
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
