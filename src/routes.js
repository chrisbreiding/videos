import { createFactory, createClass } from 'react';
import Router from 'react-router';

import AppComponent from './app/app';
import SubComponent from './subs/sub';
import LoginComponent from './login/login';

const Route = createFactory(Router.Route);
const RouteHandler = createFactory(Router.RouteHandler);

const RootComponent = createClass({ render () { return RouteHandler(); } });

export default Route({ handler: RootComponent, path: '/' },
  Route({ name: 'app', handler: AppComponent, path: '/' },
    Route({ name: 'sub', handler: SubComponent, path: 'subs/:playlistId' })
  ),
  Route({ name: 'login', handler: LoginComponent })
);
