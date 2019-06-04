import cs from 'classnames'
import _ from 'lodash'
import { action, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'

import subsStore from './subs-store'
import util from '../lib/util'

import AddSub from './add-sub/add-sub'
import SubItem from './sub-item/sub-item'

@observer
class Subs extends Component {
  @observable isEditing = false

  componentWillMount () {
    subsStore.fetch()
  }

  render () {
    const query = this._getQuery()
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
        {subsStore.subs.map((sub) => {
          const link = {
            pathname: `/subs/${sub.id}`,
            search: util.stringifyQueryString({ nowPlaying: this._getQuery().nowPlaying }),
          }
          return (
            <SubItem
              key={sub.id}
              sub={sub}
              link={link}
              onUpdate={_.partial(this._updateSub, sub.id)}
              onRemove={_.partial(this._removeSub, sub.id)}
            />
          )
        })}
      </ul>
    )
  }

  @action _clearAddSearch = () => {
    subsStore.clearSearchResults()

    window.hist.replace({
      pathname: this.props.location.pathname,
      search: util.stringifyQueryString(_.omit(this._getQuery(), 'q')),
    })
  }

  _linkToAdding = (type) => {
    const { pathname } = this.props.location
    return {
      pathname,
      search: util.stringifyQueryString(_.extend({}, this._getQuery(), { adding: type })),
    }
  }

  _getQuery () {
    return util.parseQueryString(this.props.location.search)
  }

  _onAdd = (type, sub) => {
    if (type === 'channel') {
      subsStore.addChannel(sub)
    } else {
      subsStore.addCustomPlaylist(sub)
    }

    window.hist.push(this._linkToAdding())
  }

  _search = (query) => {
    subsStore.search(query)
  }

  _updateSearch = (search) => {
    const { pathname } = this.props.location
    window.hist.push({
      pathname,
      search: util.stringifyQueryString(_.extend({}, this._getQuery(), { q: search })),
    })
  }

  @action _toggleEditing = () => {
    this.isEditing = !this.isEditing
  }

  @action _updateSub = (id, props) => {
    subsStore.update(id, props)
  }

  @action _removeSub = (id) => {
    this.isEditing = false
    subsStore.remove(id)
  }
}

export default Subs
