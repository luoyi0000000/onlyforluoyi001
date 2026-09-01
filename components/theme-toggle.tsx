'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { SegmentedControl, type SegmentedOption } from '@/components/ui/segmented-control'

const themeModes = ['light', 'dark', 'system'] as const
type ThemeMode = (typeof themeModes)[number]

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value !== undefined && (themeModes as readonly string[]).includes(value)
}

/**
 * Resolved strings, not a `t()` function: this is a client component, and the
 * server can only hand it serializable props. Every switch below follows the
 * same rule.
 */
export interface ThemeToggleLabels {
  group: string
  light: string
  dark: string
  system: string
}

/**
 * Light / dark / system as one radiogroup rather than a cycling icon button:
 * "system" is a real, reachable third state, and the current choice is visible
 * without hovering. next-themes already applied the stored value before first
 * paint, so this only has to catch up after hydration — `ready` keeps the
 * checked pill from flashing on the wrong segment.
 */
export function ThemeToggle({ labels }: { labels: ThemeToggleLabels }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const options: ReadonlyArray<SegmentedOption<ThemeMode>> = [
    { value: 'light', label: labels.light, icon: <Sun aria-hidden="true" className="size-4" /> },
    { value: 'dark', label: labels.dark, icon: <Moon aria-hidden="true" className="size-4" /> },
    {
      value: 'system',
      label: labels.system,
      icon: <Monitor aria-hidden="true" className="size-4" />,
    },
  ]

  const current: ThemeMode = isThemeMode(theme) ? theme : 'system'

  return (
    <SegmentedControl
      label={labels.group}
      options={options}
      value={current}
      onChange={setTheme}
      iconOnly
      ready={mounted}
    />
  )
}
