// import { configure as configureMobx } from 'mobx'
import { Provider, observer } from 'mobx-react'
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router'
import React from 'react'
import { render } from 'react-dom'
import { Router, Routes, Route } from 'react-router-dom'
import { createBrowserHistory } from 'history'
import DocumentTitle from 'react-document-title'

// https://github.com/mobxjs/mobx-react-lite/#observer-batching
import 'mobx-react-lite/batchingForReactDom'

import { App } from './app/app'
import { Login } from './login/login'
import { Logout } from './login/logout'

// TODO: need to figure out why mobx thinks it's in production mode
// when developing. it makes errors from this impossible to debug
// configureMobx({ enforceActions: 'always' })

const browserHistory = createBrowserHistory()
const routerStore = new RouterStore()

const history = syncHistoryWithStore(browserHistory, routerStore)

document.addEventListener('touchstart', () => {
  document.body.className = 'has-touch'
})

const AppRouter = observer(() => (
  <Router location={routerStore.location} navigator={history}>
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/logout' element={<Logout />} />
      <Route path='/*' element={<App />} />
    </Routes>
  </Router>
))

render(
  <Provider router={routerStore}>
    <DocumentTitle title='Videos' />
    <AppRouter />
  </Provider>,
  document.getElementById('app'),
)
