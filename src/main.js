require('./lib/base.styl');

import React from 'react';
import Router from 'react-router';
import AppComponent from './app/app';
import SubsComponent from './subs/subs';

const Route = React.createFactory(Router.Route);
const DefaultRoute = React.createFactory(Router.DefaultRoute);

const routes = Route({ handler: AppComponent, path: '/' },
  DefaultRoute({ handler: SubsComponent })
);

Router.run(routes, (Handler)=> {
  React.render(React.createFactory(Handler)(), document.getElementById('app'));
});
