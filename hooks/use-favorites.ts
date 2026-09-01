'use client'

import { useCallback, useEffect, useState } from 'react'

import { storageKeys } from '@/config/site'
import { readStringList, writeStringList } from '@/lib/storage'

/**
 * Pinned tools, persisted in this browser only.
 *
 * The list is read in an effect rather than during render. Reading storage in
 * render would produce markup the server could not have produced, and React
 * would throw away the whole tree on hydration. `ready` lets a caller tell
 * "nothing pinned" apart from "not read yet"; the star is hidden until hover
 * anyway, so the one-frame gap is invisible and costs no layout shift.
 *
 * A `storage` listener keeps two tabs of the site in agreement.
 */
export interface UseFavorites {
  favorites: string[]
  ready: boolean
  isFavorite: (id: string) => boolean
  toggle: (id: string) => void
  clear: () => void
}

export function useFavorites(): UseFavorites {
  const [favorites, setFavorites] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setFavorites(readStringList(storageKeys.favorites))
    setReady(true)

    function onStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== storageKeys.favorites) return
      setFavorites(readStringList(storageKeys.favorites))
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const toggle = useCallback((id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]
      writeStringList(storageKeys.favorites, next)
      return next
    })
  }, [])

  const clear = useCallback(() => {
    writeStringList(storageKeys.favorites, [])
    setFavorites([])
  }, [])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  return { favorites, ready, isFavorite, toggle, clear }
}
