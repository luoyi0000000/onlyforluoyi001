'use client'

import { useCallback, useEffect, useState } from 'react'

import { siteConfig, storageKeys } from '@/config/site'
import { readStringList, writeStringList } from '@/lib/storage'

/**
 * Recently opened tools, most recent first, capped by `siteConfig.recentLimit`.
 *
 * `push` is called on click rather than on the destination page, so it also
 * records external `kind: 'link'` tools — those navigate away and never get a
 * chance to report back.
 *
 * Same hydration rule as `useFavorites`: storage is read in an effect, never
 * during render.
 *
 * More than one instance of this hook is alive at a time — the home grid holds
 * one, the command palette holds another — and the browser's `storage` event
 * deliberately does *not* fire in the tab that did the writing. Without a
 * same-tab broadcast, clearing the history from the palette would leave the
 * grid's "Recent" rail listing entries that are already gone from storage. So
 * every write goes through `writeRecent`, which publishes a `CustomEvent`, and
 * every instance answers by re-reading storage: localStorage stays the single
 * source of truth and no instance ever trusts its own stale copy.
 */
const RECENT_CHANGED_EVENT = 'toolbox:recent-changed'

function readRecent(): string[] {
  return readStringList(storageKeys.recent).slice(0, siteConfig.recentLimit)
}

function writeRecent(next: readonly string[]): void {
  writeStringList(storageKeys.recent, [...next])
  window.dispatchEvent(new CustomEvent(RECENT_CHANGED_EVENT))
}

export interface UseRecent {
  recent: string[]
  ready: boolean
  push: (id: string) => void
  clear: () => void
}

export function useRecent(): UseRecent {
  const [recent, setRecent] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setRecent(readRecent())
    setReady(true)

    function sync() {
      setRecent(readRecent())
    }

    function onStorage(event: StorageEvent) {
      // A `null` key means the whole store was cleared, which counts too.
      if (event.key !== null && event.key !== storageKeys.recent) return
      sync()
    }

    // `storage` covers the other tabs, the custom event covers this one.
    window.addEventListener('storage', onStorage)
    window.addEventListener(RECENT_CHANGED_EVENT, sync)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(RECENT_CHANGED_EVENT, sync)
    }
  }, [])

  // Read-modify-write against storage, not against React state: another instance
  // may have moved the list since this one last rendered.
  const push = useCallback((id: string) => {
    const next = [id, ...readRecent().filter((item) => item !== id)]
    writeRecent(next.slice(0, siteConfig.recentLimit))
  }, [])

  const clear = useCallback(() => {
    writeRecent([])
  }, [])

  return { recent, ready, push, clear }
}
