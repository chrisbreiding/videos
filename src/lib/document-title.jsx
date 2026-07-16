import { useEffect } from 'react'

export const DocumentTitle = ({ title }) => {
  useEffect(() => {
    document.title = title
  }, [title])

  return null
}
