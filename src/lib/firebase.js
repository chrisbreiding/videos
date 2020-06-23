import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// App

firebase.initializeApp({
  apiKey: 'AIzaSyBKLAAS6kvNvTbdOJARafhDIYmL6ch9xDY',
  projectId: 'videos-a040a',
})

// Auth

export const getCurrentUser = () => {
  return firebase.auth().currentUser
}

export const onAuthStateChanged = (callback) => {
  firebase.auth().onAuthStateChanged(callback)
}

export const signIn = (email, password) => {
  return firebase.auth().signInWithEmailAndPassword(email, password)
}

export const signOut = () => {
  return firebase.auth().signOut()
}

// Data

const userDoc = () => {
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
  userDoc().update({
    [fieldPath]: firebase.firestore.FieldValue.delete(),
  })
}
