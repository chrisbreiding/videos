import type { DocumentData } from 'firebase/firestore'

import {
  deleteField,
  getDoc,
  updateDoc,
  watchDoc,
} from '../lib/firebase'

export const fetch = () => {
  return getDoc()
}

export const update = (data: DocumentData) => {
  return updateDoc(data)
}

export { deleteField }

export const removeSub = (id: string) => {
  deleteField(`subs.${id}`)
}

export const removeVideoFromSub = (subId: string, videoId: string) => {
  deleteField(`subs.${subId}.videos.${videoId}`)
}

export const listen = (onChange: (data: DocumentData) => void) => {
  // may need to getDoc once if it isn't called on initial load
  return watchDoc(onChange)
}
