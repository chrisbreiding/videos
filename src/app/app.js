import React from 'react';
import Router from 'react-router';
import SubsComponent from '../subs/subs';

const RouteHandler = React.createFactory(Router.RouteHandler);
const Subs = React.createFactory(SubsComponent);

export default React.createClass({
  render () {
    return RouteHandler();
  }
});
