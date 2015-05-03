import { createFactory, createClass } from 'react';
import Router from 'react-router';
import SubsComponent from '../subs/subs';

const RouteHandler = createFactory(Router.RouteHandler);
const Subs = createFactory(SubsComponent);

export default createClass({
  render () {
    return RouteHandler();
  }
});
