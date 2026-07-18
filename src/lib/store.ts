import { useCallback, useRef, useSyncExternalStore } from 'react'

// A minimal observable store base class. Subclasses mutate their own state and
// call `emit()` whenever that state changes. React components subscribe to one
// or more stores via the `useStore` hook to re-render on those changes.
export class Store {
  private _listeners = new Set<() => void>()
  private _version = 0

  subscribe = (listener: () => void) => {
    this._listeners.add(listener)

    return () => {
      this._listeners.delete(listener)
    }
  }

  // A monotonically increasing counter used as the store's snapshot. It changes
  // exactly when the store's state changes, which is what `useSyncExternalStore`
  // compares to decide whether to re-render.
  getVersion = () => this._version

  emit = () => {
    this._version += 1
    this._listeners.forEach((listener) => {
      listener()
    })
  }
}

// Subscribes the calling component to the given stores, re-rendering it whenever
// any of them emits a change. The stores are stable singletons, so the set
// passed on the first render is captured and reused for the component's lifetime.
export function useStore(...stores: Store[]) {
  const storesRef = useRef(stores)

  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubscribers = storesRef.current.map((store) =>
      store.subscribe(onStoreChange),
    )

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        unsubscribe()
      })
    }
  }, [])

  const getSnapshot = useCallback(
    () =>
      storesRef.current.reduce((total, store) => total + store.getVersion(), 0),
    [],
  )

  useSyncExternalStore(subscribe, getSnapshot)
}
