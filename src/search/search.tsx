import { useRef, useEffect } from 'react'

import { icon } from '../lib/util'

export const Search = ({ query, onSearch }: { query?: string, onSearch: (value: string) => void }) => {
  const queryRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!query) {
      queryRef.current!.value = ''
    }
  }, [query])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(queryRef.current!.value)
  }

  return (
    <form className="search" onSubmit={onSubmit}>
      <input
        ref={queryRef}
        defaultValue={query}
        placeholder="Search Channel"
      />
      <button>{icon('search')}</button>
    </form>
  )
}
