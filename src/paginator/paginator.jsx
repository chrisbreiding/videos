import { observer } from 'mobx-react'
import React from 'react'
import { Link } from 'react-router'
import { icon } from '../lib/util'

const LinkTo = ({ link, direction, leftText, rightText }) => {
  if (!link) return <span />

  return (
    <Link className={'paginator-button'} to={link}>
      {icon(`angle-${direction}`, leftText, rightText)}
    </Link>
  )
}

export const Paginator = observer(({ prevLink, nextLink, children }) => {
  return (
    <div className='paginator'>
      <LinkTo link={prevLink} direction='left' leftText='Newer' />
      {children}
      <LinkTo link={nextLink} direction='right' rightText='Older' />
    </div>
  )
})
