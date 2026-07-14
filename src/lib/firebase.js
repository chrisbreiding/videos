import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// Test stub support - allows mocking Firebase in tests
const getTestStubs = () => typeof window !== 'undefined' && window.__firebaseStubs

// App

if (!getTestStubs()) {
  firebase.initializeApp({
    apiKey: 'AIzaSyBKLAAS6kvNvTbdOJARafhDIYmL6ch9xDY',
    projectId: 'videos-a040a',
  })
}

// Auth

export const getCurrentUser = () => {
  const stubs = getTestStubs()
  if (stubs?.currentUser) return stubs.currentUser

  return firebase.auth().currentUser
}

export const onAuthStateChanged = (callback) => {
  const stubs = getTestStubs()
  if (stubs?.onAuthStateChanged) return stubs.onAuthStateChanged(callback)

  return firebase.auth().onAuthStateChanged(callback)
}

export const signIn = (email, password) => {
  const stubs = getTestStubs()
  if (stubs?.signIn) return stubs.signIn(email, password)

  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const signOut = () => {
  const stubs = getTestStubs()
  if (stubs?.signOut) return stubs.signOut()

  return firebase.auth().signOut()
}

// Data

const userDoc = () => {
  const stubs = getTestStubs()
  if (stubs?.userDoc) return stubs.userDoc()

  return firebase.firestore().doc(`/users/${getCurrentUser().uid}`)
}

export const getDoc = async () => {
  const snapshot = await userDoc().get()

  if (!snapshot.exists) return

  return snapshot.data()
}

export const watchDoc = (onChange) => {
  return userDoc().onSnapshot((snapshot) => {
    if (!snapshot.exists) return

    onChange(snapshot.data())
  })
}

export const updateDoc = (data) => {
  return userDoc().set(data, { merge: true })
}

export const deleteField = (fieldPath) => {
  const stubs = getTestStubs()
  if (stubs?.deleteField) return stubs.deleteField(fieldPath)

  userDoc().update({
    [fieldPath]: firebase.firestore.FieldValue.delete(),
  })
}
