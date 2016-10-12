import cs from 'classnames'
import _ from 'lodash'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'

import propTypes from '../lib/prop-types'
import subsStore from './subs-store'

import AddSub from './add-sub/add-sub'
import SubItem from './sub-item/sub-item'

@observer
class Subs extends Component {
  static contextTypes = {
    router: propTypes.router,
  }

  @observable isEditing = false

  componentWillMount () {
    subsStore.fetch()
  }

  render () {
    const query = this.props.location.query || {}
    const hasNoSubs = !subsStore.subs.length

    return (
      <aside className={cs('subs-list', { 'is-empty': hasNoSubs })}>
        <header>
          {this._editButton()}
        </header>
        {this._subs()}
        <AddSub
          clearSearch={this._clearAddSearch}
          linkTo={this._linkToAdding}
          onAdd={this._onAdd}
          type={hasNoSubs ? 'channel' : query.adding}
          query={query.q}
          search={this._search}
          searchResults={subsStore.searchResults}
          updateSearch={this._updateSearch}
        />
      </aside>
    )
  }

  _editButton () {
    if (!subsStore.subs.length) return null

    return (
      <button onClick={this._toggleEditing}>
        {this.isEditing ? 'Done' : 'Edit'}
      </button>
    )
  }

  _subs () {
    if (!subsStore.subs.length) {
      return (
        <p className='subs-empty'>Add a channel to get started</p>
      )
    }

    return (
      <ul className={cs({ editing: this.isEditing })}>
        {subsStore.subs.map((sub) => (
          <SubItem
            key={sub.id}
            sub={sub}
            onUpdate={_.partial(this._updateSub, sub.id)}
            onRemove={_.partial(this._removeSub, sub.id)}
          />
        ))}
      </ul>
    )
  }

  _clearAddSearch = () => {
    subsStore.clearSearchResults()

    this.context.router.replaceWith({
      pathname: this.props.location.pathname,
      query: _.omit(this.props.location.query, 'q'),
    })
  }

  _linkToAdding = (type) => {
    const { pathname, query } = this.props.location
    return {
      pathname,
      query: _.extend({}, query, { adding: type }),
    }
  }

  _onAdd = (type, sub) => {
    if (type === 'channel') {
      subsStore.addChannel(sub)
    } else {
      subsStore.addCustomPlaylist(sub)
    }

    this.context.router.transitionTo(this._linkToAdding())
  }

  _search = (query) => {
    subsStore.search(query)
  }

  _updateSearch = (search) => {
    const { pathname, query } = this.props.location
    this.context.router.transitionTo({
      pathname,
      query: _.extend({}, query, { q: search }),
    })
  }

  @action _toggleEditing = () => {
    this.isEditing = !this.isEditing
  }

  _updateSub = (id, props) => {
    subsStore.update(id, props)
  }

  _removeSub = (id) => {
    this.isEditing = false
    subsStore.remove(id)
  }
}

export default Subs
