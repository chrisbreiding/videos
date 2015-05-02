require('./lib/base.styl');

const React = require('react');
const Router = require('react-router');
const AppComponent = require('./app/app');

const Route = React.createFactory(Router.Route);

const routes = Route({ handler: AppComponent, path: '/' });

Router.run(routes, (Handler)=> {
  React.render(React.createFactory(Handler)(), document.getElementById('app'));
});
