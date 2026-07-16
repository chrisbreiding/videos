import cs from 'classnames'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'

import { subsStore } from './subs-store'
import { icon, updatedLink } from '../lib/util'

import { SubItem } from './sub-item/sub-item'

export const Subs = observer(({ location, onSortStart, onSortEnd }) => {
  const [isEditing, setIsEditing] = useState(false)

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  const updateSub = (id, props) => {
    subsStore.update(id, props)
  }

  const removeSub = (id) => {
    subsStore.remove(id)
  }

  const handleDragEnd = (event) => {
    onSortEnd()

    if (event.canceled) return

    const ids = _.map(subsStore.subs, 'id')
    const sortedIds = move(ids, event)

    subsStore.sort(sortedIds)
  }

  const renderEditButton = () => {
    if (!subsStore.subs.length) return null

    return (
      <button onClick={toggleEditing}>
        {isEditing ? 'Done' : 'Edit'}
      </button>
    )
  }

  const renderSubs = () => {
    if (!subsStore.subs.length) {
      return null
    }

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
        'editing': isEditing,
        'has-subs': !!subsStore.subs.length,
      })}>
        <li className='sub-item all-subs'>
          <span>
            <span className='thumb'>
              {_.map(subsStore.fourChannels, (sub) => (
                <img key={sub.id} src={sub.thumb} />
              ))}
            </span>
            <NavLink end to={allSubsLink} className={({ isActive }) => cs('sub-title', { active: isActive })}>
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
            <SubItem
              key={sub.id}
              index={index}
              sub={sub}
              link={link}
              bookmarkLink={bookmarkLink}
              onUpdate={_.partial(updateSub, sub.id)}
              onRemove={_.partial(removeSub, sub.id)}
            />
          )
        })}
      </ul>
    )
  }

  const renderAddSubButtons = () => {
    if (!subsStore.subs.length) {
      return (
        <p className='empty-message'>Add a channel to get started {icon('arrow-right')}</p>
      )
    }

    return (
      <div className='add-sub-buttons'>
        <div className='add-sub-buttons-links'>
          <NavLink to='/add-channel'>{icon('plus', 'Channel')}</NavLink>
          <NavLink to='/add-custom-playlist'>{icon('plus', 'Custom Playlist')}</NavLink>
        </div>
      </div>
    )
  }

  // const hasNoSubs = !subsStore.subs.length

  // TODO: if no subs, redirect to /add-channel and show nothing here

  return (
    <aside className={cs('subs-list')}>
      <header>
        {renderEditButton()}
      </header>
      <DragDropProvider onDragStart={onSortStart} onDragEnd={handleDragEnd}>
        {renderSubs()}
      </DragDropProvider>
      {renderAddSubButtons()}
    </aside>
  )
})
