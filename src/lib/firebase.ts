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
  DocumentReference,
  DocumentSnapshot,
  getDoc as _getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc as _updateDoc,
  type DocumentData,
} from 'firebase/firestore'

// Test stub support - allows mocking Firebase in tests
const getTestStubs = (): FirebaseStubs | undefined => {
  return (typeof window !== 'undefined' && window.__firebaseStubs) as
    FirebaseStubs | undefined
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

export const onAuthStateChanged = (
  callback: (user: User | null) => void,
): (() => void) => {
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

// Mirrors just the pieces of a Firestore doc ref/snapshot the app touches,
// so the test stubs (left loosely typed in `FirebaseStubs` on purpose) can be
// narrowed to something usable here without resorting to `any`.
interface StubSnapshot {
  exists: boolean
  data: () => unknown
}

interface StubDocRef {
  get: () => Promise<StubSnapshot>
  set: (data: DocumentData, options: { merge: boolean }) => Promise<void>
  update: (data: DocumentData) => Promise<void>
  onSnapshot: (callback: (snapshot: StubSnapshot) => void) => () => void
}

const userDoc = (): DocumentReference<DocumentData> | StubDocRef => {
  const stubs = getTestStubs()
  if (stubs?.userDoc) return stubs.userDoc() as StubDocRef

  return doc(getFirestore(app!), `/users/${getCurrentUser()!.uid}`)
}

export const getDoc = async (): Promise<DocumentData | undefined> => {
  const userDocRef = userDoc()

  // The real (non-stubbed) branch below only runs when a real read succeeds against
  // live, authenticated Firestore, which this test environment has no credentials for.
  /* istanbul ignore if */
  if (userDocRef instanceof DocumentReference) {
    const snapshot = await _getDoc(userDocRef)

    if (!snapshot.exists()) return

    return snapshot.data()
  }

  const snapshot = await userDocRef.get()

  if (!snapshot.exists) return

  return snapshot.data() as DocumentData
}

export const watchDoc = (
  onChange: (data: DocumentData) => void,
): (() => void) => {
  const userDocRef = userDoc()

  const handleSnapshot = (
    snapshot: DocumentSnapshot<DocumentData> | StubSnapshot,
  ) => {
    // The real (non-stubbed) branch below only fires when a real snapshot succeeds
    // against live, authenticated Firestore; unauthenticated listeners only ever
    // reach the onSnapshot error callback, which this test environment can't avoid.
    /* istanbul ignore next */
    const exists =
      snapshot instanceof DocumentSnapshot ? snapshot.exists() : snapshot.exists

    if (!exists) return

    onChange(snapshot.data() as DocumentData)
  }

  if (userDocRef instanceof DocumentReference) {
    return onSnapshot(userDocRef, handleSnapshot)
  }

  return userDocRef.onSnapshot(handleSnapshot)
}

export const updateDoc = (data: DocumentData) => {
  const userDocRef = userDoc()

  if (userDocRef instanceof DocumentReference) {
    return setDoc(userDocRef, data, { merge: true })
  }

  return userDocRef.set(data, { merge: true })
}

export const deleteField = (fieldPath: string) => {
  const stubs = getTestStubs()
  if (stubs?.deleteField) return stubs.deleteField(fieldPath)

  const userDocRef = userDoc()

  if (userDocRef instanceof DocumentReference) {
    return _updateDoc(userDocRef, {
      [fieldPath]: _deleteField(),
    })
  }

  return userDocRef.update({
    [fieldPath]: _deleteField(),
  })
}
