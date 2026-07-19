import cs from 'classnames'
import { useState } from 'react'
import { NavLink, type Location } from 'react-router'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'

import { useSubsContext } from './subs-context'
import { Icon, updatedLink } from '../lib/util'

import { SubItem } from './sub-item/sub-item'
import type { SubProps } from '../lib/types'

export const Subs = ({
  location,
  onSortStart,
  onSortEnd,
}: {
  location: Location
  onSortStart: () => void
  onSortEnd: () => void
}) => {
  const { subs, fourChannels, update, remove, sort } = useSubsContext()

  const [isEditing, setIsEditing] = useState(false)

  const toggleEditing = () => {
    setIsEditing(!isEditing)
  }

  const updateSub = (id: string, props: Partial<SubProps>) => {
    update(id, props)
  }

  const removeSub = (id: string) => {
    remove(id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    onSortEnd()

    if (event.canceled) return

    const ids = subs.map((sub) => sub.id)
    const sortedIds = move(ids, event)

    sort(sortedIds)
  }

  const renderEditButton = () => {
    if (!subs.length) return null

    return (
      <button onClick={toggleEditing}>{isEditing ? 'Done' : 'Edit'}</button>
    )
  }

  const renderSubs = () => {
    if (!subs.length) {
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
      <ul
        className={cs({
          editing: isEditing,
          'has-subs': !!subs.length,
        })}
      >
        <li className="sub-item all-subs">
          <span>
            <span className="thumb">
              {fourChannels.map((sub) => (
                <img key={sub.id} src={sub.thumb} />
              ))}
            </span>
            <NavLink
              end
              to={allSubsLink}
              className={({ isActive }) =>
                cs('sub-title', { active: isActive })
              }
            >
              <h3>All Subs</h3>
            </NavLink>
          </span>
        </li>
        {subs.map((sub, index) => {
          const link = updatedLink(location, {
            pathname: `/subs/${sub.id}`,
            search,
          })
          const bookmarkLink =
            sub.bookmarkedPageToken &&
            updatedLink(location, {
              pathname: `/subs/${sub.id}/page/${sub.bookmarkedPageToken}`,
              search: { ...search, marker: 'video-marker' },
            })

          return (
            <SubItem
              key={sub.id}
              index={index}
              sub={sub}
              link={link}
              bookmarkLink={bookmarkLink}
              onUpdate={(props) => updateSub(sub.id, props)}
              onRemove={() => removeSub(sub.id)}
            />
          )
        })}
      </ul>
    )
  }

  const renderAddSubButtons = () => {
    if (!subs.length) {
      return (
        <p className="empty-message">
          Add a channel to get started <Icon name="arrow-right" />
        </p>
      )
    }

    return (
      <div className="add-sub-buttons">
        <div className="add-sub-buttons-links">
          <NavLink to="/add-channel">
            <Icon name="plus" rightText="Channel" />
          </NavLink>
          <NavLink to="/add-custom-playlist">
            <Icon name="plus" rightText="Custom Playlist" />
          </NavLink>
        </div>
      </div>
    )
  }

  // const hasNoSubs = !subs.length

  // TODO: if no subs, redirect to /add-channel and show nothing here

  return (
    <aside className={cs('subs-list')}>
      <header>{renderEditButton()}</header>
      <DragDropProvider onDragStart={onSortStart} onDragEnd={handleDragEnd}>
        {renderSubs()}
      </DragDropProvider>
      {renderAddSubButtons()}
    </aside>
  )
}
