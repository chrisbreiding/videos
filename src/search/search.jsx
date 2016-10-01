import React, { Component } from 'react';

class Search extends Component {
  componentDidUpdate () {
    if (!this.props.query) {
      this.refs.query.value = ''
    }
  }

  render () {
    return (
      <form className="search" onSubmit={this._onSubmit}>
        <input
          ref='query'
          defaultValue={this.props.query}
          placeholder="Search Channel"
        />
        <button>
          <i className='fa fa-search' />
        </button>
      </form>
    )
  }

  _onSubmit = (e) => {
    e.preventDefault()
    this.props.onSearch(this.refs.query.value)
  }
}

export default Search
