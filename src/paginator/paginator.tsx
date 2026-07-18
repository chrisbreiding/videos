import { observer } from 'mobx-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

import { Icon } from '../lib/util'
import type { LinkLocation } from '../lib/types'

const LinkTo = ({
  link,
  children,
}: {
  link?: LinkLocation | null
  children: ReactNode
}) => {
  if (!link) return <span />

  return (
    <Link className="paginator-button" to={link}>
      {children}
    </Link>
  )
}

export const Paginator = observer(
  ({
    prevLink,
    nextLink,
    children,
  }: {
    prevLink?: LinkLocation | null
    nextLink?: LinkLocation | null
    children?: ReactNode
  }) => {
    return (
      <div className="paginator">
        <LinkTo link={prevLink}>
          <Icon name="angle-left" rightText="Newer" />
        </LinkTo>
        {children}
        <LinkTo link={nextLink}>
          <Icon name="angle-right" leftText="Older" />
        </LinkTo>
      </div>
    )
  },
)
