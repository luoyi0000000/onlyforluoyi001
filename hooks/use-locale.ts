'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

import { storageKeys } from '@/config/site'
import { defaultLocale, isLocale, type Locale } from '@/types/i18n'

/**
 * Locale is carried by the URL (`/zh/...`, `/en/...`), which is what makes the
 * two static exports self-describing. This hook reads it back off the path and
 * builds the equivalent path in the other language.
 *
 * An explicit switch is written to localStorage so the language-detecting entry
 * page at `/` honours the choice on the next visit.
 */
export function useLocale(): {
  locale: Locale
  pathWithLocale: (next: Locale) => string
  remember: (next: Locale) => void
} {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const first = segments[0]
  const locale = first !== undefined && isLocale(first) ? first : defaultLocale

  const pathWithLocale = useCallback(
    (next: Locale) => {
      const rest = segments.slice(1)
      return `/${[next, ...rest].join('/')}/`
    },
    [segments],
  )

  const remember = useCallback((next: Locale) => {
    try {
      window.localStorage.setItem(storageKeys.locale, next)
    } catch {
      // Non-persistent session: the URL still carries the language.
    }
  }, [])

  return { locale, pathWithLocale, remember }
}
