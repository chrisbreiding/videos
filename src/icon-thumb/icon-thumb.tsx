import { icon } from '../lib/util'
import type { IconConfig } from '../lib/types'

export const IconThumb = ({ backgroundColor, foregroundColor, icon: thumbIcon }: IconConfig) => (
  <span
    className='icon-thumb'
    style={{
      backgroundColor,
      color: foregroundColor,
    }}
  >
    {icon(thumbIcon)}
  </span>
)
