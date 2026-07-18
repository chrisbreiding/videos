import { Icon } from '../lib/util'
import type { IconConfig } from '../lib/types'

export const IconThumb = ({
  backgroundColor,
  foregroundColor,
  icon,
  type,
}: IconConfig) => (
  <span
    className="icon-thumb"
    style={{
      backgroundColor,
      color: foregroundColor,
    }}
  >
    <Icon name={icon} type={type} />
  </span>
)
