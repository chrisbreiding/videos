import React, { createClass } from 'react';
import { Link } from 'react-router';
import Title from './title';
import { icon } from '../../lib/util';

export default createClass({
  render () {
    return <span>
      <Title sub={this.props.sub} />
      <img src={this.props.sub.get('thumb')} />
    </span>
  }
});
