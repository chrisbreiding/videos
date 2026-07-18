/// <reference types="vite/client" />

// Firebase test stubs injected onto `window` in the Playwright suite so the
// real Firebase SDK can be swapped out. The shape mirrors just the pieces the
// app touches; the fake Firestore doc ref is left loosely typed on purpose.
interface FirebaseStubs {
  currentUser?: import('firebase/auth').User | null
  onAuthStateChanged?: (
    callback: (user: import('firebase/auth').User | null) => void,
  ) => () => void
  signIn?: (email: string, password: string) => Promise<unknown>
  signOut?: () => Promise<unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userDoc?: () => any
  deleteField?: (fieldPath: string) => Promise<unknown>
}

interface Window {
  __firebaseStubs?: FirebaseStubs
  onYouTubeIframeAPIReady: (() => void) | null
}
