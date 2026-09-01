'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { cn, fill } from '@/lib/utils'

export interface ThemeSwitchLabels {
  /** Accessible name of the control, e.g. "Theme". */
  group: string
  /** Template for the tooltip, e.g. "Switch to {mode}". */
  switchTo: string
  light: string
  dark: string
}

/**
 * The light/dark switch that lives in the header.
 *
 * There was already a three-way light / dark / system control, but it was folded
 * into the appearance menu, so switching themes meant discovering a disclosure
 * button first. Both now exist and neither is redundant: this one is the one-tap
 * answer to "make it light", the menu keeps "follow the system". Flipping this
 * writes an explicit `light` or `dark`, which is what a two-state switch means —
 * a visitor on `system` who touches it has chosen to stop following the system,
 * and the menu's radiogroup moves to match.
 *
 * The knob position and the icon colours are driven by the `dark` class on
 * <html>, not by React state. next-themes writes that class before the first
 * paint, so the very first frame is already correct — a `mounted` gate here
 * would have shown the knob on the light side for one frame to every dark-mode
 * visitor, which is the flash this control exists to avoid.
 *
 * `aria-checked` is the one thing that cannot be done in CSS. It is gated on
 * mount, so the prerendered HTML claims `false` until hydration corrects it.
 * That is the right trade: with scripting off the switch cannot work at all, and
 * with scripting on the window is a few milliseconds.
 *
 * Geometry note: the knob is `50% - 0.25rem` wide and offset by `0.25rem`, so
 * `translate-x-full` lands it exactly `0.25rem` from the other edge whatever the
 * track measures. That is what lets the `coarse:` size change to a 44px target
 * without a second set of numbers.
 */
export function ThemeSwitch({ labels }: { labels: ThemeSwitchLabels }) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'
  const nextMode = isDark ? labels.light : labels.dark

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={labels.group}
      // Suppressed until the stored theme is known, so the tooltip never names
      // the mode the visitor is already in.
      title={mounted ? fill(labels.switchTo, { mode: nextMode }) : undefined}
      onClick={() => {
        // Read the class rather than `resolvedTheme`: it is the thing the
        // visitor can actually see, and it is correct even on the first click
        // after hydration.
        const dark = document.documentElement.classList.contains('dark')
        setTheme(dark ? 'light' : 'dark')
      }}
      className={cn(
        'relative inline-flex h-9 w-16 shrink-0 items-center rounded-full p-1',
        'border border-input glass-inset',
        'transition-[border-color] duration-200 ease-glide',
        'hover:border-foreground/30',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'coarse:h-11 coarse:w-20',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)]',
          'rounded-full bg-primary shadow-e1',
          'transition-transform duration-200 ease-glide dark:translate-x-full',
        )}
      />

      {/* Both glyphs are always painted; only which one sits on the knob
          changes. Drawing one icon and swapping it would resize the row on every
          toggle, and a switch that moves the header is worse than no switch. */}
      <span
        aria-hidden="true"
        className={cn(
          'relative z-10 grid w-1/2 place-items-center',
          'text-primary-foreground transition-colors duration-200 ease-glide',
          'dark:text-muted-foreground',
        )}
      >
        <Sun className="size-4" />
      </span>

      <span
        aria-hidden="true"
        className={cn(
          'relative z-10 grid w-1/2 place-items-center',
          'text-muted-foreground transition-colors duration-200 ease-glide',
          'dark:text-primary-foreground',
        )}
      >
        <Moon className="size-4" />
      </span>
    </button>
  )
}
