import { library as fontAwesome } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'

import { App } from './app/app'
import { DocumentTitle } from './lib/document-title'
import { Login } from './login/login'
import { Logout } from './login/logout'

// Makes icons available to be referenced by their icon name
fontAwesome.add(fas, far, fab)

document.addEventListener('touchstart', () => {
  document.body.classList.add('has-touch')
})

createRoot(document.getElementById('app')!).render(
  <>
    <DocumentTitle title="Videos" />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </>,
)
