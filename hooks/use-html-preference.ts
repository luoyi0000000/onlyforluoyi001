'use client'

import { useCallback, useEffect, useState } from 'react'

/**
 * A preference stored in localStorage and mirrored onto a `data-*` attribute of
 * <html>, so CSS alone can react to it.
 *
 * The value is applied before first paint by `PreferenceScript`; this hook only
 * needs to catch up after hydration, which is why it starts from the SSR
 * fallback and syncs in an effect. `ready` lets callers avoid rendering a
 * selected state that would flip on mount.
 */
export function useHtmlPreference<T extends string>(
  attribute: string,
  storageKey: string,
  allowed: readonly T[],
  fallback: T,
): { value: T; setValue: (next: T) => void; ready: boolean } {
  const [value, setStateValue] = useState<T>(fallback)
  const [ready, setReady] = useState(false)

  const isAllowed = useCallback(
    (candidate: string | null): candidate is T =>
      candidate !== null && (allowed as readonly string[]).includes(candidate),
    [allowed],
  )

  useEffect(() => {
    const fromDom = document.documentElement.getAttribute(attribute)
    if (isAllowed(fromDom)) {
      setStateValue(fromDom)
      setReady(true)
      return
    }
    try {
      const stored = window.localStorage.getItem(storageKey)
      if (isAllowed(stored)) {
        setStateValue(stored)
        document.documentElement.setAttribute(attribute, stored)
      }
    } catch {
      // Private mode or a blocked storage partition: keep the SSR default.
    }
    setReady(true)
  }, [attribute, storageKey, isAllowed])

  const setValue = useCallback(
    (next: T) => {
      setStateValue(next)
      document.documentElement.setAttribute(attribute, next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Preference simply will not persist; the session still honours it.
      }
    },
    [attribute, storageKey],
  )

  return { value, setValue, ready }
}
