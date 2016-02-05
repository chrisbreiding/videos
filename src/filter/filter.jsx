import React, { createClass } from 'react';

export default createClass({
  render () {
    return (
      <input
        ref="filter"
        className="filter"
        placeholder="Filter"
        value={this.props.filter}
        onChange={this._onChange}
      />
    );
  },

  _onChange () {
    this.props.onChange(this.refs.filter.value);
  },
});
