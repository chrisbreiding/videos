import cs from 'classnames'
import _ from 'lodash'
import { action, observable } from 'mobx'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'

import subsStore from './subs-store'
import { icon, updatedLink } from '../lib/util'

import SubItem from './sub-item/sub-item'

const SortableSubItem = SortableElement(SubItem)

@inject('router')
@observer
class Subs extends Component {
  @observable isEditing = false

  render () {
    const hasNoSubs = !subsStore.subs.length

    return (
      <aside className={cs('subs-list', { 'is-empty': hasNoSubs })}>
        <header>
          {this._editButton()}
        </header>
        {this._subs()}
        {this._addSubButtons(hasNoSubs)}
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
      return null
    }

    const { location } = this.props
    const search = {
      search: undefined,
      marker: undefined,
    }
    const allSubsLink = updatedLink(location, {
      pathname: '/',
      search,
    })

    return (
      <ul className={cs({
        'editing': this.isEditing,
        'has-subs': !!subsStore.subs.length,
      })}>
        <li className='sub-item all-subs'>
          <span>
            <span className='thumb'>
              {_.map(subsStore.fourChannels, (sub) => (
                <img key={sub.id} src={sub.thumb} />
              ))}
            </span>
            <NavLink exact to={allSubsLink} className='sub-title' activeClassName='active'>
              <h3>All Subs</h3>
            </NavLink>
          </span>
        </li>
        {subsStore.subs.map((sub, index) => {
          const link = updatedLink(location, {
            pathname: `/subs/${sub.id}`,
            search,
          })
          const bookmarkLink = sub.bookmarkedPageToken && updatedLink(location, {
            pathname: `/subs/${sub.id}/page/${sub.bookmarkedPageToken}`,
            search: _.extend({}, search, {
              marker: 'video-marker',
            }),
          })

          return (
            <SortableSubItem
              key={sub.id}
              index={index}
              sub={sub}
              link={link}
              bookmarkLink={bookmarkLink}
              onUpdate={_.partial(this._updateSub, sub.id)}
              onRemove={_.partial(this._removeSub, sub.id)}
            />
          )
        })}
      </ul>
    )
  }

  _addSubButtons (hasNoSubs) {
    return (
      <div className='add-sub-buttons'>
        {hasNoSubs && <p className='add-sub-buttons-prompt'>Add a channel to get started</p>}
        <div className='add-sub-buttons-links'>
          <NavLink to='/add-channel'>{icon('plus', 'Channel')}</NavLink>
          <NavLink to='/add-custom-playlist'>{icon('plus', 'Custom Playlist')}</NavLink>
        </div>
      </div>
    )
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

const SortableSubs = SortableContainer(Subs)

const SortableSubsContainer = (props) => {
  const onSortEnd = (sortProps) => {
    props.onSortEnd()
    subsStore.sort(sortProps)
  }

  return (
    <SortableSubs
      {...props}
      useDragHandle={true}
      onSortStart={props.onSortStart}
      onSortEnd={onSortEnd}
    />
  )
}

export default SortableSubsContainer
