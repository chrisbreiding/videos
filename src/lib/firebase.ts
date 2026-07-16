import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged as _onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as _signOut,
  type User,
} from 'firebase/auth'
import {
  deleteField as _deleteField,
  doc,
  getDoc as _getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc as _updateDoc,
  type DocumentData,
} from 'firebase/firestore'

// Test stub support - allows mocking Firebase in tests
const getTestStubs = (): FirebaseStubs | undefined => {
  return (typeof window !== 'undefined' && window.__firebaseStubs) as FirebaseStubs | undefined
}

// App

let app: FirebaseApp | undefined

if (!getTestStubs()) {
  app = initializeApp({
    apiKey: 'AIzaSyBKLAAS6kvNvTbdOJARafhDIYmL6ch9xDY',
    projectId: 'videos-a040a',
  })
}

// Auth

export const getCurrentUser = (): User | null => {
  const stubs = getTestStubs()
  if (stubs?.currentUser) return stubs.currentUser

  return getAuth(app).currentUser
}

export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
  const stubs = getTestStubs()
  if (stubs?.onAuthStateChanged) return stubs.onAuthStateChanged(callback)

  return _onAuthStateChanged(getAuth(app), callback)
}

export const signIn = (email: string, password: string) => {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const userDoc = (): any => {
  const stubs = getTestStubs()
  if (stubs?.userDoc) return stubs.userDoc()

  return doc(getFirestore(app!), `/users/${getCurrentUser()!.uid}`)
}

export const getDoc = async (): Promise<DocumentData | undefined> => {
  const stubs = getTestStubs()
  const userDocRef = userDoc()
  const snapshot = stubs?.userDoc ? await userDocRef.get() : await _getDoc(userDocRef)
  // The real (non-stubbed) branch below only runs when a real read succeeds against
  // live, authenticated Firestore, which this test environment has no credentials for.
  const exists = stubs?.userDoc ? snapshot.exists : /* istanbul ignore next */ snapshot.exists()

  if (!exists) return

  return snapshot.data()
}

export const watchDoc = (onChange: (data: DocumentData) => void): (() => void) => {
  const stubs = getTestStubs()
  const userDocRef = userDoc()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSnapshot = (snapshot: any) => {
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

export const updateDoc = (data: DocumentData) => {
  const stubs = getTestStubs()
  const userDocRef = userDoc()

  if (stubs?.userDoc) return userDocRef.set(data, { merge: true })

  return setDoc(userDocRef, data, { merge: true })
}

export const deleteField = (fieldPath: string) => {
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
