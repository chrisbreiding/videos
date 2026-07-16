import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged as _onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as _signOut,
} from 'firebase/auth'
import {
  deleteField as _deleteField,
  doc,
  getDoc as _getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc as _updateDoc,
} from 'firebase/firestore'

// Test stub support - allows mocking Firebase in tests
const getTestStubs = () => typeof window !== 'undefined' && window.__firebaseStubs

// App

let app

if (!getTestStubs()) {
  app = initializeApp({
    apiKey: 'AIzaSyBKLAAS6kvNvTbdOJARafhDIYmL6ch9xDY',
    projectId: 'videos-a040a',
  })
}

// Auth

export const getCurrentUser = () => {
  const stubs = getTestStubs()
  if (stubs?.currentUser) return stubs.currentUser

  return getAuth(app).currentUser
}

export const onAuthStateChanged = (callback) => {
  const stubs = getTestStubs()
  if (stubs?.onAuthStateChanged) return stubs.onAuthStateChanged(callback)

  return _onAuthStateChanged(getAuth(app), callback)
}

export const signIn = (email, password) => {
  const stubs = getTestStubs()
  if (stubs?.signIn) return stubs.signIn(email, password)

  return signInWithEmailAndPassword(getAuth(app), email, password)
}

export const signOut = () => {
  const stubs = getTestStubs()
  if (stubs?.signOut) return stubs.signOut()

  return _signOut(getAuth(app))
}

// Data

const userDoc = () => {
  const stubs = getTestStubs()
  if (stubs?.userDoc) return stubs.userDoc()

  return doc(getFirestore(app), `/users/${getCurrentUser().uid}`)
}

export const getDoc = async () => {
  const stubs = getTestStubs()
  const userDocRef = userDoc()
  const snapshot = stubs?.userDoc ? await userDocRef.get() : await _getDoc(userDocRef)
  // The real (non-stubbed) branch below only runs when a real read succeeds against
  // live, authenticated Firestore, which this test environment has no credentials for.
  const exists = stubs?.userDoc ? snapshot.exists : /* istanbul ignore next */ snapshot.exists()

  if (!exists) return

  return snapshot.data()
}

export const watchDoc = (onChange) => {
  const stubs = getTestStubs()
  const userDocRef = userDoc()

  const handleSnapshot = (snapshot) => {
    // The real (non-stubbed) branch below only fires when a real snapshot succeeds
    // against live, authenticated Firestore; unauthenticated listeners only ever
    // reach the onSnapshot error callback, which this test environment can't avoid.
    const exists = stubs?.userDoc ? snapshot.exists : /* istanbul ignore next */ snapshot.exists()

    if (!exists) return

    onChange(snapshot.data())
  }

  if (stubs?.userDoc) return userDocRef.onSnapshot(handleSnapshot)

  return onSnapshot(userDocRef, handleSnapshot)
}

export const updateDoc = (data) => {
  const stubs = getTestStubs()
  const userDocRef = userDoc()

  if (stubs?.userDoc) return userDocRef.set(data, { merge: true })

  return setDoc(userDocRef, data, { merge: true })
}

export const deleteField = (fieldPath) => {
  const stubs = getTestStubs()
  if (stubs?.deleteField) return stubs.deleteField(fieldPath)

  const userDocRef = userDoc()

  if (stubs?.userDoc) {
    return userDocRef.update({
      [fieldPath]: _deleteField(),
    })
  }

  return _updateDoc(userDocRef, {
    [fieldPath]: _deleteField(),
  })
}
