// import { configure as configureMobx } from 'mobx'
import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DocumentTitle from 'react-document-title'

// https://github.com/mobxjs/mobx-react-lite/#observer-batching
import 'mobx-react-lite/batchingForReactDom'

import { App } from './app/app'
import { Login } from './login/login'
import { Logout } from './login/logout'

// TODO: need to figure out why mobx thinks it's in production mode
// when developing. it makes errors from this impossible to debug
// configureMobx({ enforceActions: 'always' })

document.addEventListener('touchstart', () => {
  document.body.className = 'has-touch'
})

render(
  <>
    <DocumentTitle title='Videos' />
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/*' element={<App />} />
      </Routes>
    </BrowserRouter>
  </>,
  document.getElementById('app'),
)
