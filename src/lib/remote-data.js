import {
  deleteField,
  getDoc,
  updateDoc,
  watchDoc,
} from '../lib/firebase'

export const fetch = () => {
  return getDoc()
}

export const update = (data) => {
  return updateDoc(data)
}

export const removeSub = (id) => {
  deleteField(`subs.${id}`)
}

export const removeVideoFromSub = (subId, videoId) => {
  deleteField(`subs.${subId}.videos.${videoId}`)
}

export const listen = (onChange) => {
  // may need to getDoc once if it isn't called on initial load
  return watchDoc(onChange)
}
