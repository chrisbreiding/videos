import _ from 'lodash'
import { useEffect, useRef, useState } from 'react'

export const SubTitleInput = ({ value, onUpdate }: {
  value?: string
  onUpdate: (title: string) => void
}) => {
  const [title, setTitle] = useState(value)

  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  const debouncedUpdateRef = useRef(_.debounce((value: string) => {
    onUpdateRef.current(value)
  }, 500))

  useEffect(() => {
    const debouncedUpdate = debouncedUpdateRef.current

    return () => debouncedUpdate.cancel()
  }, [])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    setTitle(value)
    debouncedUpdateRef.current(value)
  }

  return <input onChange={onChange} value={title} />
}
