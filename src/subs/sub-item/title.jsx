import React from 'react';
import { Link } from 'react-router';

export default ({sub}) => {
  return <Link to={`/subs/${sub.get('id')}`} activeClassName='active'>
    <h3>{sub.get('title') || sub.get('author')}</h3>
  </Link>
};
