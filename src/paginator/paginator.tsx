import { observer } from 'mobx-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { icon } from '../lib/util'
import type { LinkLocation } from '../lib/types'

const LinkTo = ({ link, direction, leftText, rightText }: {
  link?: LinkLocation | null
  direction: string
  leftText?: string
  rightText?: string
}) => {
  if (!link) return <span />

  return (
    <Link className={'paginator-button'} to={link}>
      {icon(`angle-${direction}`, leftText, rightText)}
    </Link>
  )
}

export const Paginator = observer(({ prevLink, nextLink, children }: {
  prevLink?: LinkLocation | null
  nextLink?: LinkLocation | null
  children?: ReactNode
}) => {
  return (
    <div className='paginator'>
      <LinkTo link={prevLink} direction='left' leftText='Newer' />
      {children}
      <LinkTo link={nextLink} direction='right' rightText='Older' />
    </div>
  )
})
