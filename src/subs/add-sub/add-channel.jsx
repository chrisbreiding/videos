import { observer } from 'mobx-react'
import _ from 'lodash'
import React, { Component } from 'react'

import { icon } from '../../lib/util'

@observer
class AddChannel extends Component {
  componentDidMount () {
    this._search()
    this.refs.query.focus()
  }

  componentDidUpdate () {
    this._search()
  }

  componentWillUnmount () {
    this.props.clearSearch()
  }

  _search () {
    const query = this.props.query
    const oldQuery = this.query
    if (!query || query === oldQuery) return
    this.query = query
    this.refs.query.value = query
    this.props.search(query)
  }

  render () {
    return (
      <div className='add-channel'>
        <form onSubmit={this._searchSubs}>
          <input ref='query' placeholder='Search...' defaultValue={this.props.query} />
          <button>{icon('search')}</button>
        </form>
        <ul>{this._results()}</ul>
      </div>
    )
  }

  _results () {
    return this.props.searchResults.map((channel) => {
      return (
        <li key={channel.id}>
          <img src={channel.thumb} />
          <h3>{channel.title || channel.author}</h3>
          <button onClick={_.partial(this.props.onAdd, 'channel', channel)}>{icon('plus')}</button>
        </li>
      )
    })
  }

  _searchSubs = (e) => {
    e.preventDefault()
    this.props.updateSearch(this.refs.query.value)
  }
}

export default AddChannel
