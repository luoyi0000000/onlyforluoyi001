'use client'

import { siteConfig, storageKeys } from '@/config/site'
import { useHtmlPreference } from '@/hooks/use-html-preference'
import { themeAccents, type ThemeAccent } from '@/types/tool'

export const densities = ['comfortable', 'compact'] as const
export type Density = (typeof densities)[number]

/** Comfortable / compact spacing. Drives the `--d-*` tokens through CSS only. */
export function useDensity() {
  return useHtmlPreference<Density>('data-density', storageKeys.density, densities, 'comfortable')
}

/** Site-wide accent ramp. One attribute, whole-site effect. */
export function useAccent() {
  return useHtmlPreference<ThemeAccent>(
    'data-accent',
    storageKeys.accent,
    themeAccents,
    siteConfig.defaultAccent,
  )
}
