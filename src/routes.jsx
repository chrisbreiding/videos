import React, { createClass } from 'react';
import { Route, Redirect } from 'react-router';

import App from './app/app';
import Sub from './sub/sub';
import Login from './login/login';

const Root = createClass({ render () { return this.props.children; } });

export default <Route component={Root}>
  <Redirect from="/" to="/subs" />
  <Route path='/subs' component={App}>
    <Route path=':id' component={Sub} />
  </Route>
  <Route path='/login' component={Login} />
</Route>;
