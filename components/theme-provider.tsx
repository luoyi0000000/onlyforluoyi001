'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

import { storageKeys } from '@/config/site'

/**
 * next-themes owns the `.dark` class on <html> and ships its own synchronous
 * pre-paint script, which is what keeps the first frame from flashing white.
 * Accent and density are handled by `PreferenceScript` for the same reason.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={storageKeys.theme}
    >
      {children}
    </NextThemesProvider>
  )
}
