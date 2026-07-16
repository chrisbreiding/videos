import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DocumentTitle from 'react-document-title'

import { App } from './app/app'
import { Login } from './login/login'
import { Logout } from './login/logout'

document.addEventListener('touchstart', () => {
  document.body.classList.add('has-touch')
})

createRoot(document.getElementById('app')).render(
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
)
