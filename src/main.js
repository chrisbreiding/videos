require('./main.styl');

import { render, createFactory } from 'react';
import Router from 'react-router';
import AppComponent from './app/app';
import SubsComponent from './subs/subs';
import LoginComponent from './login/login';

const Route = createFactory(Router.Route);
const DefaultRoute = createFactory(Router.DefaultRoute);

const routes = Route({ handler: AppComponent, path: '/' },
  DefaultRoute({ name: 'default', handler: SubsComponent }),
  Route({ name: 'login', handler: LoginComponent })
);

Router.run(routes, (Handler)=> {
  render(createFactory(Handler)(), document.getElementById('app'));
});
