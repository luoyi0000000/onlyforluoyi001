/**
 * Hardened localStorage access for the small string lists this site keeps
 * (favourite ids, recent ids).
 *
 * Every call is wrapped: `localStorage` throws outright in Safari private mode
 * and when a browser is configured to block site data, and a preference that
 * cannot be saved must never take the page down with it.
 *
 * Reads are validated, not trusted. The stored value is user-writable — through
 * devtools, a browser extension, or a shared-origin script — so it is treated
 * as untrusted input: anything that is not an array of short, plain strings is
 * discarded rather than partially recovered. Consumers additionally match ids
 * against the registry, so a value that survives this filter still cannot
 * render anything that is not a registered tool.
 */

/** Ids are slugs; anything longer is corruption or an attempt at something. */
const MAX_ID_LENGTH = 64
/** Upper bound on list length, so a runaway writer cannot grow without limit. */
const MAX_ITEMS = 200

export function readStringList(key: string): string[] {
  if (typeof window === 'undefined') return []

  let raw: string | null
  try {
    raw = window.localStorage.getItem(key)
  } catch {
    return []
  }
  if (raw === null) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const clean: string[] = []
  for (const item of parsed) {
    if (typeof item !== 'string') continue
    if (item === '' || item.length > MAX_ID_LENGTH) continue
    if (clean.includes(item)) continue
    clean.push(item)
    if (clean.length >= MAX_ITEMS) break
  }
  return clean
}

export function writeStringList(key: string, value: readonly string[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value.slice(0, MAX_ITEMS)))
  } catch {
    // Storage full or blocked. The in-memory state still works for this visit.
  }
}

export function readString(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeString(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* See writeStringList. */
  }
}

export function removeKey(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* Nothing to do. */
  }
}
